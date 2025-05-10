import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotifications } from "@/context/NotificationsContext";
import axios from "axios";
import { getActiveFlashPromos } from '@/services/flashPromoService';

// Define the prize types
type Prize = {
  id: string;
  name: string;
  color: string;
  probability: number;
  type: 'minor' | 'major' | 'final';
  value: string;
  multiplier?: number;
};

interface GameConfig {
  _id: string;
  name: string;
  gameType: string;
  points: number;
  featured: boolean;
  config?: {
    spinConfig?: {
      includeFreeSpin: boolean;
      includeTryAgain: boolean;
    };
  };
  prizedAssigned?: Array<{
    prizeId: string;
    prizeName: string;
    multiplier?: number;
  }>;
}

interface SpinWheelProps {
  userPoints: number;
  onPointsUpdate: (newPoints: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ userPoints, onPointsUpdate }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const { addNotification } = useNotifications();
  const [spinGame, setSpinGame] = useState<any>(null);
  const [activeFlashPromos, setActiveFlashPromos] = useState<any[]>([]);
  const [hasFreeSpinAvailable, setHasFreeSpinAvailable] = useState(false);
  const [isResetingWheel, setIsResetingWheel] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [playsRemaining, setPlaysRemaining] = useState(3);
  const [playsUsed, setPlaysUsed] = useState(0);

  useEffect(() => {
    fetchGameConfig();
    fetchPrizes();
    fetchActiveFlashPromos();
    fetchRemainingPlays();
  }, []);

  useEffect(() => {
    if (gameConfig) {
      // User can spin if they have enough points OR if they have a free spin available
      setCanSpin(userPoints >= (gameConfig.points || 0) || hasFreeSpinAvailable);
    }
  }, [userPoints, gameConfig, hasFreeSpinAvailable]);

