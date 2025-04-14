import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotifications } from "@/context/NotificationsContext";
import axios from "axios";

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
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGameConfig();
    fetchPrizes();
  }, []);

  useEffect(() => {
    if (gameConfig) {
      setCanSpin(userPoints >= (gameConfig.points || 0));
    }
  }, [userPoints, gameConfig]);

  const fetchGameConfig = async () => {
    try {
      const response = await axios.get('/api/games');
      const spinGame = response.data.find(
        (game: GameConfig) => game.gameType === 'SpinTheWheel' && game.featured
      );
      
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
      const response = await axios.get('/api/games');
      const spinGame = response.data.find(
        (game: GameConfig) => game.gameType === 'SpinTheWheel' && game.featured
      );
      
      if (spinGame) {
        let wheelPrizes: Prize[] = [];
        
        if (spinGame.prizedAssigned && spinGame.prizedAssigned.length > 0) {
          const assignedPrizes = spinGame.prizedAssigned.map(assignment => ({
            id: assignment.prizeId,
            name: assignment.prizeName || 'Special Prize',
            color: getRandomColor(),
            probability: 0.15,
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
            color: '#f97316',
            probability: 0.20,
            type: 'minor',
            value: '4'
          },
          {
            id: 'points-10',
            name: '10 Points',
            color: '#8b5cf6',
            probability: 0.15,
            type: 'minor',
            value: '10'
          },
          {
            id: 'points-15',
            name: '15 Points',
            color: '#06b6d4',
            probability: 0.12,
            type: 'minor',
            value: '15'
          },
          {
            id: 'try-again',
            name: 'Try Again',
            color: '#f43f5e',
            probability: 0.20,
            type: 'minor',
            value: 'Try Again'
          },
          {
            id: 'points-20',
            name: '20 Points',
            color: '#84cc16',
            probability: 0.10,
            type: 'minor',
            value: '20'
          }
        ];

        if (spinGame.config?.spinConfig?.includeFreeSpin) {
          defaultPrizesPool.push({
            id: 'free-spin',
            name: 'Free Spin',
            color: '#d946ef',
            probability: 0.10,
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

  const getRandomColor = () => {
    const colors = [
      '#f97316', '#8b5cf6', '#06b6d4', '#ec4899',
      '#84cc16', '#eab308', '#f43f5e', '#d946ef'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning || !gameConfig) return;
    
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
      console.log("User data from storage:", userData);

      // Check for _id first, then id
      const userId = userData._id || userData.id;
      if (!userId) {
        addNotification({
          title: "Error",
          message: "Invalid user data. Please try logging in again.",
          type: "system"
        });
        return;
      }

      const pointsToDeduct = gameConfig.points || 0;
      
      // Only proceed if user has enough points
      if (userPoints < pointsToDeduct) {
        addNotification({
          title: "Error",
          message: `You need ${pointsToDeduct} points to play`,
          type: "system"
        });
        return;
      }

      // Deduct points for spinning
      const deductResponse = await axios.post('/api/users/points/deduct', {
        points: pointsToDeduct,
        userId: userId
      }, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (deductResponse.data.success) {
        onPointsUpdate(userPoints - pointsToDeduct);
        setIsSpinning(true);
        
        // Weighted random selection based on probability
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedIndex = 0;
        
        for (let i = 0; i < prizes.length; i++) {
          cumulativeProbability += prizes[i].probability;
          if (random <= cumulativeProbability) {
            selectedIndex = i;
            break;
          }
        }
        
        const prize = prizes[selectedIndex];
        setSelectedPrize(prize);
        
        // Calculate rotation to land exactly on the selected prize
        const sliceDegrees = 360 / prizes.length;
        const targetDegree = (360 - (selectedIndex * sliceDegrees) + 90) % 360; // Add 90 degrees to align with right side
        const spins = 5; // Number of full rotations
        const finalRotation = (spins * 360) + targetDegree + 360; // Add extra rotation to ensure continuous spinning
        
        // Reset rotation first to allow multiple spins
        setRotation(rotation % 360);
        
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
          setRotation(finalRotation);
        });
        
        // After the animation is complete, process the prize
        setTimeout(async () => {
          setIsSpinning(false);
          setShowResult(true);
          
          try {
            // Handle different prize types
            if (prize.value === 'Free Spin') {
              // No need to deduct points for the next spin
              setCanSpin(true);
              addNotification({
                title: "Free Spin!",
                message: "You've won a free spin! Your next spin won't cost any points.",
                type: "points"
              });
            } else if (prize.value === 'Try Again') {
              addNotification({
                title: "Try Again",
                message: "Better luck next time!",
                type: "system"
              });
            } else if (prize.type === 'minor' && !isNaN(Number(prize.value))) {
              // Add points to user's account
              const addResponse = await axios.post('/api/users/points/add', {
                points: Number(prize.value),
                userId: userId
              }, {
                headers: { 
                  'Content-Type': 'application/json'
                }
              });

              if (addResponse.data.success) {
                // Update points through parent component
                onPointsUpdate(userPoints - pointsToDeduct + Number(prize.value));
                
                addNotification({
                  title: "Points Won!",
                  message: `You've won ${prize.value} points!`,
                  type: "points"
                });
              }
            } else if (prize.type === 'major') {
              // Handle major prize (assigned from admin)
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
              const userData = JSON.parse(storedUser || '{}');
              
              await axios.post('/api/users/prizes/claim', {
                userId: userData._id || userData.id,
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
      }
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
  };

  const sliceAngle = 360 / prizes.length;

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
    <div className="flex flex-col items-center max-w-4xl mx-auto my-16 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 inline-block border-b-2 border-xforge-teal pb-2">
          Spin to <span className="text-xforge-teal">Win</span>
        </h2>
        <p className="text-xforge-gray max-w-lg mx-auto mb-6">
          Try your luck with our prize wheel! {gameConfig.points} points required per spin.
          You have {userPoints} points available.
        </p>
      </div>
      
      <div className="relative">
        {/* Wheel pointer and landing marker - now on the right side */}
        <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-0 h-0 border-t-[15px] border-b-[15px] border-r-[30px] border-t-transparent border-b-transparent border-r-xforge-teal mx-auto filter drop-shadow-lg"></div>
            <div className="absolute left-[-2px] top-1/2 transform -translate-y-1/2 h-1 w-8 bg-xforge-teal/50"></div>
          </div>
        </div>

        {/* Landing position markers - adjusted for right side */}
        <div className="absolute top-0 left-1/2 w-[calc(100%+16px)] h-[calc(100%+16px)] -translate-x-1/2 -translate-y-2 pointer-events-none">
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (index * 5) + 90; // Add 90 degrees to align with right side
            const radius = 160; // Adjust based on wheel size
            const x = radius * Math.cos(angle * (Math.PI / 180));
            const y = radius * Math.sin(angle * (Math.PI / 180));
            return (
              <div
                key={`marker-${index}`}
                className="absolute w-2 h-2 rounded-full bg-xforge-teal/30"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            );
          })}
        </div>
        
        {/* Prize wheel - update initial rotation to align with right side */}
        <div 
          ref={wheelRef}
          className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-xforge-teal/30 shadow-lg"
          style={{ 
            transform: `rotate(${rotation - 90}deg)`, // Subtract 90 degrees to align with right side
            transition: isSpinning ? 'transform 5s cubic-bezier(0.32, 0, 0.16, 1)' : 'none'
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
                
                return (
                  <g key={prize.id}>
                    <path
                      d={path}
                      fill={prize.color}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                    
                    <path
                      id={textPathId}
                      d={textPathD}
                      fill="none"
                      stroke="none"
                    />
                    
                    <text 
                      fill="white" 
                      fontSize="3.5"
                      fontWeight="bold"
                      dominantBaseline="middle"
                      textAnchor="middle"
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
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              })
            )}
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="12" fill="#06b6d4" />
            <foreignObject x="40" y="40" width="20" height="20">
              <div className="flex items-center justify-center w-full h-full">
                <Sparkles className="text-xforge-dark h-full w-full" />
              </div>
            </foreignObject>
          </svg>
        </div>
        
        <Button
          onClick={spinWheel}
          disabled={!canSpin || isSpinning}
          size="lg"
          className={`mt-8 px-8 py-6 text-lg font-bold ${
            !canSpin ? 'bg-xforge-darkgray text-xforge-gray cursor-not-allowed' : 
            'bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark hover:brightness-110'
          }`}
        >
          {isSpinning ? 'Spinning...' : canSpin ? 'SPIN THE WHEEL' : `Need ${gameConfig.points - userPoints} more points to spin`}
        </Button>
      </div>
      
      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-gradient-to-br from-xforge-dark to-xforge-darkgray border border-xforge-teal/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedPrize?.value === 'Try Again' ? 'Better luck next time!' : 'Congratulations!'}
            </DialogTitle>
            <DialogDescription className="text-xforge-gray">
              {selectedPrize?.value === 'Try Again' ? 'Spin again to try your luck!' : "You've won a prize from the wheel!"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrize && (
            <div className="py-6 flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4`} style={{ background: selectedPrize.color }}>
                <span className="text-white font-bold">{selectedPrize.name}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{selectedPrize.name}</h3>
              {selectedPrize.type === 'minor' && !isNaN(Number(selectedPrize.value)) && (
                <p className="text-xforge-gray text-center">You've won {selectedPrize.value} points! These have been added to your account.</p>
              )}
              {selectedPrize.value === 'Free Spin' && (
                <p className="text-xforge-gray text-center">Your next spin is free! No points will be deducted.</p>
              )}
              {selectedPrize.value === 'Try Again' && (
                <p className="text-xforge-gray text-center">No prize this time. Try again with another spin!</p>
              )}
              {selectedPrize.type === 'major' && (
                <p className="text-xforge-gray text-center">You've won a special prize! Check your rewards inventory.</p>
              )}
              
              <Button 
                onClick={closeResult} 
                className="mt-6 bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark hover:brightness-110"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpinWheel;