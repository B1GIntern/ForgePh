import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, X, ArrowDown, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define retailer type
interface Retailer {
  _id: string;
  name: string;
  shopName: string;
  location?: {
    province?: string;
    city?: string;
  };
}

interface RetailerWheelProps {
  onRetailerSelected?: (retailer: Retailer) => void;
}

const RetailerWheel: React.FC<RetailerWheelProps> = ({ onRetailerSelected }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Predefined colors for the wheel segments
  const segmentColors = [
    '#FF6384', // Pink
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#00D6A4', // Primary teal (matching your site theme)
    '#3b82f6', // Blue (matching your site theme)
    '#F87171', // Red
    '#10B981', // Green
    '#6366F1', // Indigo
    '#EC4899'  // Hot pink
  ];

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("https://forgeph-2.onrender.com/api/users/top-retailers");
      
      if (response.data && Array.isArray(response.data)) {
        // Take only the top 12 retailers to make the wheel manageable
        const topRetailers = response.data.slice(0, 12);
        setRetailers(topRetailers);
      } else {
        toast({
          title: "Error",
          description: "Failed to load retailers data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching retailers:", error);
      toast({
        title: "Error",
        description: "Failed to load retailers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const spinWheel = () => {
    if (retailers.length === 0 || isSpinning) return;
    
    setIsSpinning(true);
    setSelectedRetailer(null);
    
    // Get a random number of full rotations (between 4 and 8)
    const fullRotations = 4 + Math.floor(Math.random() * 4);
    
    // Get a random position for the final segment
    const segmentAngle = 360 / retailers.length;
    const selectedIndex = Math.floor(Math.random() * retailers.length);
    
    // Calculate final rotation:
    // Full rotations + the angle to the selected segment + a random offset within that segment
    const finalRotation = fullRotations * 360 + (selectedIndex * segmentAngle) + Math.random() * segmentAngle;
    
    // Animate the wheel spinning
    setRotation(finalRotation);
    
    // After the animation completes, show the result
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedRetailer(retailers[selectedIndex]);
      
      // Call the callback if provided
      if (onRetailerSelected) {
        onRetailerSelected(retailers[selectedIndex]);
      }
      
      toast({
        title: "Retailer Selected!",
        description: `${retailers[selectedIndex].shopName || retailers[selectedIndex].name} has been selected.`,
      });
    }, 5000); // The CSS animation duration is 5 seconds
  };

  const resetWheel = () => {
    setRotation(0);
    setSelectedRetailer(null);
  };

  const refreshRetailers = () => {
    fetchRetailers();
    resetWheel();
  };

  // Get display name for a retailer
  const getRetailerDisplayName = (retailer: Retailer) => {
    return retailer.shopName || retailer.name || "Retailer";
  };

  return (
    <div className="flex flex-col items-center">
      {/* Wheel of retailers */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <ArrowDown className="h-8 w-8 text-primary" />
        </div>
        
        {/* The Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-primary overflow-hidden relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)" : "transform 0.3s ease-out"
          }}
        >
          {retailers.length > 0 ? (
            retailers.map((retailer, index) => {
              const segmentAngle = 360 / retailers.length;
              const rotation = index * segmentAngle;
              const skew = 90 - segmentAngle;
              
              return (
                <div 
                  key={retailer._id || index}
                  className="absolute top-0 right-0 w-1/2 h-1/2 origin-top-left text-white flex items-center justify-center overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg) skew(${skew}deg)`,
                    background: segmentColors[index % segmentColors.length]
                  }}
                >
                  <div 
                    className="text-xs font-bold transform -skew-y-12 -rotate-45 origin-center whitespace-nowrap"
                    style={{ transform: `skew(-${skew}deg) rotate(-${rotation + segmentAngle/2}deg)`, maxWidth: '100px' }}
                  >
                    {getRetailerDisplayName(retailer)}
                  </div>
                </div>
              );
            })
          ) : isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-500 text-center px-4">No retailers available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Selected retailer display */}
      {selectedRetailer && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-gray-500">Selected Retailer:</p>
          <p className="text-lg font-bold text-primary">
            {getRetailerDisplayName(selectedRetailer)}
          </p>
          {selectedRetailer.location && (
            <p className="text-xs text-gray-500">
              {[selectedRetailer.location.city, selectedRetailer.location.province]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
      )}
      
      {/* Controls */}
      <div className="flex space-x-2">
        <Button
          onClick={spinWheel}
          disabled={isSpinning || retailers.length === 0 || isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isSpinning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Spinning...
            </>
          ) : (
            "Spin Wheel"
          )}
        </Button>
        
        <Button
          onClick={refreshRetailers}
          disabled={isSpinning || isLoading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default RetailerWheel; 