  const fetchGameConfig = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await axios.get('https://forgeph-2.onrender.com/api/games', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      console.log('Games response for SpinWheel:', response.data);
      
      const spinGame = response.data.find(
        (game: GameConfig) => game.gameType === 'SpinTheWheel' && game.featured
      );
      
      console.log('Found spin game:', spinGame);
      
      if (spinGame) {
        setGameConfig(spinGame);
      }
    } catch (error) {
      console.error('Error fetching game configuration:', error);
      addNotification({
        title: "Error",
        message: "Failed to load game configuration",
        type: "system"
      });
    }
  };

  const fetchPrizes = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await axios.get('https://forgeph-2.onrender.com/api/games', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      const spinGame = response.data.find(
        (game: GameConfig) => game.gameType === 'SpinTheWheel' && game.featured
      );
      
      if (spinGame) {
        let wheelPrizes: Prize[] = [];
        
        if (spinGame.prizedAssigned && spinGame.prizedAssigned.length > 0) {
          const assignedPrizes = spinGame.prizedAssigned.map(assignment => ({
            id: assignment.prizeId,
            name: assignment.prizeName || 'Special Prize',
            color: '#2dd4bf', // teal-400 for special prizes
            probability: 0.01,
            type: 'major',
            value: assignment.prizeName || 'Special Prize',
            multiplier: assignment.multiplier
          }));
          
          wheelPrizes = [...assignedPrizes];
        }
        
        const remainingSlotsCount = 8 - wheelPrizes.length;
        
        const defaultPrizesPool: Prize[] = [
          {
            id: 'points-4',
            name: '4 Points',
            color: '#0d9488', // teal-600
            probability: 0.20,
            type: 'minor',
            value: '4'
          },
          {
            id: 'points-10',
            name: '10 Points',
            color: '#0891b2', // cyan-600
            probability: 0.18,
            type: 'minor',
            value: '10'
          },
          {
            id: 'points-15',
            name: '15 Points',
            color: '#06b6d4', // cyan-500
            probability: 0.15,
            type: 'minor',
            value: '15'
          },
          {
            id: 'try-again',
            name: 'Try Again',
            color: '#134e4a', // teal-900 (darker for try again)
            probability: 0.25,
            type: 'minor',
            value: 'Try Again'
          },
          {
            id: 'points-20',
            name: '20 Points',
            color: '#22d3ee', // cyan-400
            probability: 0.10,
            type: 'minor',
            value: '20'
          }
        ];

        if (spinGame.config?.spinConfig?.includeFreeSpin) {
          defaultPrizesPool.push({
            id: 'free-spin',
            name: 'Free Spin',
            color: '#7e22ce', // purple-700 - to distinguish it
            probability: 0.12,
            type: 'minor',
            value: 'Free Spin'
          });
        }

        const shuffledDefaults = [...defaultPrizesPool].sort(() => Math.random() - 0.5);
        const selectedDefaultPrizes = shuffledDefaults.slice(0, remainingSlotsCount);
        
        wheelPrizes = [...wheelPrizes, ...selectedDefaultPrizes];
        
        // Ensure we always have 8 prizes
        while (wheelPrizes.length < 8) {
          wheelPrizes.push({
            id: `points-${wheelPrizes.length}`,
            name: '5 Points',
            color: getRandomColor(),
            probability: 0.1,
            type: 'minor',
            value: '5'
          });
        }
        
        // Normalize probabilities
        const totalProbability = wheelPrizes.reduce((sum, prize) => sum + prize.probability, 0);
        wheelPrizes = wheelPrizes.map(prize => ({
          ...prize,
          probability: prize.probability / totalProbability
        }));
        
        setPrizes(wheelPrizes);
      }
    } catch (error) {
      console.error('Error fetching prizes:', error);
      addNotification({
        title: "Error",
        message: "Failed to load prizes",
        type: "system"
      });
      // Set default prizes in case of error
      setPrizes([]);
    }
  };

  const fetchActiveFlashPromos = async () => {
    try {
      const activePromos = await getActiveFlashPromos();
      console.log('Active flash promos:', activePromos);
      setActiveFlashPromos(activePromos);
    } catch (error) {
      console.error('Error fetching active flash promos:', error);
    }
  };

  const getRandomColor = () => {
    // Updated colors to match the website's teal/cyan/dark theme
    const colors = [
      '#0d9488', // teal-600
      '#0891b2', // cyan-600
      '#0e7490', // cyan-700
      '#164e63', // cyan-900
      '#134e4a', // teal-900
      '#2dd4bf', // teal-400
      '#22d3ee', // cyan-400
      '#06b6d4'  // cyan-500
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Add a helper function to get the current multiplier based on active promos
  const getFlashPromoMultiplier = () => {
    if (!activeFlashPromos || activeFlashPromos.length === 0) {
      return 1; // Default multiplier if no active promos
    }

    // Get the highest multiplier from active promos
    return Math.max(
      ...activeFlashPromos.map(promo => promo.multiplier || 1)
    );
  };

  const fetchRemainingPlays = async () => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!storedUser) {
        addNotification({
          title: "Error",
          message: "User data not found. Please try logging in again.",
          type: "system"
        });
        return;
      }

      const userData = JSON.parse(storedUser);
      const userId = userData._id || userData.id;
      
      if (!userId) {
        addNotification({
          title: "Error",
          message: "Invalid user data. Please try logging in again.",
          type: "system"
        });
        return;
      }
      
      const response = await axios.get(`https://forgeph-2.onrender.com/api/users/game-plays/spinWheel/${userId}`);
      
      if (response.data.success) {
        setPlaysRemaining(response.data.playsRemaining);
        setPlaysUsed(response.data.playsUsed);
      }
    } catch (error) {
      console.error('Error fetching remaining plays:', error);
    }
  };

  const spinWheel = async () => {
    if (isSpinning) return;
    
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!storedUser) {
        addNotification({
          title: "Error",
          message: "User data not found. Please try logging in again.",
          type: "system"
        });
        return;
      }

      const userData = JSON.parse(storedUser);
      const userId = userData._id || userData.id;
      
      if (!userId) {
        addNotification({
          title: "Error",
          message: "Invalid user data. Please try logging in again.",
          type: "system"
        });
        return;
      }
      
      // Check if user has spins remaining
      if (playsRemaining <= 0) {
        addNotification({
          title: "Daily Limit Reached",
          message: "You have reached your daily limit of 3 spins. Please try again tomorrow.",
          type: "system"
        });
        return;
      }
      
      if (!gameConfig) {
        addNotification({
          title: "Error",
          message: "Game configuration not found. Please refresh the page.",
          type: "system"
        });
        return;
      }
      
      const pointsToDeduct = gameConfig.points || 5;
      
      if (userPoints < pointsToDeduct) {
        addNotification({
          title: "Error",
          message: `You need ${pointsToDeduct} points to spin the wheel`,
          type: "system"
        });
        return;
      }
      
      // Deduct points for spinning
      const deductResponse = await axios.post('https://forgeph-2.onrender.com/api/users/points/deduct', {
        points: pointsToDeduct,
        userId
      });
      
      if (!deductResponse.data.success) {
        addNotification({
          title: "Error",
          message: "Failed to deduct points. Please try again.",
          type: "system"
        });
        return;
      }
      
      // Update points in UI
      onPointsUpdate(userPoints - pointsToDeduct);
      
      // Increment play count (non-free spin)
      const incrementResponse = await axios.post(`https://forgeph-2.onrender.com/api/users/game-plays/spinWheel/increment`, {
        userId,
        isFreeSpin: false
      });
      
      if (incrementResponse.data.success) {
        setPlaysRemaining(incrementResponse.data.playsRemaining);
        setPlaysUsed(incrementResponse.data.playsUsed);
      }
      
      // Start spinning
      setIsSpinning(true);
      
      // Enhanced precision slice determination based on the wheel position
      // The wheel rotates, not the pointer, so we need to determine which slice is at the top pointer position
      
      // Get a more random distribution based on actual probabilities
      const totalWeight = prizes.reduce((sum, prize) => sum + prize.probability, 0);
      const normalizedProbabilities = prizes.map(prize => prize.probability / totalWeight);
      
      // Create cumulative probability array
      const cumulativeProbabilities = [];
      let cumulative = 0;
      for (const prob of normalizedProbabilities) {
        cumulative += prob;
        cumulativeProbabilities.push(cumulative);
      }
      
      // Generate random value between 0 and 1
      const random = Math.random();
      
      // Find the index where the random value falls
      let selectedIndex = 0;
      for (let i = 0; i < cumulativeProbabilities.length; i++) {
        if (random <= cumulativeProbabilities[i]) {
          selectedIndex = i;
          break;
        }
      }
      
      // For debugging
      console.log(`Selected index: ${selectedIndex}, Prize: ${prizes[selectedIndex].name}`);
      
      const prize = prizes[selectedIndex];
      setSelectedPrize(prize);
      
      // Calculate rotation to land exactly on the selected prize
      const sliceDegrees = 360 / prizes.length;
      // For top pointer (0 degrees), we need to align the middle of the slice to the top
      const targetDegree = 360 - (selectedIndex * sliceDegrees);
      const extraAdjustment = sliceDegrees / 2; // Center the prize in the slice
      const spins = 5; // Number of full rotations
      const finalRotation = (spins * 360) + targetDegree - extraAdjustment;
      
      // Reset rotation with a visual-only transition
      setIsResetingWheel(true);
      setRotation(0);
      
      // Use setTimeout with a small delay to ensure the rotation reset is applied
      setTimeout(() => {
        // Set the new rotation
        setRotation(finalRotation);
        // Allow the transition to be applied from the JSX
        setIsResetingWheel(false);
        
        // Add a listener to determine which slice is at the pointer when rotation ends
        const handleAnimationEnd = () => {
          if (wheelRef.current) {
            // Calculate actual final position based on current rotation
            const currentRotation = rotation % 360;
            // Normalize to positive values (0-360)
            const normalizedRotation = currentRotation < 0 ? currentRotation + 360 : currentRotation;
            
            // Calculate the slice at pointer (top = 0 degrees)
            const pointerPosition = 0;
            const rotationDifference = (normalizedRotation + pointerPosition) % 360;
            const calculatedIndex = Math.floor(rotationDifference / sliceDegrees) % prizes.length;
            
            // Log for debugging - should match the selected index above
            console.log(`Animation ended. Calculated landing index: ${calculatedIndex}, Prize: ${prizes[calculatedIndex].name}`);
            
            // This is a verification step - the final prize should match our selected prize
            const verifiedPrize = prizes[calculatedIndex];
            if (verifiedPrize.id !== prize.id) {
              console.warn('Prize verification mismatch!', 
                { expected: prize.name, calculated: verifiedPrize.name });
            }
            
            // Clean up listener
            wheelRef.current.removeEventListener('transitionend', handleAnimationEnd);
          }
        };
        
        // Add transition end listener to verify the landing
        if (wheelRef.current) {
          wheelRef.current.addEventListener('transitionend', handleAnimationEnd);
        }
      }, 50);
      
      // After the animation is complete, process the prize
      setTimeout(async () => {
        setIsSpinning(false);
        
        // Add landing highlight effect
        if (wheelRef.current) {
          // Add a pulsing glow to emphasize the winning slice
          const landingHighlight = document.createElement('div');
          landingHighlight.className = 'absolute w-24 h-24 left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 rounded-full z-[-1]';
          landingHighlight.style.background = 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(45,212,191,0.2) 40%, rgba(0,0,0,0) 70%)';
          landingHighlight.style.animation = 'pulse 1.5s ease-in-out infinite';
          
          const keyframes = `
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
              50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
            }
          `;
          
          const style = document.createElement('style');
          style.textContent = keyframes;
          document.head.appendChild(style);
          
          wheelRef.current.parentElement?.appendChild(landingHighlight);
          
          // Clean up after showing the result
          setTimeout(() => {
            landingHighlight.remove();
            style.remove();
          }, 5000);
        }
        
        setShowResult(true);
        
        // Process what the user won
        try {
          // Calculate points won based on the prize
          if (prize.id === 'free-spin') {
            // For free spin, we don't need to increment the counter
            addNotification({
              title: "Free Spin!",
              message: "You won a free spin! It won't count toward your daily limit.",
              type: "points"
            });
            
            // Register the play but mark it as a free spin
            await axios.post(`https://forgeph-2.onrender.com/api/users/game-plays/spinWheel/increment`, {
              userId,
              isFreeSpin: true  // Mark as free spin
            });
          } else if (prize.value === 'Try Again') {
            addNotification({
              title: "Try Again",
              message: "Better luck next time!",
              type: "system"
            });
          } else if (prize.type === 'minor' && !isNaN(Number(prize.value))) {
            // Apply flash promo multiplier for minor prizes
            const basePoints = Number(prize.value);
            const multiplier = getFlashPromoMultiplier();
            const totalPoints = basePoints * multiplier;
            
            // Add points to user's account
            const addResponse = await axios.post('https://forgeph-2.onrender.com/api/users/points/add', {
              points: totalPoints,
              userId: userId
            }, {
              headers: { 
                'Content-Type': 'application/json'
              }
            });

            if (addResponse.data.success) {
              // Calculate new point total (starting points + won points, free spin didn't deduct)
              const newPoints = hasFreeSpinAvailable 
                ? userPoints + totalPoints 
                : userPoints - pointsToDeduct + totalPoints;
              
              // Update points through parent component
              onPointsUpdate(newPoints);
              
              // Different message based on whether a multiplier was applied
              if (multiplier > 1) {
                addNotification({
                  title: "Points Won with Multiplier!",
                  message: `You've won ${basePoints} points x${multiplier} = ${totalPoints} points!`,
                  type: "points"
                });
              } else {
                addNotification({
                  title: "Points Won!",
                  message: `You've won ${totalPoints} points!`,
                  type: "points"
                });
              }
            }
          } else if (prize.type === 'major') {
            // Handle major prize (assigned from admin)
            await axios.post('https://forgeph-2.onrender.com/api/users/prizes/claim', {
              userId: userId,
              prizeId: prize.id,
              prizeName: prize.name,
              gameId: gameConfig._id
            }, {
              headers: { 
                'Content-Type': 'application/json'
              }
            });
            
            addNotification({
              title: "Major Prize Won!",
              message: `Congratulations! You've won ${prize.name}!`,
              type: "points"
            });

            // Trigger user data refresh
            window.dispatchEvent(new Event('userUpdated'));
          }
          
          // Update points display in header
          window.dispatchEvent(new Event('userUpdated'));
          
        } catch (error) {
          console.error('Error processing prize:', error);
          addNotification({
            title: "Error",
            message: "Failed to process your prize. Please contact support.",
            type: "system"
          });
        }
      }, 5000);
    } catch (error) {
      console.error('Error spinning wheel:', error);
      addNotification({
        title: "Error",
        message: "Failed to spin the wheel. Please try again.",
        type: "system"
      });
      setIsSpinning(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    
    // Reset wheel position after dialog closes with a silent transition
    setIsResetingWheel(true);
    setTimeout(() => {
      setRotation(0);
      setTimeout(() => {
        setIsResetingWheel(false);
      }, 50);
    }, 300); // Wait for dialog close animation
  };

  // Handle wheel reset on mount and when necessary
  useEffect(() => {
    return () => {
      // Cleanup the wheel state when component unmounts
      setRotation(0);
      setIsResetingWheel(false);
    };
  }, []);

  const sliceAngle = 360 / prizes.length;

  // Update the FlashPromoIndicator component
  const FlashPromoIndicator = () => {
    const multiplier = getFlashPromoMultiplier();
    
    if (multiplier <= 1) return null;
    
    return (
      <div className="mb-4 bg-gradient-to-r from-amber-500 to-pink-500 text-white px-4 py-2 rounded-md text-base font-bold inline-flex items-center animate-pulse">
        <span className="mr-2 text-xl">⚡</span> 
        {multiplier}x Points Multiplier Active!
      </div>
    );
  };

  // Add this method to be used in the UI
  const getSpinButtonText = () => {
    if (isSpinning) return 'SPINNING...';
    if (playsRemaining <= 0) return 'TRY AGAIN TOMORROW';
    return 'SPIN';
  };

  const getSpinButtonClass = () => {
    if (isSpinning || !canSpin || playsRemaining <= 0) {
      return 'bg-xforge-darkgray text-xforge-gray cursor-not-allowed';
    }
    return 'bg-gradient-to-r from-xforge-teal to-cyan-500 hover:brightness-110 text-white transform transition-all duration-200 hover:scale-105 active:scale-95';
  };

  if (!gameConfig || prizes.length === 0) {
    return (
      <div className="flex flex-col items-center max-w-4xl mx-auto my-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Spin The Wheel is currently unavailable
          </h2>
          <p className="text-xforge-gray">
            Please check back later when the game is configured and featured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto mb-16 px-4">
      {/* Add daily spins counter above the title */}
      <div className="text-center mt-2 mb-1">
        <p className="text-xforge-gray">
          <span className="font-semibold text-white">Daily Spins:</span> {playsRemaining} remaining
          {playsRemaining <= 0 && <span className="text-red-500 block mt-1">Daily limit reached. Resets at midnight.</span>}
        </p>
      </div>
      
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-white mb-2 inline-block border-b-2 border-xforge-teal pb-2">
          Spin <span className="text-xforge-teal">To Win</span>
        </h3>
        <p className="text-xforge-gray max-w-lg mx-auto">
          Spin the wheel for a chance to win prizes and points!
          {gameConfig && <span> Each spin costs {gameConfig.points} points.</span>}
        </p>
      </div>
      
      <div className="relative w-80 h-80 mx-auto">
        {/* Top pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[40%] z-10 flex flex-col items-center">
          {/* Landing zone marker */}
          <div className="h-6 w-20 bg-gradient-to-b from-xforge-teal to-transparent rounded-t-md"></div>
          {/* Pointer element */}
          <div className="w-16 h-10 flex flex-col items-center justify-center">
            <div className="w-2 h-8 bg-gradient-to-b from-transparent to-xforge-teal"></div>
            <div className="w-8 h-8 bg-xforge-teal rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-white transform translate-y-[2px]"></div>
            </div>
          </div>
        </div>
        
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-8 border-xforge-dark/80 overflow-hidden"
             style={{ boxShadow: 'inset 0 0 20px rgba(20, 184, 166, 0.2)' }}>
        </div>
        
        <div className="relative">
          {/* Prize wheel with improved styling */}
          <div 
            ref={wheelRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_30px_rgba(20,184,166,0.3)]"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isResetingWheel ? 'none' : 'transform 5s cubic-bezier(0.17, 0.67, 0.16, 0.99)',
              boxShadow: '0 0 30px rgba(20, 184, 166, 0.3), inset 0 0 20px rgba(20, 184, 166, 0.2)'
            }}
          >
            {/* Create SVG wheel with proper pie slices */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {Array.isArray(prizes) && prizes.length > 0 ? (
                prizes.map((prize, index) => {
                  // Calculate slice angles
                  const startAngle = index * sliceAngle;
                  const endAngle = startAngle + sliceAngle;
                  
                  // Convert to radians
                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);
                  
                  // Calculate points
                  const x1 = 50 + 50 * Math.cos(startRad);
                  const y1 = 50 + 50 * Math.sin(startRad);
                  const x2 = 50 + 50 * Math.cos(endRad);
                  const y2 = 50 + 50 * Math.sin(endRad);
                  
                  // Calculate midpoint for text positioning
                  const midAngleRad = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
                  const textPathRadius = 35;
                  
                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                  const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                  
                  const textPathId = `textPath-${prize.id}`;
                  const textArcStart = 50 + textPathRadius * Math.cos(startRad);
                  const textArcStartY = 50 + textPathRadius * Math.sin(startRad);
                  const textArcEnd = 50 + textPathRadius * Math.cos(endRad);
                  const textArcEndY = 50 + textPathRadius * Math.sin(endRad);
                  
                  const textPathD = `M ${textArcStart} ${textArcStartY} A ${textPathRadius} ${textPathRadius} 0 ${largeArcFlag} 1 ${textArcEnd} ${textArcEndY}`;
                  
                  // Add gradient overlay to make the wheel colors more cohesive
                  const gradientId = `gradient-${index}`;
                  
                  // Check if this is a special assigned prize
                  const isSpecialPrize = prize.type === 'major';
                  
                  return (
                    <g key={prize.id}>
                      <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={prize.color} stopOpacity="1" />
                          <stop offset="100%" stopColor={prize.color} stopOpacity="0.7" />
                        </linearGradient>
                        
                        {/* Add special effects for assigned prizes */}
                        {isSpecialPrize && (
                          <>
                            <filter id={`glow-${index}`} x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="2" result="blur" />
                              <feFlood floodColor="#fff" result="glow-color" />
                              <feComposite in="glow-color" in2="blur" operator="in" result="glow-blur" />
                              <feComposite in="SourceGraphic" in2="glow-blur" operator="over" />
                            </filter>
                            
                            <linearGradient id={`special-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1">
                                <animate attributeName="stop-color" 
                                         values="#2dd4bf; #9d29bc; #2dd4bf" 
                                         dur="3s" 
                                         repeatCount="indefinite" />
                              </stop>
                              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.8">
                                <animate attributeName="stop-color" 
                                         values="#0d9488; #7e22ce; #0d9488" 
                                         dur="3s" 
                                         repeatCount="indefinite" />
                              </stop>
                            </linearGradient>
                          </>
                        )}
                      </defs>
                      
                      {/* For special prizes, add a glowing backing */}
                      {isSpecialPrize && (
                        <path
                          d={path}
                          fill={`url(#special-gradient-${index})`}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          style={{ filter: `url(#glow-${index})` }}
                        />
                      )}
                      
                      <path
                        d={path}
                        fill={isSpecialPrize ? `url(#special-gradient-${index})` : `url(#${gradientId})`}
                        stroke={isSpecialPrize ? "#ffffff" : "#0f172a"}
                        strokeWidth={isSpecialPrize ? "1.2" : "0.8"}
                        style={isSpecialPrize ? { 
                          filter: `url(#glow-${index})`,
                        } : {}}
                      />
                      
                      <path
                        id={textPathId}
                        d={textPathD}
                        fill="none"
                        stroke="none"
                      />
                      
                      {/* Add subtle star icons to special prizes */}
                      {isSpecialPrize && (
                        <>
                          <circle 
                            cx={50 + 25 * Math.cos(midAngleRad)} 
                            cy={50 + 25 * Math.sin(midAngleRad)} 
                            r="1.5" 
                            fill="#ffffff"
                          >
                            <animate 
                              attributeName="opacity" 
                              values="1;0.3;1" 
                              dur="1.5s" 
                              repeatCount="indefinite" 
                            />
                          </circle>
                          <circle 
                            cx={50 + 20 * Math.cos(midAngleRad + 0.2)} 
                            cy={50 + 20 * Math.sin(midAngleRad + 0.2)} 
                            r="1" 
                            fill="#ffffff"
                          >
                            <animate 
                              attributeName="opacity" 
                              values="0.3;1;0.3" 
                              dur="2s" 
                              repeatCount="indefinite" 
                            />
                          </circle>
                        </>
                      )}
                      
                      <text 
                        fill="white" 
                        fontSize={isSpecialPrize ? "4" : "3.5"}
                        fontWeight="bold"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{ 
                          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))',
                          textShadow: isSpecialPrize ? '0 0 5px rgba(255,255,255,0.8)' : 'none'
                        }}
                      >
                        <textPath 
                          href={`#${textPathId}`} 
                          startOffset="50%"
                        >
                          {prize.name}
                        </textPath>
                      </text>
                    </g>
                  );
                })
              ) : (
                // Default wheel segments if no prizes
                Array.from({ length: 8 }).map((_, index) => {
                  const startAngle = index * 45;
                  const endAngle = startAngle + 45;
                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);
                  const x1 = 50 + 50 * Math.cos(startRad);
                  const y1 = 50 + 50 * Math.sin(startRad);
                  const x2 = 50 + 50 * Math.cos(endRad);
                  const y2 = 50 + 50 * Math.sin(endRad);
                  
                  return (
                    <g key={index}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill="#1a1a1a"
                        stroke="#0f172a"
                        strokeWidth="0.8"
                      />
                    </g>
                  );
                })
              )}
              
              {/* Center circle */}
              <circle cx="50" cy="50" r="12" fill="#0d9488" />
              <circle cx="50" cy="50" r="10" fill="#0e7490" />
              <circle cx="50" cy="50" r="8" fill="#06b6d4" />
              <foreignObject x="40" y="40" width="20" height="20">
                <div className="flex items-center justify-center w-full h-full">
                  <Sparkles className="text-white h-full w-full" />
                </div>
              </foreignObject>
            </svg>
          </div>
          
          {/* Move button to absolute position at bottom center of wheel */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 z-10">
            <Button
              size="lg"
              onClick={spinWheel}
              disabled={isSpinning || !canSpin || playsRemaining <= 0}
              className={`px-8 shadow-lg relative overflow-hidden ${getSpinButtonClass()}`}
            >
              <div className="flex items-center">
                {isSpinning ? (
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-dotted rounded-full border-current"></span>
                ) : (
                  <span className="mr-2">🎯</span>
                )}
                {getSpinButtonText()}
              </div>
              
              {!canSpin && gameConfig && playsRemaining > 0 && (
                <div className="text-xs font-normal mt-1">Need {gameConfig.points} points</div>
              )}
              
              {playsRemaining <= 0 && (
                <div className="text-xs font-normal mt-1">Daily limit reached</div>
              )}
            </Button>
          </div>
        </div>
        
        {/* Result Dialog */}
        <Dialog open={showResult} onOpenChange={setShowResult}>
          <DialogContent className="bg-gradient-to-br from-xforge-dark via-xforge-darkgray to-black border border-xforge-teal/30 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center">
                {selectedPrize?.value === 'Try Again' ? (
                  <>Better luck next time!</>
                ) : (
                  <>
                    <Sparkles className="text-xforge-teal mr-2 h-6 w-6" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">
                      Congratulations!
                    </span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-xforge-gray">
                {selectedPrize?.value === 'Try Again' ? 'Spin again to try your luck!' : "You've won a prize from the wheel!"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrize && (
              <div className="py-6 flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-${selectedPrize.color === '#7e22ce' ? 'purple-600' : 'xforge-teal'} to-${selectedPrize.color === '#7e22ce' ? 'fuchsia-700' : 'cyan-600'} shadow-glow`}>
                  <div className="w-20 h-20 rounded-full border-2 border-white bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{selectedPrize.name}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400 mb-2">
                  {selectedPrize.name}
                </h3>
                
                {selectedPrize.type === 'minor' && !isNaN(Number(selectedPrize.value)) && (
                  <p className="text-xforge-gray text-center">
                    You've won <span className="text-xforge-teal font-bold">{selectedPrize.value} points</span>! 
                    These have been added to your account.
                  </p>
                )}
                {selectedPrize.value === 'Free Spin' && (
                  <p className="text-xforge-gray text-center">
                    Your next spin is <span className="text-purple-400 font-bold">free</span>! 
                    No points will be deducted.
                  </p>
                )}
                {selectedPrize.value === 'Try Again' && (
                  <p className="text-xforge-gray text-center">
                    No prize this time. Try again with another spin!
                  </p>
                )}
                {selectedPrize.type === 'major' && (
                  <p className="text-xforge-gray text-center">
                    You've won a <span className="text-xforge-teal font-bold">special prize</span>! 
                    Check your rewards inventory.
                  </p>
                )}
                
                <Button 
                  onClick={closeResult} 
                  className="mt-6 bg-gradient-to-r from-xforge-teal to-cyan-500 text-xforge-dark hover:brightness-110 shadow-glow"
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SpinWheel;