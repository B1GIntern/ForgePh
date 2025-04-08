import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotifications } from "@/context/NotificationsContext";

// Define the prize types
type Prize = {
  id: number;
  name: string;
  color: string;
  probability: number;
  type: 'minor' | 'major' | 'final';
  value: string;
  multiplier?: number;
};

const SpinWheel: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [remainingSpins, setRemainingSpins] = useState(() => {
    const stored = localStorage.getItem('remainingSpins');
    return stored ? parseInt(stored) : 1; // Default to 1 spin per day
  });
  const [currentMultiplier, setCurrentMultiplier] = useState(() => {
    // Check if there's an active multiplier in localStorage
    const storedMultiplier = localStorage.getItem('pointsMultiplier');
    const storedExpiry = localStorage.getItem('multiplierExpiry');
    
    if (storedMultiplier && storedExpiry && new Date(storedExpiry) > new Date()) {
      return parseInt(storedMultiplier);
    }
    return 1; // Default multiplier
  });
  const { addNotification } = useNotifications();
  const wheelRef = useRef<HTMLDivElement>(null);

  // Define wheel prizes (removed icons)
  const prizes: Prize[] = [
    { id: 1, name: "25 Points", color: "#f97316", probability: 0.28, type: 'minor', value: "25 Points" },
    { id: 2, name: "XForge Bike", color: "#8b5cf6", probability: 0.05, type: 'major', value: "XForge Bike" },
    { id: 3, name: "50 Points", color: "#06b6d4", probability: 0.18, type: 'minor', value: "50 Points" },
    { id: 4, name: "iPhone 16", color: "#ec4899", probability: 0.01, type: 'final', value: "iPhone 16" },
    { id: 5, name: "10 Points", color: "#84cc16", probability: 0.32, type: 'minor', value: "10 Points" },
    { id: 6, name: "75 Points", color: "#eab308", probability: 0.09, type: 'minor', value: "75 Points" },
    { id: 7, name: "2x Multiplier", color: "#f43f5e", probability: 0.05, type: 'minor', value: "2x Points Multiplier", multiplier: 2 },
    { id: 8, name: "3x Multiplier", color: "#d946ef", probability: 0.02, type: 'minor', value: "3x Points Multiplier", multiplier: 3 },
  ];

  // Check and update remaining spins daily
  useEffect(() => {
    const lastSpinDate = localStorage.getItem('lastSpinDate');
    const today = new Date().toDateString();
    
    if (lastSpinDate !== today) {
      setRemainingSpins(1);
      localStorage.setItem('remainingSpins', '1');
    }
    
    // Check if multiplier has expired
    const multiplierExpiry = localStorage.getItem('multiplierExpiry');
    if (multiplierExpiry && new Date(multiplierExpiry) <= new Date()) {
      setCurrentMultiplier(1);
      localStorage.removeItem('pointsMultiplier');
      localStorage.removeItem('multiplierExpiry');
    }
  }, []);

  // Save remaining spins to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('remainingSpins', remainingSpins.toString());
    setCanSpin(remainingSpins > 0);
  }, [remainingSpins]);

  const spinWheel = () => {
    if (!canSpin || isSpinning) return;
    
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
    
    // Calculate the rotation to land on the selected prize
    // Each slice is 360 / prizes.length degrees
    const sliceDegrees = 360 / prizes.length;
    
    // Calculate the middle position of the selected slice
    // Add 3.5 full rotations (360 * 3.5) for a good spinning effect
    const prizeRotation = 3600 + (selectedIndex * sliceDegrees) + (sliceDegrees / 2);
    
    // Add some randomness to the rotation within the slice
    const randomOffset = Math.random() * (sliceDegrees * 0.8) - (sliceDegrees * 0.4);
    const finalRotation = prizeRotation + randomOffset;
    
    setRotation(finalRotation);
    
    // Record spin date and decrement remaining spins
    localStorage.setItem('lastSpinDate', new Date().toDateString());
    setRemainingSpins(prev => prev - 1);
    
    // After the animation is complete, show the result
    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      
      // If it's a multiplier prize, set it active for 24 hours
      if (prize.multiplier) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry
        
        localStorage.setItem('pointsMultiplier', prize.multiplier.toString());
        localStorage.setItem('multiplierExpiry', expiryDate.toString());
        
        setCurrentMultiplier(prize.multiplier);
      }
      
      // Add notification
      addNotification({
        title: "Prize Won!",
        message: `Congratulations! You've won ${prize.name}!`,
        type: "points"
      });
    }, 5000); // Match this with the CSS transition duration
  };

  const closeResult = () => {
    setShowResult(false);
  };

  // Calculate slice angle
  const sliceAngle = 360 / prizes.length;

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto my-16 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 inline-block border-b-2 border-xforge-teal pb-2">
          Spin to <span className="text-xforge-teal">Win</span>
        </h2>
        <p className="text-xforge-gray max-w-lg mx-auto mb-6">
          Try your luck with our prize wheel! Win points, products, or even an iPhone 16.
          You have {remainingSpins} spin{remainingSpins !== 1 ? 's' : ''} remaining today.
        </p>
        
        {/* Multiplier Badge */}
        {currentMultiplier > 1 && (
          <div className="inline-flex items-center bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 rounded-full text-white font-bold animate-pulse-light">
            <Sparkles className="h-4 w-4 mr-2" />
            {currentMultiplier}x Point Multiplier Active!
          </div>
        )}
      </div>
      
      <div className="relative">
        {/* Wheel pointer */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 text-xforge-teal">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-xforge-teal mx-auto"></div>
        </div>
        
        {/* Prize wheel */}
        <div 
          ref={wheelRef}
          className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-xforge-teal/30 shadow-lg transform transition-transform duration-5000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Create SVG wheel with proper pie slices */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Create the pie slices */}
            {prizes.map((prize, index) => {
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
              
              // Calculate midpoint for text positioning (moved outward a bit)
              const midAngleRad = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
              const textPathRadius = 35; // Distance from center for text path
              
              // Create a path for the slice
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // Create a circular path for the text to follow
              const textPathId = `textPath-${prize.id}`;
              const textArcStart = 50 + textPathRadius * Math.cos(startRad);
              const textArcStartY = 50 + textPathRadius * Math.sin(startRad);
              const textArcEnd = 50 + textPathRadius * Math.cos(endRad);
              const textArcEndY = 50 + textPathRadius * Math.sin(endRad);
              
              // Create the text path (partial arc for this slice)
              const textPathD = `M ${textArcStart} ${textArcStartY} A ${textPathRadius} ${textPathRadius} 0 ${largeArcFlag} 1 ${textArcEnd} ${textArcEndY}`;
              
              return (
                <g key={prize.id}>
                  <path
                    d={path}
                    fill={prize.color}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  
                  {/* Define the path that text will follow */}
                  <path
                    id={textPathId}
                    d={textPathD}
                    fill="none"
                    stroke="none"
                  />
                  
                  {/* Text that follows the path */}
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
            })}
            
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
          {isSpinning ? 'Spinning...' : canSpin ? 'SPIN THE WHEEL' : 'No Spins Left Today'}
        </Button>
      </div>
      
      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-gradient-to-br from-xforge-dark to-xforge-darkgray border border-xforge-teal/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-xforge-gray">
              You've won a prize from the wheel!
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrize && (
            <div className="py-6 flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4`} style={{ background: selectedPrize.color }}>
                <span className="text-white font-bold">{selectedPrize.name}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{selectedPrize.name}</h3>
              {selectedPrize.type === 'minor' && !selectedPrize.multiplier && (
                <p className="text-xforge-gray text-center">You've won some points! These have been added to your account.</p>
              )}
              {selectedPrize.multiplier && (
                <p className="text-xforge-gray text-center">You've activated a {selectedPrize.multiplier}x point multiplier for 24 hours! All points earned will be multiplied.</p>
              )}
              {selectedPrize.type === 'major' && (
                <p className="text-xforge-gray text-center">You've won an XForge Bike! Contact customer support to claim your prize.</p>
              )}
              {selectedPrize.type === 'final' && (
                <p className="text-xforge-gray text-center">Wow! You've won an iPhone 16! Contact customer support immediately to verify and claim your prize.</p>
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