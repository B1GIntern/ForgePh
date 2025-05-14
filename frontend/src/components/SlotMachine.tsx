import React, { useState, useRef, useEffect, useCallback } from "react";
import { DollarSign, CircleDot, Coins, Puzzle, Medal, Gem, Trophy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotifications } from "@/context/NotificationsContext";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import * as gameService from "../services/gameService";
import { GameConfig } from "../services/gameService";

// Define keyframes and animations
const slotMachineStyles = `
@keyframes slot-spin {
  0% { transform: translateY(0); }
  100% { transform: translateY(-1000px); }
}

@keyframes bounce-once {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slot-spin {
  animation: slot-spin 3s linear infinite;
}

.animate-bounce-once {
  animation: bounce-once 0.5s ease-in-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

.lever-pulled {
  transform-origin: bottom center;
  animation: lever-pull 0.5s ease-out forwards;
}

@keyframes lever-pull {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(45deg); }
  100% { transform: rotate(0deg); }
}

.reel-container {
  height: 8rem;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
}

.reel {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  left: 0;
  right: 0;
}
`;

// Define the slot symbols
type Symbol = {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  value: number;
  isSpecialPrize?: boolean;
};

interface SlotMachineProps {
  userPoints: number;
  onPointsUpdate: (newPoints: number) => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ userPoints, onPointsUpdate }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [symbols, setSymbols] = useState<Symbol[][]>([
    [{ id: 0, name: "Circle", icon: <CircleDot className="h-8 w-8" />, color: "#06b6d4", value: 5 }],
    [{ id: 0, name: "Circle", icon: <CircleDot className="h-8 w-8" />, color: "#06b6d4", value: 5 }],
    [{ id: 0, name: "Circle", icon: <CircleDot className="h-8 w-8" />, color: "#06b6d4", value: 5 }]
  ]);
  const [visibleSymbols, setVisibleSymbols] = useState<Symbol[][]>([[], [], []]);
  const [result, setResult] = useState<string | null>(null);
  const [win, setWin] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [slotSymbols, setSlotSymbols] = useState<Symbol[]>([]);
  const [specialPrize, setSpecialPrize] = useState<{name: string, id: string} | null>(null);
  // Sound effect states (optional, will not play if browser doesn't support Audio)
  const [spinSound] = useState(() => typeof Audio !== 'undefined' && typeof window !== 'undefined' ? new Audio('/sounds/spin.mp3') : null);
  const [winSound] = useState(() => typeof Audio !== 'undefined' && typeof window !== 'undefined' ? new Audio('/sounds/win.mp3') : null);
  const [jackpotSound] = useState(() => typeof Audio !== 'undefined' && typeof window !== 'undefined' ? new Audio('/sounds/jackpot.mp3') : null);
  const { addNotification } = useNotifications();
  
  // Add state for tracking daily spins
  const [playsRemaining, setPlaysRemaining] = useState(3);
  const [playsUsed, setPlaysUsed] = useState(0);
  
  // Fetch game configuration on mount
  useEffect(() => {
    fetchGameConfig();
    // Also fetch remaining plays
    fetchRemainingPlays();
  }, []);
  
  // Update canPlay based on points
  useEffect(() => {
    if (gameConfig) {
      setCanPlay(userPoints >= gameConfig.points);
    }
  }, [userPoints, gameConfig]);
  
  // Fetch game configuration from API
  const fetchGameConfig = async () => {
    try {
      const slotGame = await gameService.getGameByType('SlotMachine', true);
      
      console.log('Found slot game:', slotGame);
      
      if (slotGame) {
        setGameConfig(slotGame);
        
        // Load standard symbols
        const standardSymbols: Symbol[] = [
          { id: 0, name: "Circle", icon: <CircleDot className="h-8 w-8" />, color: "#06b6d4", value: 5 },
          { id: 1, name: "Coins", icon: <Coins className="h-8 w-8" />, color: "#0e7490", value: 10 },
          { id: 2, name: "Puzzle", icon: <Puzzle className="h-8 w-8" />, color: "#f059a1", value: 15 },
          { id: 3, name: "Medal", icon: <Medal className="h-8 w-8" />, color: "#eab308", value: 20 },
          { id: 4, name: "Gem", icon: <Gem className="h-8 w-8" />, color: "#8b5cf6", value: 25 },
        ];
        
        // Check if there's a special prize assigned
        if (slotGame.prizedAssigned && slotGame.prizedAssigned.length > 0) {
          const prize = slotGame.prizedAssigned[0]; // Get the first assigned prize
          setSpecialPrize({
            name: prize.prizeName,
            id: prize.prizeId
          });
          
          // Add special prize symbol - getting all three of these wins the prize
          standardSymbols.push({
            id: 5,
            name: prize.prizeName,
            icon: (
              <div className="relative">
                <div className="absolute -inset-1 bg-[#2dd4bf] opacity-30 rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-[#2dd4bf] to-[#06b6d4] p-1.5 rounded-full">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
            ),
            color: "#2dd4bf", // teal color for special prizes
            value: 100,
            isSpecialPrize: true
          });
        }
        
        setSlotSymbols(standardSymbols);
      }
    } catch (error) {
      console.error('Error fetching game configuration:', error);
      toast.error("Failed to load game configuration");
      
      // Set default symbols if fetch fails
      setSlotSymbols([
        { id: 0, name: "Circle", icon: <CircleDot className="h-8 w-8" />, color: "#06b6d4", value: 5 },
        { id: 1, name: "Coins", icon: <Coins className="h-8 w-8" />, color: "#0e7490", value: 10 },
        { id: 2, name: "Puzzle", icon: <Puzzle className="h-8 w-8" />, color: "#f059a1", value: 15 },
        { id: 3, name: "Medal", icon: <Medal className="h-8 w-8" />, color: "#eab308", value: 20 },
        { id: 4, name: "Gem", icon: <Gem className="h-8 w-8" />, color: "#8b5cf6", value: 25 },
      ] as Symbol[]);
    }
  };

  // Function to fetch remaining plays
  const fetchRemainingPlays = async () => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!storedUser) {
        toast.error("User data not found. Please try logging in again.");
        return;
      }

      const userData = JSON.parse(storedUser);
      const userId = userData._id || userData.id;
      
      if (!userId) {
        toast.error("Invalid user data. Please try logging in again.");
        return;
      }
      
      const gamePlays = await gameService.getRemainingPlays('slotMachine', userId);
      
      if (gamePlays.success) {
        setPlaysRemaining(gamePlays.playsRemaining);
        setPlaysUsed(gamePlays.playsUsed);
      }
    } catch (error) {
      console.error('Error fetching remaining plays:', error);
    }
  };

  // Generate a blurred reel effect with multiple symbols
  const generateReelSymbols = (reel: number, currentTime: number, startTime: number, duration: number) => {
    // Delay each reel slightly for a cascading effect - longer delays for sequential stopping
    const reelDelay = reel * 500; // Increased delay between reels
    const elapsedTime = currentTime - startTime - reelDelay;
    
    if (elapsedTime < 0) {
      return;
    }
    
    const reelDuration = duration - reelDelay;
    const progress = Math.min(elapsedTime / reelDuration, 1);
    
    // If this reel has finished spinning, set its final symbol and exit
    if (progress >= 1) {
      return;
    }
    
    // Generate a list of random symbols for the spinning effect
    const reelSymbols: Symbol[] = [];
    
    // Create a long strip of symbols for the spinning animation
    const symbolCount = 20; // Increased for smooth animation
    for (let i = 0; i < symbolCount; i++) {
      // Avoid special prize during animation
      const symbolIndex = Math.floor(Math.random() * (slotSymbols.length - (slotSymbols.some(s => s.isSpecialPrize) ? 1 : 0)));
      reelSymbols.push(slotSymbols[symbolIndex]);
    }
    
    // Update just this reel's symbols
    setVisibleSymbols(prev => {
      const newReels = [...prev];
      newReels[reel] = reelSymbols;
      return newReels;
    });
  };

  const animationFrameIdRef = useRef<number | null>(null);

  const spinReels = async () => {
    if (!canPlay || isSpinning || !gameConfig) return;
    
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

      const pointsToDeduct = gameConfig.points || 0;
      
      // Check if user has enough points
      if (userPoints < pointsToDeduct) {
        addNotification({
          title: "Error",
          message: `You need ${pointsToDeduct} points to play`,
          type: "system"
        });
        return;
      }

      // Deduct points for spinning
      const deductResponse = await axios.post('http://localhost:5001/api/users/points/deduct', {
        points: pointsToDeduct,
        userId: userId
      }, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (!deductResponse.data.success) {
        addNotification({
          title: "Error",
          message: "Failed to deduct points. Please try again.",
          type: "system"
        });
        return;
      }
      
      // Increment play count (for a normal spin, not free)
      const isFreeSpin = false;
      const incrementResponse = await axios.post(`http://localhost:5001/api/users/game-plays/slotMachine/increment`, {
        userId,
        isFreeSpin
      });
      
      if (incrementResponse.data.success) {
        setPlaysRemaining(incrementResponse.data.playsRemaining);
        setPlaysUsed(incrementResponse.data.playsUsed);
      }
      
      // Update points in UI
      onPointsUpdate(userPoints - pointsToDeduct);
      
      // Start the spinning animation
      setIsSpinning(true);
      setResult(null);
      setWin(0);
      
      // Play spinning sound
      if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play().catch(e => console.error("Error playing sound:", e));
      }
      
      // Animation variables
      const duration = 3000; // total animation duration
      const startTime = Date.now();
      
      // Final outcome - determine this at the start
      const finalSymbols = determineOutcome();
      
      // Initialize all reels as spinning
      setVisibleSymbols([
        Array(8).fill(slotSymbols[0]),
        Array(8).fill(slotSymbols[0]),
        Array(8).fill(slotSymbols[0])
      ]);
      
      // Track which reels have finished spinning
      const reelFinished = [false, false, false];
      
      // Animation function that updates the reels
      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        // Update each reel that hasn't finished yet
        for (let i = 0; i < 3; i++) {
          // Check if this reel should be done based on sequential stopping
          const reelDelay = i * 500;
          const reelDuration = duration - reelDelay;
          const reelElapsed = elapsed - reelDelay;
          
          if (reelElapsed >= reelDuration && !reelFinished[i]) {
            // This reel is finished - set its final symbol
            reelFinished[i] = true;
            
            // Update the visible symbols for this reel to show the final outcome
            setVisibleSymbols(prev => {
              const newReels = [...prev];
              newReels[i] = [finalSymbols[i]];
              return newReels;
            });
            
            // Play a stop sound if we had one
          } else if (!reelFinished[i]) {
            // Still spinning this reel - generate random symbols
            generateReelSymbols(i, currentTime, startTime, duration);
          }
        }
        
        // Continue animation if any reel is still spinning
        if (!reelFinished.every(finished => finished)) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        } else {
          // All reels have stopped - check results
          setSymbols([
            [finalSymbols[0]],
            [finalSymbols[1]],
            [finalSymbols[2]]
          ]);
          
          // Check for wins
          checkForWins(finalSymbols, userId);
          
          // Stop spinning state
          setIsSpinning(false);
        }
      };
      
      // Start animation
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
    } catch (error) {
      console.error('Error spinning reels:', error);
      addNotification({
        title: "Error",
        message: "Failed to start game. Please try again.",
        type: "system"
      });
      setIsSpinning(false);
    }
  };
  
  // Function to determine the outcome with weighted probabilities
  const determineOutcome = (): Symbol[] => {
    const random = Math.random();
    
    // 5% chance for jackpot (all special prize symbols)
    if (random < 0.05 && specialPrize && slotSymbols.some(s => s.isSpecialPrize)) {
      const specialSymbol = slotSymbols.find(s => s.isSpecialPrize);
      if (specialSymbol) {
        return [specialSymbol, specialSymbol, specialSymbol];
      }
    }
    
    // 15% chance for three of a kind
    if (random < 0.20) {
      const randomIndex = Math.floor(Math.random() * (slotSymbols.length - 1)); // Avoid special prize
      return [
        slotSymbols[randomIndex],
        slotSymbols[randomIndex],
        slotSymbols[randomIndex]
      ];
    }
    
    // 25% chance for two of a kind
    if (random < 0.45) {
      const symbolIndex = Math.floor(Math.random() * (slotSymbols.length - 1)); // Avoid special prize
      const differentIndex = (symbolIndex + 1 + Math.floor(Math.random() * (slotSymbols.length - 2))) % (slotSymbols.length - 1);
      
      const position = Math.floor(Math.random() * 3); // 0, 1, or 2
      
      if (position === 0) {
        return [
          slotSymbols[differentIndex],
          slotSymbols[symbolIndex],
          slotSymbols[symbolIndex]
        ];
      } else if (position === 1) {
        return [
          slotSymbols[symbolIndex],
          slotSymbols[differentIndex],
          slotSymbols[symbolIndex]
        ];
      } else {
        return [
          slotSymbols[symbolIndex],
          slotSymbols[symbolIndex],
          slotSymbols[differentIndex]
        ];
      }
    }
    
    // Otherwise, random symbols with no matches
    const result: Symbol[] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < 3; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * (slotSymbols.length - 1)); // Avoid special prize
      } while (usedIndices.has(index));
      
      usedIndices.add(index);
      result.push(slotSymbols[index]);
    }
    
    return result;
  };
  
  const checkForWins = async (finalSymbols, userId) => {
    try {
      // Record the spin result with the server
      const result = await gameService.recordSlotMachineSpin(
        userId,
        finalSymbols.map(s => ({ id: s.id, name: s.name, value: s.value, isSpecialPrize: s.isSpecialPrize || false })),
        gameConfig.points
      );
      
      if (result.success) {
        // Update points
        setWin(result.pointsWon);
        onPointsUpdate(result.totalPoints);
        
        // Handle special prize if won
        if (result.specialPrizeWon) {
          // Show special prize won notification
          toast.success(`Congratulations! You won the ${result.specialPrizeName || 'special prize'}!`);
          setSpecialPrize(result.specialPrize);
        } else if (result.pointsWon > 0) {
          // Show points won notification
          toast.success(`You won ${result.pointsWon} points!`);
        } else {
          // Show try again notification
          toast.info("Better luck next time!");
        }
      } else {
        toast.error(result.message || "Something went wrong processing your spin.");
      }

      // Update remaining plays
      await fetchRemainingPlays();
      
      return { success: true, pointsWon: result.pointsWon };
    } catch (error) {
      console.error('Error processing spin result:', error);
      toast.error("Failed to process spin result");
      return { success: false, pointsWon: 0 };
    }
  };

  // Clean up animation if component unmounts
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Get button text based on state
  const getSpinButtonText = () => {
    if (isSpinning) return 'SPINNING...';
    if (playsRemaining <= 0) return 'TRY AGAIN TOMORROW';
    return 'SPIN';
  };

  // Get button class based on state
  const getSpinButtonClass = () => {
    if (!canPlay || isSpinning || playsRemaining <= 0) {
      return 'bg-xforge-darkgray text-xforge-gray cursor-not-allowed';
    }
    return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:brightness-110 transition-all duration-200 transform hover:scale-105 active:scale-95';
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto mb-16 px-4">
      {/* Slot machine styles */}
      <style dangerouslySetInnerHTML={{ __html: slotMachineStyles }} />
      
      {/* Main Slot Machine */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        {/* Daily spins counter above the title */}
        <div className="text-center mt-2 mb-1">
          <p className="text-xforge-gray">
            <span className="font-semibold text-white">Daily Spins:</span> {playsRemaining} remaining
            {playsRemaining <= 0 && <span className="text-red-500 block mt-1">Daily limit reached. Resets at midnight.</span>}
          </p>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2 inline-block border-b-2 border-xforge-teal pb-2">
            Slot <span className="text-xforge-teal">Machine</span>
          </h3>
          <p className="text-xforge-gray max-w-lg mx-auto mb-6">
            Test your luck with our slot machine! Match symbols to win points.
            {gameConfig && <span> Costs {gameConfig.points} points to play.</span>}
            {specialPrize && <span> Match three Trophy symbols to win the grand prize!</span>}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#0f1729] to-[#0d111f] p-8 rounded-2xl border-4 border-[#1e293b] shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_1px_8px_rgba(255,255,255,0.15)] w-full max-w-md relative overflow-hidden">
          {/* Machine top decoration */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#334155] to-[#1e293b] border-b border-[#475569]"></div>
          
          {/* Casino light decoration */}
          <div className="flex justify-between absolute -top-1 left-4 right-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-xforge-teal animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
          
          {/* Point balance display */}
          <div className="mt-8 bg-[#0f172a] p-3 rounded-md mb-6 border border-xforge-teal/30 flex justify-between items-center">
            <span className="text-xforge-gray text-sm">Your Balance:</span>
            <span className="text-xforge-teal font-bold">{userPoints} points</span>
          </div>
          
          {/* Slot display */}
          <div className="bg-black p-5 rounded-lg mb-6 border-2 border-[#1e293b] shadow-inner relative overflow-hidden">
            {/* Simulated light reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-8 pointer-events-none"></div>
            
            {/* Slot machine frame details */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-[#334155] to-[#1e293b]"></div>
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-[#1e293b] to-[#334155]"></div>
            
            {/* Divider lines between reels */}
            <div className="absolute top-2 bottom-2 left-[calc(33.33%-1px)] w-2 bg-[#1e293b] rounded-full"></div>
            <div className="absolute top-2 bottom-2 left-[calc(66.66%-1px)] w-2 bg-[#1e293b] rounded-full"></div>
            
            {/* Center line indicator */}
            <div className="absolute left-0 right-0 top-[50%] h-0.5 bg-xforge-teal/30 z-10 pointer-events-none"></div>
            
            <div className="flex justify-between space-x-4">
              {[0, 1, 2].map((reelIndex) => (
                <div 
                  key={reelIndex} 
                  className="flex-1 reel-container bg-[#111] border border-[#333] rounded-md relative"
                >
                  {isSpinning ? (
                    // Spinning reel effect - showing multiple symbols
                    <div 
                      className="reel animate-slot-spin"
                      style={{ animationPlayState: isSpinning ? 'running' : 'paused' }}
                    >
                      {visibleSymbols[reelIndex]?.map((symbol, symbolIndex) => (
                        <div 
                          key={`${reelIndex}-${symbolIndex}`}
                          className="flex items-center justify-center p-4 h-16 w-full"
                          style={{ color: symbol.color }}
                        >
                          {symbol.icon}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Static display of final symbol when not spinning
                    <div className="flex items-center justify-center h-full">
                      {symbols[reelIndex].map((symbol, symbolIndex) => (
                        <div 
                          key={`${reelIndex}-${symbolIndex}`}
                          className={`p-4 ${symbol.isSpecialPrize ? 'animate-pulse' : ''}`}
                          style={{ color: symbol.color }}
                        >
                          {symbol.icon}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Result overlay */}
            {result && !isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg animate-fade-in z-20">
                <div className="text-center transform scale-110 animate-bounce-once">
                  <p className="text-3xl font-bold" style={{ 
                    color: result === "JACKPOT!" ? "#ec4899" : result === "BIG WIN!" ? "#f97316" : result === "WIN!" ? "#06b6d4" : "#aaa",
                    textShadow: result === "JACKPOT!" ? "0 0 10px #ec4899, 0 0 20px #ec4899" : result === "BIG WIN!" ? "0 0 10px #f97316" : "none" 
                  }}>
                    {result}
                  </p>
                  {win > 0 && (
                    <p className="text-xforge-teal font-bold mt-1 text-lg">+{win} Points</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Lever and button section */}
          <div className="flex justify-between items-end">
            {/* Decorative lever */}
            <div className={`h-20 w-6 relative ${isSpinning ? 'lever-pulled' : ''}`}>
              <div className="absolute bottom-0 left-0 w-6 h-10 bg-gradient-to-b from-[#374151] to-[#1f2937] rounded-t-md border border-[#4b5563]"></div>
              <div className="absolute bottom-10 left-1 w-4 h-14 bg-gradient-to-b from-[#4b5563] to-[#374151] rounded"></div>
              <div className="absolute top-0 left-0 w-6 h-6 bg-red-500 rounded-full border-2 border-[#4b5563] shadow-md"></div>
            </div>
            
            {/* Slot controls */}
            <Button
              onClick={spinReels}
              disabled={!canPlay || isSpinning || playsRemaining <= 0}
              size="lg"
              className={`relative px-8 py-6 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${getSpinButtonClass()}`}
            >
              <div className="flex items-center">
                <Play className={`h-5 w-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="font-bold">{getSpinButtonText()}</span>
              </div>
              {!canPlay && gameConfig && playsRemaining > 0 && (
                <span className="block text-xs mt-1">Need {gameConfig.points} points</span>
              )}
              {playsRemaining <= 0 && (
                <span className="block text-xs mt-1">Daily limit reached</span>
              )}
            </Button>
            
            {/* Empty space to balance the lever */}
            <div className="w-6"></div>
          </div>
        </div>
      </div>
      
      {/* Prize Info Panel */}
      <div className="bg-gradient-to-br from-xforge-dark to-[#1a1a1a] p-6 rounded-xl border border-xforge-teal/20 shadow-xl w-full max-w-2xl mt-4">
        <h4 className="text-xl font-bold text-white mb-4 border-b border-xforge-teal/30 pb-2">Prize Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialPrize && (
            <div className="bg-gradient-to-r from-xforge-dark/80 to-[#1a1a1a] p-3 rounded-lg border border-xforge-teal/30 shadow-inner md:col-span-2">
              <h5 className="text-xforge-teal font-semibold mb-2 flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Grand Prize:
              </h5>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 flex items-center justify-center mr-2 relative">
                  <div className="absolute -inset-1 bg-[#2dd4bf] opacity-30 rounded-full animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-[#2dd4bf] to-[#06b6d4] p-1.5 rounded-full">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="text-white font-semibold">{specialPrize.name}</span>
              </div>
              <p className="text-xforge-gray text-sm">
                Match 3 <span className="text-xforge-teal">Trophy symbols</span> to win this exclusive prize!
              </p>
            </div>
          )}
          
          <div>
            <h5 className="text-white font-semibold mb-2">Symbol Values:</h5>
            <div className="space-y-2">
              {slotSymbols.filter(symbol => !symbol.isSpecialPrize).map((symbol) => (
                <div key={symbol.id} className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center mr-2" style={{ color: symbol.color }}>
                    {symbol.icon}
                  </div>
                  <span className="text-xforge-gray">
                    {symbol.name}: {symbol.value} points
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-white font-semibold mb-2">How to Win:</h5>
            <ul className="space-y-2 text-xforge-gray">
              <li className="flex items-center gap-2">
                <span className="text-xforge-teal">•</span> 
                <span>Match 2 identical symbols: Win half the symbol's value</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xforge-teal">•</span> 
                <span>Match 3 identical symbols: Win the symbol's full value</span>
              </li>
              {specialPrize && (
                <li className="flex items-center gap-2 bg-black/20 p-1.5 rounded border border-xforge-teal/20">
                  <span className="text-xforge-teal">★</span> 
                  <span>Match 3 <span className="text-xforge-teal font-semibold">{specialPrize.name} symbols</span>: Win the grand prize!</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="border-t border-xforge-teal/20 pt-4 md:col-span-2">
            <p className="text-xforge-gray text-sm">
              {gameConfig && <span>Each spin costs {gameConfig.points} points. </span>}
              Spin to try your luck!
            </p>
          </div>
        </div>
      </div>
      
      {/* Dialog for prize win */}
      <Dialog open={showResult && result === "JACKPOT!" && !!specialPrize} onOpenChange={setShowResult}>
        <DialogContent className="bg-gradient-to-br from-xforge-dark via-xforge-darkgray to-black border border-xforge-teal/30 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center">
              <Trophy className="text-xforge-teal mr-2 h-6 w-6" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">
                Grand Prize Won!
              </span>
            </DialogTitle>
            <DialogDescription className="text-xforge-gray">
              Congratulations on your amazing win!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-xforge-teal to-cyan-600 shadow-glow relative overflow-hidden">
              <div className="absolute inset-0 bg-[#2dd4bf]/20 animate-pulse rounded-full"></div>
              <div className="absolute -inset-1 bg-white/10 rounded-full animate-ping opacity-40"></div>
              <div className="w-20 h-20 rounded-full border-2 border-white bg-opacity-30 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4bf]/20 to-transparent rounded-full animate-pulse"></div>
                <Trophy className="h-10 w-10 text-white relative z-10" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400 mb-2">
              {specialPrize?.name}
            </h3>
            
            <p className="text-xforge-gray text-center">
              You've won a <span className="text-xforge-teal font-bold">special prize</span>! 
              Check your rewards inventory to claim it.
            </p>
            
            <Button 
              onClick={() => setShowResult(false)} 
              className="mt-6 bg-gradient-to-r from-xforge-teal to-cyan-500 text-xforge-dark hover:brightness-110 shadow-glow"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlotMachine;