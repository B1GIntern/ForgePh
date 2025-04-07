import React, { useState, useEffect } from "react";
import { 
  Gift, Sparkles, Zap, Trophy, Target, 
  Crown, CheckCircle, RotateCw
} from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";
import { toast } from "sonner";

// Define card types
interface Card {
  id: number;
  icon: JSX.Element;
  iconType: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotifications();
  
  const totalPairs = 6;
  
  // Icons for the memory cards
  const iconComponents = [
    { type: "Gift", element: <Gift className="h-10 w-10 text-xforge-teal" /> },
    { type: "Sparkles", element: <Sparkles className="h-10 w-10 text-[#F97316]" /> },
    { type: "Zap", element: <Zap className="h-10 w-10 text-[#8B5CF6]" /> },
    { type: "Trophy", element: <Trophy className="h-10 w-10 text-yellow-400" /> },
    { type: "Target", element: <Target className="h-10 w-10 text-red-400" /> },
    { type: "Crown", element: <Crown className="h-10 w-10 text-pink-400" /> },
  ];

  // Initialize game
  const initializeGame = () => {
    // Reset game state
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsGameCompleted(false);
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setTimer(0);
    
    // Create pairs of cards and shuffle them
    const initialCards: Card[] = [];
    
    // Create pairs
    iconComponents.forEach((icon, index) => {
      // Create two cards with the same icon (a pair)
      const card1: Card = {
        id: index * 2,
        icon: icon.element,
        iconType: icon.type,
        isFlipped: false,
        isMatched: false,
      };
      
      const card2: Card = {
        id: index * 2 + 1,
        icon: icon.element,
        iconType: icon.type,
        isFlipped: false,
        isMatched: false,
      };
      
      initialCards.push(card1, card2);
    });
    
    // Shuffle the cards
    const shuffledCards = shuffleArray([...initialCards]);
    setCards(shuffledCards);
    setGameStarted(true);
    
    // Start the timer
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  // Shuffle array - Fisher-Yates algorithm
  const shuffleArray = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle card click
  const handleCardClick = (cardId: number) => {
    // Ignore click if game is completed or card is already flipped/matched
    const clickedCard = cards.find(card => card.id === cardId);
    if (
      isGameCompleted || 
      !clickedCard || 
      clickedCard.isFlipped || 
      clickedCard.isMatched || 
      flippedCards.length >= 2
    ) {
      return;
    }
    
    // Flip the card
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    
    setCards(updatedCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      
      const firstCardId = newFlippedCards[0];
      const secondCardId = newFlippedCards[1];
      
      const firstCard = updatedCards.find(card => card.id === firstCardId);
      const secondCard = updatedCards.find(card => card.id === secondCardId);
      
      if (firstCard && secondCard && firstCard.iconType === secondCard.iconType) {
        // Cards match
        setTimeout(() => {
          // Mark cards as matched
          const matchedCards = updatedCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          );
          
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(prevMatches => prevMatches + 1);
          
          // Check if all pairs are matched
          if (matchedPairs + 1 === totalPairs) {
            gameCompleted();
          }
        }, 500);
      } else {
        // Cards don't match, flip them back
        setTimeout(() => {
          const flippedBackCards = updatedCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          );
          
          setCards(flippedBackCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Game completed
  const gameCompleted = () => {
    setIsGameCompleted(true);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Calculate points based on performance
    // Base points: 50, minus 2 for each move over 10, plus 1 for each second under 60
    let earnedPoints = 50;
    
    if (moves > 10) {
      earnedPoints -= (moves - 10) * 2;
    }
    
    if (timer < 60) {
      earnedPoints += (60 - timer);
    }
    
    // Ensure minimum points
    earnedPoints = Math.max(earnedPoints, 10);
    
    // Show success notification
    toast.success("Memory Game Completed!", {
      description: `You've earned ${earnedPoints} points!`,
      position: "top-center"
    });
    
    // Add notification
    addNotification({
      title: "Memory Game Completed",
      message: `You've earned ${earnedPoints} points by completing the memory game!`,
      type: "points"
    });
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center mb-8">
          <div className="bg-xforge-teal/20 p-6 rounded-full mb-6 inline-block">
            <Target className="h-16 w-16 text-xforge-teal" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Memory Match Challenge</h3>
          <p className="text-xforge-gray text-center max-w-md mb-8">
            Test your memory skills by matching XForge product pairs. The faster you match, the more points you earn!
          </p>
          <button 
            onClick={initializeGame}
            className="px-8 py-4 bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold rounded-full hover:shadow-lg hover:shadow-xforge-teal/20 transition-all duration-300"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Game Stats */}
          <div className="flex justify-between w-full max-w-lg mb-6">
            <div className="bg-xforge-dark/60 px-4 py-2 rounded-lg border border-white/10">
              <p className="text-xforge-gray text-sm">Moves</p>
              <p className="text-white font-bold text-xl">{moves}</p>
            </div>
            <div className="bg-xforge-dark/60 px-4 py-2 rounded-lg border border-white/10">
              <p className="text-xforge-gray text-sm">Time</p>
              <p className="text-white font-bold text-xl">{formatTime(timer)}</p>
            </div>
            <div className="bg-xforge-dark/60 px-4 py-2 rounded-lg border border-white/10">
              <p className="text-xforge-gray text-sm">Matched</p>
              <p className="text-white font-bold text-xl">{matchedPairs}/{totalPairs}</p>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="mb-6">
            <button 
              onClick={initializeGame}
              className="flex items-center px-4 py-2 bg-xforge-dark/60 rounded-lg border border-white/10 text-xforge-gray hover:text-white transition-colors"
            >
              <RotateCw className="h-4 w-4 mr-2" /> Restart Game
            </button>
          </div>
          
          {/* Game Board */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-lg">
            {cards.map(card => (
              <div 
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`perspective-1000 cursor-pointer h-24 w-24 sm:h-28 sm:w-28 transition-transform duration-300 ${card.isMatched ? 'opacity-70' : ''}`}
              >
                <div 
                  className={`card-inner relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Card Front (Back face when not flipped) */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-xforge-dark to-[#141b22] rounded-xl flex items-center justify-center border-2 border-xforge-teal/30">
                    <div className="bg-xforge-teal/10 rounded-full p-2">
                      <Gift className="h-6 w-6 text-xforge-teal/30" />
                    </div>
                  </div>
                  
                  {/* Card Back (Front face when flipped) */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#141b22] to-xforge-dark rounded-xl flex items-center justify-center border-2 border-xforge-teal/70 rotate-y-180">
                    {card.isMatched && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
                        <CheckCircle className="h-10 w-10 text-green-400" />
                      </div>
                    )}
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Game Completed Modal */}
          {isGameCompleted && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
              <div className="bg-gradient-to-br from-xforge-dark to-[#141b22] p-8 rounded-2xl border border-xforge-teal/30 max-w-md text-center">
                <div className="bg-gradient-to-br from-xforge-teal/30 to-[#8B5CF6]/30 p-6 rounded-full mb-4 mx-auto inline-block">
                  <Trophy className="h-12 w-12 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                <p className="text-xforge-gray mb-6">You've completed the memory game!</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-xforge-dark/60 p-4 rounded-lg">
                    <p className="text-xforge-gray text-sm">Moves</p>
                    <p className="text-white font-bold text-xl">{moves}</p>
                  </div>
                  <div className="bg-xforge-dark/60 p-4 rounded-lg">
                    <p className="text-xforge-gray text-sm">Time</p>
                    <p className="text-white font-bold text-xl">{formatTime(timer)}</p>
                  </div>
                </div>
                <button 
                  onClick={initializeGame}
                  className="w-full py-4 bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold rounded-full hover:shadow-lg hover:shadow-xforge-teal/20 transition-all duration-300"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryGame;