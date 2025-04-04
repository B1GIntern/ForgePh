import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Award, ChevronDown, ChevronUp, Check, Gift, Star, Sparkles, Tag, Clock, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";

// Define the User interface
interface RewardClaimed {
  rewardsid: string; // The ID of the claimed reward
  rewardsname: string; // The name of the claimed reward
}

// Define Reward interface 
interface Reward {
  _id: string; // MongoDB ObjectId as string
  name: string; // Reward name
  pointsRequired: number; // Points required to redeem the reward
  stockAvailable: number; // Available stock for the reward
  type: "Discounts" | "Vouchers" | "Products"; // Enum for reward types
  UsersClaimed: { // Add UsersClaimed to the Reward interface
    userId: string; // The ID of the user who claimed the reward
    name: string; // Name of the user who claimed the reward
    claimedAt: Date; // Date when the reward was claimed
  }[]; // Array of claimed users
}

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
  rewardsclaimed: RewardClaimed[]; // Add this line to include claimed rewards
}

const Rewards: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("all");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeGameTab, setActiveGameTab] = useState<string>("wheel");
  const { addNotification } = useNotifications();
  const { toast: uiToast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [allRewards, setAllRewards] = useState<Reward[]>([]); // Using the Reward type
  const [currentPoints, setCurrentPoints] = useState(0);

  // Enhanced user data loading that also fetches fresh user data from the API
  const fetchUserData = async () => {
    try {
      // Get auth token from storage
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        console.log("No token found");
        return;
      }

      // Get basic user data from storage first to display something quickly
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setCurrentPoints(parsedUser.points || 0);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }

      // Then, fetch fresh user data from the server
      const response = await fetch("http://localhost:5001/api/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      
      // Create a proper user object with the correct structure
      const fullUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
        points: userData.points,
        rewardsclaimed: userData.rewardsclaimed || []
      };

      // Update state with fresh user data
      setUser(fullUser);
      setCurrentPoints(fullUser.points);
      
      // Update localStorage/sessionStorage with fresh data
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(fullUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(fullUser));
      }
      
      console.log("Updated user data from server:", fullUser);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Call this function when the component mounts and after redeeming rewards
  useEffect(() => {
  fetchUserData();
  fetchRewards();

  window.addEventListener("storage", fetchUserData);
  
  return () => {
    window.removeEventListener("storage", fetchUserData);
  };
}, []);

  useEffect(() => {
    if (user && user.rewardsclaimed) {
      console.log("User claimed rewards:", user.rewardsclaimed);
      // Log an example reward ID match check
      if (allRewards.length > 0 && user.rewardsclaimed.length > 0) {
        const sampleCheck = user.rewardsclaimed.some(claimed => 
          String(claimed.rewardsid) === String(allRewards[0]._id));
        console.log("Sample reward check result:", sampleCheck, 
          "Comparing:", user.rewardsclaimed[0]?.rewardsid, "with", allRewards[0]?._id);
      }
    }
  }, [user, allRewards]);

  const fetchRewards = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/rewards");
      if (!response.ok) {
        throw new Error("Failed to fetch rewards");
      }
      const rewardsData: Reward[] = await response.json(); // Ensuring proper typing
      setAllRewards(rewardsData);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      uiToast({
        description: "Could not load rewards. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const rewardTypes = [
    { id: 'Discounts', name: 'Discounts' },
    { id: 'Vouchers', name: 'Vouchers' },
    { id: 'Products', name: 'Products' },
  ];

  // Update state whenever user object changes
  useEffect(() => {
    if (user) {
      setCurrentPoints(user.points);
    }
  }, [user]);

// Add this useEffect to verify claimed rewards when component mounts
useEffect(() => {
  if (user && user.rewardsclaimed && allRewards.length > 0) {
    console.log("==== CHECKING CLAIMED REWARDS ====");
    
    // Log all claimed rewards
    console.log("User's claimed rewards:", user.rewardsclaimed.map(r => ({
      id: r.rewardsid,
      stringId: String(r.rewardsid),
      name: r.rewardsname
    })));
    
    // Test each reward to see if it's claimed
    allRewards.forEach(reward => {
      const isClaimed = hasClaimedReward(reward._id);
      console.log(`Reward: ${reward.name} (${reward._id}) - Claimed: ${isClaimed}`);
    });
  }
}, [user, allRewards]);


// Enhanced function to check if user has claimed a reward
const hasClaimedReward = (rewardId: string): boolean => {
  if (!user || !user.rewardsclaimed) return false;
  
  return user.rewardsclaimed.some(
    (reward) => reward.rewardsid === rewardId
  );
};
  // Function to handle redeeming rewards
const handleRedeemReward = async (rewardId: string, rewardName: string, pointsRequired: number) => {
  // First, check if already claimed using our enhanced function
  if (hasClaimedReward(rewardId)) {
    uiToast({
      title: "Already Claimed",
      description: "You have already claimed this reward",
      variant: "destructive",
    });
    return;
  }
  
  if (currentPoints < pointsRequired) {
    uiToast({
      title: "Not Enough Points",
      description: `You need ${pointsRequired - currentPoints} more points to redeem this reward.`,
      variant: "destructive",
    });
    return;
  }

  try {
    // Get token from storage
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (!token) {
      uiToast({
        title: "Authentication Error",
        description: "You need to be logged in to redeem rewards",
        variant: "destructive",
      });
      return;
    }

    const response = await fetch("http://localhost:5001/api/auth/redeem-reward", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user.id, // Pass the user ID
        rewardsid: rewardId, // Pass the reward ID
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to redeem reward");
    }

    const data = await response.json();
    
    // Update User state with the redeemed reward
    setUser(prevUser => {
      if (!prevUser) return null;
      
      return {
        ...prevUser,
        points: prevUser.points - pointsRequired,
        rewardsclaimed: [
          ...(prevUser.rewardsclaimed || []), // Handle if undefined
          { 
            rewardsid: rewardId, 
            rewardsname: rewardName,
            claimedAt: new Date().toISOString() // Add claim date
          }
        ]
      };
    });
    
    // Also update localStorage/sessionStorage
    if (user) {
      const updatedUser = {
        ...user, 
        points: user.points - pointsRequired,
        rewardsclaimed: [
          ...(user.rewardsclaimed || []),
          { 
            rewardsid: rewardId, 
            rewardsname: rewardName,
            claimedAt: new Date().toISOString() // Add claim date
          }
        ]
      };
      
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }

    // Update current points
    setCurrentPoints(prev => prev - pointsRequired);
    
    // Refresh claimed rewards list

    // Show success toast notification
    toast.success(data.message, {
      description: `You've successfully redeemed ${rewardName} on ${data.redemptionDate}`,
      position: "top-center",
    });
    
    // Fetch fresh user data after redemption
    fetchUserData();
    
  } catch (error) {
    // Log and display any errors encountered during the redeem process
    console.error("Error redeeming reward:", error);
    toast.error(error.message || "Error redeeming reward", {
      position: "top-center",
    });
  }
};

 
  
  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };
  
  const toggleFaq = (faqId: string) => {
    if (expandedFaq === faqId) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(faqId);
    }
  };
  
  
  

  const rewardsHistory = [
    { id: 1, name: "XForge Sticker Pack", pointsCost: 75, date: "2023-06-05" },
    { id: 2, name: "Free Shipping Voucher", pointsCost: 100, date: "2023-05-12" }
  ];

  const faqItems = [
    {
      id: "faq-1",
      question: "How do I earn reward points?",
      answer: "You can earn points by redeeming promo codes, making purchases, referring friends, and participating in XForge events and social media campaigns."
    },
    {
      id: "faq-2",
      question: "When do my points expire?",
      answer: "XForge reward points are valid for 12 months from the date they were earned. Make sure to use them before they expire!"
    },
    {
      id: "faq-3",
      question: "How long does it take to receive my reward?",
      answer: "Digital rewards like discount codes are delivered instantly. Physical rewards typically ship within 5-7 business days."
    },
    {
      id: "faq-4",
      question: "Can I transfer my points to someone else?",
      answer: "Currently, points cannot be transferred between accounts. Each account's points can only be redeemed by that account holder."
    }
  ];

  const playMemoryGame = () => {
    toast.success("Coming Soon!", {
      description: "The Memory game will be available in our next update!",
      position: "top-center"
    });
  };

  const playQuizGame = () => {
    toast.success("Coming Soon!", {
      description: "The XForge Quiz will be available in our next update!",
      position: "top-center"
    });
  };

  const playDailyChallenge = () => {
    toast.success("Coming Soon!", {
      description: "Daily Challenges will be available in our next update!",
      position: "top-center"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark via-[#1a1f24] to-[#141b22]">
      <Header />
      <main className="flex-grow pb-16">
        {/* Hero Section with Animated Background */}
        <div className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#1a1a1a] opacity-90"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-[10%] w-20 h-20 rounded-full bg-xforge-teal/20 blur-3xl animate-float"></div>
              <div className="absolute top-[30%] right-[15%] w-32 h-32 rounded-full bg-[#8B5CF6]/20 blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
              <div className="absolute bottom-[20%] left-[20%] w-40 h-40 rounded-full bg-[#F97316]/20 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
            </div>
          </div>

          <div className="container mx-auto relative z-10 px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-xforge-teal/30 rounded-full mb-4 backdrop-blur-md">
                <Trophy className="h-6 w-6 text-xforge-teal animate-pulse-light" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-xforge-teal to-[#02c4af]">
                XForge Rewards Hub
              </h1>
              <p className="text-xforge-gray max-w-2xl mx-auto">
                Play games, earn points, and redeem exclusive XForge products and experiences.
                Your journey to amazing rewards starts here!
              </p>
            </div>

            {/* Points Card */}
            <div className="relative max-w-4xl mx-auto mt-8">
              <div className="absolute inset-0 bg-gradient-to-r from-xforge-teal/20 to-[#8B5CF6]/20 blur-xl rounded-3xl"></div>
              <div className="relative glass-dark rounded-3xl overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent z-0"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <h2 className="text-white font-bold text-2xl mb-2">Your Rewards Balance</h2>
                      <p className="text-xforge-gray max-w-md">
                        Redeem your points for exclusive rewards and enjoy special perks as you level up.
                      </p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-xforge-teal/10 blur-xl rounded-full"></div>
                      <div className="relative glass-teal rounded-full p-8 text-center border border-xforge-teal/30">
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-xforge-teal">{currentPoints}</span>
                          <span className="text-white ml-2 text-xl">Points</span>
                        </div>
                        <div className="flex items-center justify-center mt-3 text-xforge-gray">
                          <Sparkles className="h-4 w-4 text-xforge-teal mr-2" />
                          <span>Silver Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Points Earning Methods */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    <div className="bg-xforge-dark/60 backdrop-blur-sm p-5 rounded-xl text-center border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300 transform hover:-translate-y-1 card-3d">
                      <div className="w-12 h-12 bg-xforge-teal/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Tag className="h-5 w-5 text-xforge-teal" />
                      </div>
                      <p className="text-white font-medium mb-1">Shop Products</p>
                      <p className="text-xforge-gray text-sm">1 Point per $1</p>
                    </div>
                    <div className="bg-xforge-dark/60 backdrop-blur-sm p-5 rounded-xl text-center border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300 transform hover:-translate-y-1 card-3d">
                      <div className="w-12 h-12 bg-xforge-teal/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="h-5 w-5 text-xforge-teal" />
                      </div>
                      <p className="text-white font-medium mb-1">Promo Codes</p>
                      <p className="text-xforge-gray text-sm">25-100 Points</p>
                    </div>
                    <div className="bg-xforge-dark/60 backdrop-blur-sm p-5 rounded-xl text-center border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300 transform hover:-translate-y-1 card-3d">
                      <div className="w-12 h-12 bg-xforge-teal/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-5 w-5 text-xforge-teal" />
                      </div>
                      <p className="text-white font-medium mb-1">Write Reviews</p>
                      <p className="text-xforge-gray text-sm">50 Points Each</p>
                    </div>
                    <div className="bg-xforge-dark/60 backdrop-blur-sm p-5 rounded-xl text-center border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300 transform hover:-translate-y-1 card-3d">
                      <div className="w-12 h-12 bg-xforge-teal/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-5 w-5 text-xforge-teal" />
                      </div>
                      <p className="text-white font-medium mb-1">Daily Login</p>
                      <p className="text-xforge-gray text-sm">5 Points/Day</p>
                    </div>
                  </div>
                </div>
                
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-xforge-teal/30 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-10 w-20 h-20 bg-gradient-to-br from-[#8B5CF6]/30 to-transparent rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Games Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-[#8B5CF6]/30 to-[#F97316]/30 rounded-full mb-4 backdrop-blur-md">
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Rewards <span className="text-gradient-teal">Arcade</span>
            </h2>
            <p className="text-xforge-gray max-w-2xl mx-auto">
              Test your luck and skill with our collection of games. Win points and exclusive rewards daily!
            </p>
          </div>

          {/* Game Selection Tabs */}
          <div className="flex justify-center mb-12 overflow-x-auto py-2">
            <div className="inline-flex bg-xforge-darkgray/60 backdrop-blur-md rounded-full p-1.5 border border-white/5">
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeGameTab === 'wheel' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveGameTab('wheel')}
              >
                Prize Wheel
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeGameTab === 'slots' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveGameTab('slots')}
              >
                Slot Machine
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeGameTab === 'memory' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveGameTab('memory')}
              >
                Memory Game
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeGameTab === 'quiz' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveGameTab('quiz')}
              >
                XForge Quiz
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeGameTab === 'daily' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveGameTab('daily')}
              >
                Daily Challenge
              </button>
            </div>
          </div>
          
          {/* Game Display Area */}
          <div className="relative min-h-[400px] bg-gradient-to-br from-xforge-dark/80 to-[#131e27] rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-xforge-teal/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#8B5CF6]/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className={`transition-all duration-500 ${activeGameTab === 'wheel' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
              </div>
              
              <div className={`transition-all duration-500 ${activeGameTab === 'slots' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
              </div>
              
              {/* Memory Game (Coming Soon) */}
              <div className={`transition-all duration-500 h-full ${activeGameTab === 'memory' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="bg-xforge-teal/20 p-6 rounded-full mb-6">
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Memory Match Challenge</h3>
                  <p className="text-xforge-gray text-center max-w-md mb-8">
                    Test your memory skills by matching XForge product pairs. The faster you match, the more points you earn!
                  </p>
                  <button 
                    onClick={playMemoryGame}
                    className="px-8 py-4 bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold rounded-full hover:shadow-lg hover:shadow-xforge-teal/20 transition-all duration-300"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
              
              {/* XForge Quiz (Coming Soon) */}
              <div className={`transition-all duration-500 h-full ${activeGameTab === 'quiz' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="bg-[#8B5CF6]/20 p-6 rounded-full mb-6">
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">XForge Knowledge Quiz</h3>
                  <p className="text-xforge-gray text-center max-w-md mb-8">
                    Test your knowledge about XForge products and earn points for correct answers. New questions every week!
                  </p>
                  <button 
                    onClick={playQuizGame}
                    className="px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white font-bold rounded-full hover:shadow-lg hover:shadow-[#8B5CF6]/20 transition-all duration-300"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
              
              {/* Daily Challenge (Coming Soon) */}
              <div className={`transition-all duration-500 h-full ${activeGameTab === 'daily' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="bg-[#F97316]/20 p-6 rounded-full mb-6">
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Daily Challenge</h3>
                  <p className="text-xforge-gray text-center max-w-md mb-8">
                    Complete a new challenge every day to earn bonus points. Chain consecutive days for multipliers!
                  </p>
                  <button 
                    onClick={playDailyChallenge}
                    className="px-8 py-4 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white font-bold rounded-full hover:shadow-lg hover:shadow-[#F97316]/20 transition-all duration-300"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rewards Catalog Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-xforge-teal/20 rounded-full mb-4 backdrop-blur-md">
              <Gift className="h-6 w-6 text-xforge-teal" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Rewards <span className="text-gradient-teal">Catalog</span>
            </h2>
            <p className="text-xforge-gray max-w-2xl mx-auto">
              Redeem your hard-earned points for exclusive products, discounts, and special perks.
            </p>
          </div>
          
         {/* Type Navigation */}
            <div className="mb-10">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  className={`px-5 py-2.5 rounded-full transition-all duration-300 ${
                    expandedCategory === 'all' 
                      ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                      : 'bg-xforge-darkgray/60 backdrop-blur-sm text-xforge-gray hover:text-white border border-white/5'
                  }`}
                  onClick={() => setExpandedCategory('all')}
                >
                  All Rewards
                </button>
                {rewardTypes.map(type => (
                  <button 
                    key={type.id}
                    className={`px-5 py-2.5 rounded-full transition-all duration-300 ${
                      expandedCategory === type.id 
                        ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                        : 'bg-xforge-darkgray/60 backdrop-blur-sm text-xforge-gray hover:text-white border border-white/5'
                    }`}
                    onClick={() => setExpandedCategory(type.id)}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

                   {/* Rewards Grid */}
                    <div className="max-w-7xl mx-auto">
                      {expandedCategory === 'all' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {allRewards.map(reward => (
                            <div 
                              key={reward._id} 
                              className="bg-gradient-to-br from-xforge-dark/90 to-[#141b22] rounded-xl overflow-hidden shadow-xl border border-white/5 transition-all duration-500 hover:shadow-xforge-teal/20 transform hover:scale-[1.02] card-3d p-6"
                            >
                              <h3 className="text-white font-bold text-xl mb-3">{reward.name}</h3>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xforge-teal font-bold">{reward.pointsRequired} Points</span>
                                <span className="text-xforge-gray">{reward.type}</span>
                              </div>
                              {/* Check if the user has claimed the reward */}
                              {/* Check if the user has claimed the reward */}
                                    {user && (
                                      (reward.UsersClaimed && Array.isArray(reward.UsersClaimed) && 
                                      reward.UsersClaimed.some(claim => String(claim.userId) === String(user.id))) || 
                                      (user.rewardsclaimed && Array.isArray(user.rewardsclaimed) && 
                                      user.rewardsclaimed.some(claimed => String(claimed.rewardsid) === String(reward._id))) 
                                    ) ? (
                                      <button 
                                        className="w-full py-3.5 rounded-lg font-bold bg-gray-600 text-white cursor-not-allowed"
                                        disabled
                                      >
                                        You Have Already Claimed This Reward
                                      </button>
                                    ) : (
                                      <button 
                                        className={`w-full py-3.5 rounded-lg font-bold transition-all duration-300 ${
                                          currentPoints >= reward.pointsRequired 
                                            ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark hover:shadow-lg hover:shadow-xforge-teal/20' 
                                            : 'bg-xforge-dark/80 text-xforge-gray cursor-not-allowed border border-xforge-gray/20'
                                        }`}
                                        onClick={() => handleRedeemReward(reward._id, reward.name, reward.pointsRequired)}
                                        disabled={currentPoints < reward.pointsRequired}
                                      >
                                        {currentPoints >= reward.pointsRequired 
                                          ? 'Redeem Reward' 
                                          : `Need ${reward.pointsRequired - currentPoints} more points`}
                                      </button>
                                    )}
                            </div>
                          ))}
                        </div>
                      ) : (
                <>
                  {rewardTypes
                    .filter(type => type.id === expandedCategory)
                    .map(type => (
                      <div key={type.id}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {allRewards
                            .filter(reward => reward.type === type.id) // Filter rewards based on type
                            .map(reward => (
                              <div 
                                key={reward._id} 
                                className="bg-gradient-to-br from-xforge-dark/90 to-[#141b22] rounded-xl overflow-hidden shadow-xl border border-white/5 transition-all duration-500 hover:shadow-xforge-teal/20 transform hover:scale-[1.02] card-3d p-6"
                              >
                                <h3 className="text-white font-bold text-xl mb-3">{reward.name}</h3>
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-xforge-teal font-bold">{reward.pointsRequired} Points</span>
                                  <span className="text-xforge-gray">{reward.type}</span>
                                </div>
                               {/* Check if the user has claimed the reward */}
                               {/* Check if the user has claimed the reward */}
                                {user && (
                                  (reward.UsersClaimed && Array.isArray(reward.UsersClaimed) && 
                                  reward.UsersClaimed.some(claim => String(claim.userId) === String(user.id))) || 
                                  (user.rewardsclaimed && Array.isArray(user.rewardsclaimed) && 
                                  user.rewardsclaimed.some(claimed => String(claimed.rewardsid) === String(reward._id))) 
                                ) ? (
                                  <button 
                                    className="w-full py-3.5 rounded-lg font-bold bg-gray-600 text-white cursor-not-allowed"
                                    disabled
                                  >
                                    You Have Already Claimed This Reward
                                  </button>
                                ) : (
                                  <button 
                                    className={`w-full py-3.5 rounded-lg font-bold transition-all duration-300 ${
                                      currentPoints >= reward.pointsRequired 
                                        ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark hover:shadow-lg hover:shadow-xforge-teal/20' 
                                        : 'bg-xforge-dark/80 text-xforge-gray cursor-not-allowed border border-xforge-gray/20'
                                    }`}
                                    onClick={() => handleRedeemReward(reward._id, reward.name, reward.pointsRequired)}
                                    disabled={currentPoints < reward.pointsRequired}
                                  >
                                    {currentPoints >= reward.pointsRequired 
                                      ? 'Redeem Reward' 
                                      : `Need ${reward.pointsRequired - currentPoints} more points`}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
          </div>

        {/* Rewards History Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-gradient-teal">Reward History</span>
              <div className="h-px flex-grow bg-gradient-to-r from-xforge-teal/50 to-transparent"></div>
            </h2>
            
            {rewardsHistory.length > 0 ? (
              <div className="bg-gradient-to-br from-xforge-dark/80 to-[#141b22] rounded-xl overflow-hidden shadow-lg border border-white/5 backdrop-blur-sm">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white font-semibold">Recently Redeemed Rewards</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {rewardsHistory.map(reward => (
                    <div key={reward.id} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-white font-medium">{reward.name}</h4>
                          <div className="flex items-center text-xforge-gray text-sm mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(reward.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center bg-xforge-dark/60 px-4 py-2 rounded-lg border border-white/5">
                          <Gift className="h-4 w-4 text-xforge-teal mr-2" />
                          <span className="text-xforge-teal font-bold">{reward.pointsCost} Points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-xforge-dark/80 to-[#141b22] rounded-xl p-8 text-center border border-white/5 backdrop-blur-sm">
                <p className="text-xforge-gray">
                  You haven't redeemed any rewards yet. Start using your points today!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-gradient-teal">Frequently Asked Questions</span>
              <div className="h-px flex-grow bg-gradient-to-r from-xforge-teal/50 to-transparent"></div>
            </h2>
            
            <div className="space-y-4">
              {faqItems.map((faq) => (
                <div key={faq.id} className="bg-gradient-to-br from-xforge-dark/80 to-[#141b22] rounded-xl overflow-hidden shadow-lg border border-white/5 backdrop-blur-sm">
                  <button
                    className="w-full p-6 flex items-center justify-between text-left transition-colors hover:bg-white/5"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className="text-white font-bold">{faq.question}</span>
                    <div className="w-8 h-8 rounded-full bg-xforge-teal/10 flex items-center justify-center flex-shrink-0">
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-xforge-teal" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-xforge-teal" />
                      )}
                    </div>
                  </button>
                  
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <p className="text-xforge-gray">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rewards;