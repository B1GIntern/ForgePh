import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SpinWheel from "../components/SpinWheel";
import SlotMachine from "../components/SlotMachine";
import UserActivities from "../components/UserActivities";
import MemoryGame from "../components/MemoryGame";
import { Award, ChevronDown, ChevronUp, Check, Gift, Star, Sparkles, Tag, Clock, Dices, Trophy, Target, Zap, Gamepad, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";

const Rewards: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("all");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeGameTab, setActiveGameTab] = useState<string>("wheel");
  const [activeSection, setActiveSection] = useState<string>("games");
  const { toast: uiToast } = useToast();
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    const hasVisitedRewards = localStorage.getItem('visited-rewards');
    if (!hasVisitedRewards) {
      setTimeout(() => {
        addNotification({
          title: "Points Added!",
          message: "You've earned 25 points for visiting our Rewards page!",
          type: "points"
        });
        localStorage.setItem('visited-rewards', 'true');
      }, 2000);
    }
  }, [addNotification]);
  
  const currentPoints = 325;
  
  const handleRedeemReward = (rewardName: string, pointsCost: number) => {
    if (currentPoints >= pointsCost) {
      toast.success("Reward Redeemed!", {
        description: `You've successfully redeemed ${rewardName}`,
        position: "top-center"
      });
      
      addNotification({
        title: "Reward Redeemed",
        message: `You've successfully redeemed ${rewardName} for ${pointsCost} points!`,
        type: "points"
      });
    } else {
      uiToast({
        title: "Not Enough Points",
        description: `You need ${pointsCost - currentPoints} more points to redeem this reward.`,
        variant: "destructive",
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
  
  const rewardCategories = [
    {
      id: "products",
      name: "XForge Products",
      rewards: [
        { id: 1, name: "XForge Pro Device", pointsCost: 2000, image: "https://placehold.co/400x300/292929/02ECCF?text=XForge+Pro", popular: true },
        { id: 2, name: "XForge Flavor Pack", pointsCost: 500, image: "https://placehold.co/400x300/292929/02ECCF?text=Flavor+Pack", popular: false },
        { id: 3, name: "Exclusive XForge Case", pointsCost: 350, image: "https://placehold.co/400x300/292929/02ECCF?text=XForge+Case", popular: true }
      ]
    },
    {
      id: "discounts",
      name: "Discounts & Vouchers",
      rewards: [
        { id: 4, name: "15% Off Next Purchase", pointsCost: 200, image: "https://placehold.co/400x300/292929/02ECCF?text=15%+Off", popular: true },
        { id: 5, name: "Free Shipping Voucher", pointsCost: 100, image: "https://placehold.co/400x300/292929/02ECCF?text=Free+Shipping", popular: false },
        { id: 6, name: "BOGO Offer Code", pointsCost: 450, image: "https://placehold.co/400x300/292929/02ECCF?text=BOGO+Offer", popular: false }
      ]
    },
    {
      id: "merch",
      name: "XForge Merchandise",
      rewards: [
        { id: 7, name: "XForge T-Shirt", pointsCost: 300, image: "https://placehold.co/400x300/292929/02ECCF?text=XForge+Shirt", popular: false },
        { id: 8, name: "XForge Cap", pointsCost: 250, image: "https://placehold.co/400x300/292929/02ECCF?text=XForge+Cap", popular: false },
        { id: 9, name: "XForge Sticker Pack", pointsCost: 75, image: "https://placehold.co/400x300/292929/02ECCF?text=Sticker+Pack", popular: true }
      ]
    }
  ];
  
  const allRewards = rewardCategories.flatMap(category => category.rewards);

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
    setActiveGameTab('memory');
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

        {/* Main Section Tabs */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center mb-12 overflow-x-auto py-2">
            <div className="inline-flex bg-xforge-darkgray/60 backdrop-blur-md rounded-full p-1.5 border border-white/5">
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeSection === 'games' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveSection('games')}
              >
                <Gamepad className="h-4 w-4 inline-block mr-2" />
                Arcade Games
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeSection === 'activities' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveSection('activities')}
              >
                <Zap className="h-4 w-4 inline-block mr-2" />
                Activities & Promos
              </button>
              <button
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeSection === 'rewards' 
                    ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                    : 'text-xforge-gray hover:text-white'
                }`}
                onClick={() => setActiveSection('rewards')}
              >
                <Gift className="h-4 w-4 inline-block mr-2" />
                Rewards Catalog
              </button>
            </div>
          </div>
        </div>

        {/* Games Section */}
        {activeSection === 'games' && (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-[#8B5CF6]/30 to-[#F97316]/30 rounded-full mb-4 backdrop-blur-md">
                <Gamepad className="h-6 w-6 text-white" />
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
                {/* Prize Wheel Game */}
                <div className={`transition-all duration-500 ${activeGameTab === 'wheel' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                  <SpinWheel />
                </div>
                
                {/* Slot Machine Game */}
                <div className={`transition-all duration-500 ${activeGameTab === 'slots' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                  <SlotMachine />
                </div>
                
                {/* Memory Game */}
                <div className={`transition-all duration-500 h-full ${activeGameTab === 'memory' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                  <MemoryGame />
                </div>
                
                {/* XForge Quiz */}
                <div className={`transition-all duration-500 h-full ${activeGameTab === 'quiz' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <div className="bg-[#8B5CF6]/20 p-6 rounded-full mb-6">
                      <Zap className="h-16 w-16 text-[#8B5CF6]" />
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
                
                {/* Daily Challenge */}
                <div className={`transition-all duration-500 h-full ${activeGameTab === 'daily' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <div className="bg-[#F97316]/20 p-6 rounded-full mb-6">
                      <Crown className="h-16 w-16 text-[#F97316]" />
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
        )}

        {/* Activities & Flash Promos Section */}
        {activeSection === 'activities' && (
          <UserActivities />
        )}
        
        {/* Rewards Catalog Section */}
        {activeSection === 'rewards' && (
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
            
            {/* Category Navigation */}
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
                {rewardCategories.map(category => (
                  <button 
                    key={category.id}
                    className={`px-5 py-2.5 rounded-full transition-all duration-300 ${
                      expandedCategory === category.id 
                        ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark font-bold' 
                        : 'bg-xforge-darkgray/60 backdrop-blur-sm text-xforge-gray hover:text-white border border-white/5'
                    }`}
                    onClick={() => setExpandedCategory(category.id)}
                  >
                    {category.name}
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
                      key={reward.id} 
                      className="group perspective-1000"
                    >
                      <div className="bg-gradient-to-br from-xforge-dark/90 to-[#141b22] rounded-xl overflow-hidden shadow-xl border border-white/5 transition-all duration-500 hover:shadow-xforge-teal/20 transform hover:scale-[1.02] card-3d">
                        <div className="relative">
                          <img 
                            src={reward.image}
                            alt={reward.name}
                            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-xforge-dark to-transparent opacity-60"></div>
                          {reward.popular && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark text-xs font-bold px-3 py-1.5 rounded-full flex items-center z-10">
                              <Sparkles className="h-3 w-3 mr-1" /> Popular
                            </div>
                          )}
                        </div>
                        <div className="p-6 border-t border-white/5">
                          <h3 className="text-white font-bold text-xl mb-3 group-hover:text-xforge-teal transition-colors">{reward.name}</h3>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center bg-xforge-teal/10 px-3 py-1.5 rounded-full">
                              <Gift className="h-4 w-4 text-xforge-teal mr-2" />
                              <span className="text-xforge-teal font-bold">{reward.pointsCost} Points</span>
                            </div>
                            {currentPoints >= reward.pointsCost && (
                              <span className="bg-green-900/30 text-green-400 text-xs px-3 py-1.5 rounded-full flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Available
                              </span>
                            )}
                          </div>
                          <button 
                            className={`w-full py-3.5 rounded-lg font-bold transition-all duration-300 ${
                              currentPoints >= reward.pointsCost 
                                ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark hover:shadow-lg hover:shadow-xforge-teal/20' 
                                : 'bg-xforge-dark/80 text-xforge-gray cursor-not-allowed border border-xforge-gray/20'
                            }`}
                            onClick={() => handleRedeemReward(reward.name, reward.pointsCost)}
                          >
                            {currentPoints >= reward.pointsCost ? 'Redeem Reward' : `Need ${reward.pointsCost - currentPoints} more points`}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {rewardCategories
                    .filter(category => category.id === expandedCategory)
                    .map(category => (
                      <div key={category.id}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                          {category.rewards.map(reward => (
                            <div 
                              key={reward.id} 
                              className="group perspective-1000"
                            >
                              <div className="bg-gradient-to-br from-xforge-dark/90 to-[#141b22] rounded-xl overflow-hidden shadow-xl border border-white/5 transition-all duration-500 hover:shadow-xforge-teal/20 transform hover:scale-[1.02] card-3d">
                                <div className="relative">
                                  <img 
                                    src={reward.image}
                                    alt={reward.name}
                                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-xforge-dark to-transparent opacity-60"></div>
                                  {reward.popular && (
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark text-xs font-bold px-3 py-1.5 rounded-full flex items-center z-10">
                                      <Sparkles className="h-3 w-3 mr-1" /> Popular
                                    </div>
                                  )}
                                </div>
                                <div className="p-6 border-t border-white/5">
                                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-xforge-teal transition-colors">{reward.name}</h3>
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center bg-xforge-teal/10 px-3 py-1.5 rounded-full">
                                      <Gift className="h-4 w-4 text-xforge-teal mr-2" />
                                      <span className="text-xforge-teal font-bold">{reward.pointsCost} Points</span>
                                    </div>
                                    {currentPoints >= reward.pointsCost && (
                                      <span className="bg-green-900/30 text-green-400 text-xs px-3 py-1.5 rounded-full flex items-center">
                                        <Check className="h-3 w-3 mr-1" /> Available
                                      </span>
                                    )}
                                  </div>
                                  <button 
                                    className={`w-full py-3.5 rounded-lg font-bold transition-all duration-300 ${
                                      currentPoints >= reward.pointsCost 
                                        ? 'bg-gradient-to-r from-xforge-teal to-[#02c4af] text-xforge-dark hover:shadow-lg hover:shadow-xforge-teal/20' 
                                        : 'bg-xforge-dark/80 text-xforge-gray cursor-not-allowed border border-xforge-gray/20'
                                    }`}
                                    onClick={() => handleRedeemReward(reward.name, reward.pointsCost)}
                                  >
                                    {currentPoints >= reward.pointsCost ? 'Redeem Reward' : `Need ${reward.pointsCost - currentPoints} more points`}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        )}
        
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