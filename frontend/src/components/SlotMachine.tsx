import React, { useState, useRef, useEffect } from "react";
import { DollarSign, Apple, Citrus, Gem, Star, Trophy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotifications } from "@/context/NotificationsContext";
import { toast } from "sonner";

// Define the slot symbols
type Symbol = {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  value: number;
};

const SlotMachine: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [symbols, setSymbols] = useState<Symbol[][]>([
    [{ id: 0, name: "Cherry", icon: <Apple className="h-8 w-8" />, color: "#f97316", value: 1 }],
    [{ id: 0, name: "Cherry", icon: <Apple className="h-8 w-8" />, color: "#f97316", value: 1 }],
    [{ id: 0, name: "Cherry", icon: <Apple className="h-8 w-8" />, color: "#f97316", value: 1 }]
  ]);
  const [result, setResult] = useState<string | null>(null);
  const [win, setWin] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const [remainingPlays, setRemainingPlays] = useState(() => {
    const stored = localStorage.getItem('remainingSlotPlays');
    return stored ? parseInt(stored) : 3; // Default to 3 plays per day
  });
  const { addNotification } = useNotifications();
  
  // Define all possible symbols
  const slotSymbols: Symbol[] = [
    { id: 0, name: "Cherry", icon: <Apple className="h-8 w-8" />, color: "#f97316", value: 5 },
    { id: 1, name: "Lemon", icon: <Citrus className="h-8 w-8" />, color: "#eab308", value: 10 },
    { id: 2, name: "Seven", icon: <Star className="h-8 w-8" />, color: "#8b5cf6", value: 25 },
    { id: 3, name: "Diamond", icon: <Gem className="h-8 w-8" />, color: "#06b6d4", value: 50 },
    { id: 4, name: "Jackpot", icon: <Trophy className="h-8 w-8" />, color: "#ec4899", value: 100 },
  ];

  // Check and update remaining plays daily
  useEffect(() => {
    const lastPlayDate = localStorage.getItem('lastSlotPlayDate');
    const today = new Date().toDateString();
    
    if (lastPlayDate !== today) {
      setRemainingPlays(3);
      localStorage.setItem('remainingSlotPlays', '3');
    }
  }, []);

  // Save remaining plays to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('remainingSlotPlays', remainingPlays.toString());
    setCanPlay(remainingPlays > 0);
  }, [remainingPlays]);

  const spinReels = () => {
    if (!canPlay || isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    setWin(0);
    
    // Record play date and decrement remaining plays
    localStorage.setItem('lastSlotPlayDate', new Date().toDateString());
    setRemainingPlays(prev => prev - 1);
    
    // Generate new random symbols for each reel with animation
    let spinInterval = 50;
    let duration = 2000;
    let startTime = Date.now();
    
    const animateReels = () => {
      // Generate random symbols for animation effect
      setSymbols(current => 
        current.map(reel => 
          [slotSymbols[Math.floor(Math.random() * slotSymbols.length)]]
        )
      );
      
      if (Date.now() - startTime < duration) {
        setTimeout(animateReels, spinInterval);
      } else {
        // Final result
        const finalSymbols = [
          slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
          slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
          slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
        ];
        
        setSymbols([
          [finalSymbols[0]],
          [finalSymbols[1]],
          [finalSymbols[2]]
        ]);
        
        // Check for wins
        checkForWins(finalSymbols);
        
        setIsSpinning(false);
      }
    };
    
    // Start animation
    animateReels();
  };
  
  const checkForWins = (finalSymbols: Symbol[]) => {
    // Check if all symbols are the same (jackpot)
    if (finalSymbols[0].id === finalSymbols[1].id && finalSymbols[1].id === finalSymbols[2].id) {
      const prize = finalSymbols[0].value * 3;
      setWin(prize);
      
      if (finalSymbols[0].id === 4) { // Jackpot symbol
        setResult("JACKPOT!");
        toast.success("JACKPOT! You've won 300 points!", {
          position: "top-center"
        });
      } else {
        setResult("BIG WIN!");
        toast("Big Win!", {
          description: `You've won ${prize} points!`,
          position: "top-center"
        });
      }
      
      addNotification({
        title: "Slot Machine Win!",
        message: `You've won ${prize} points from the slot machine!`,
        type: "points"
      });
    } 
    // Check if two symbols are the same
    else if (
      finalSymbols[0].id === finalSymbols[1].id || 
      finalSymbols[1].id === finalSymbols[2].id || 
      finalSymbols[0].id === finalSymbols[2].id
    ) {
      let matchingSymbol;
      if (finalSymbols[0].id === finalSymbols[1].id) {
        matchingSymbol = finalSymbols[0];
      } else if (finalSymbols[1].id === finalSymbols[2].id) {
        matchingSymbol = finalSymbols[1];
      } else {
        matchingSymbol = finalSymbols[0];
      }
      
      const prize = matchingSymbol.value;
      setWin(prize);
      setResult("WIN!");
      
      toast("You won!", {
        description: `You've won ${prize} points!`,
        position: "top-center"
      });
      
      addNotification({
        title: "Slot Machine Win!",
        message: `You've won ${prize} points from the slot machine!`,
        type: "points"
      });
    } 
    // No match
    else {
      setResult("Try again!");
      
      toast("Try again", {
        description: "Better luck next time!",
        position: "top-center"
      });
    }
    
    setShowResult(true);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto mb-16 px-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2 inline-block border-b-2 border-xforge-teal pb-2">
          Slot <span className="text-xforge-teal">Machine</span>
        </h3>
        <p className="text-xforge-gray max-w-lg mx-auto mb-6">
          Test your luck with our slot machine! Match symbols to win points.
          You have {remainingPlays} play{remainingPlays !== 1 ? 's' : ''} remaining today.
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-xforge-dark to-[#1a1a1a] p-6 rounded-xl border border-xforge-teal/20 shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Machine top part */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#333] via-[#444] to-[#333] border-b border-xforge-teal/30"></div>
        
        {/* Slot display */}
        <div className="bg-[#111] p-4 rounded-lg mb-4 border-2 border-[#333] relative">
          <div className="flex justify-center space-x-2">
            {symbols.map((reel, reelIndex) => (
              <div 
                key={reelIndex} 
                className="w-20 h-20 bg-black border border-[#444] rounded-md flex items-center justify-center overflow-hidden"
              >
                {reel.map((symbol, symbolIndex) => (
                  <div 
                    key={symbolIndex} 
                    className="flex items-center justify-center"
                    style={{ color: symbol.color }}
                  >
                    {symbol.icon}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Result overlay */}
          {result && !isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg animate-fade-in">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: result === "JACKPOT!" ? "#ec4899" : result === "BIG WIN!" ? "#f97316" : result === "WIN!" ? "#06b6d4" : "#aaa" }}>
                  {result}
                </p>
                {win > 0 && (
                  <p className="text-xforge-teal font-bold mt-1">+{win} Points</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Slot controls */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={spinReels}
            disabled={!canPlay || isSpinning}
            size="lg"
            className={`relative px-8 py-6 ${
              !canPlay ? 'bg-xforge-darkgray text-xforge-gray cursor-not-allowed' : 
              'bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark hover:brightness-110'
            }`}
          >
            <div className="flex items-center">
              <Play className={`h-5 w-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
              <span className="font-bold">{isSpinning ? 'SPINNING...' : 'SPIN'}</span>
            </div>
            {!canPlay && (
              <span className="block text-xs mt-1">No Plays Left Today</span>
            )}
          </Button>
        </div>
        
        {/* Paytable */}
        <div className="mt-6 pt-4 border-t border-[#444]">
          <p className="text-sm text-center text-xforge-gray mb-2">PAYTABLE</p>
          <div className="grid grid-cols-5 gap-1">
            {slotSymbols.map((symbol) => (
              <div key={symbol.id} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8" style={{ color: symbol.color }}>
                  {symbol.icon}
                </div>
                <span className="text-xs text-xforge-gray mt-1">{symbol.value}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-center text-xforge-gray mt-3">
            <p>Match 3: 3x value | Match 2: 1x value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;