
import React, { useState } from "react";
import { Award, Check, Calendar, Gift, Zap, RefreshCw, ArrowRight, Clock, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";

type Activity = {
  id: number;
  name: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  completed: boolean;
  color: string;
};

type FlashPromo = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  prize: string;
  winners: number;
  active: boolean;
};

const UserActivities: React.FC = () => {
  const { addNotification } = useNotifications();
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      name: "Daily Login",
      description: "Log in every day to earn points",
      points: 5,
      icon: <Clock className="h-5 w-5" />,
      completed: true,
      color: "#06b6d4"
    },
    {
      id: 2,
      name: "Share on Social Media",
      description: "Share your XForge experience on social media",
      points: 50,
      icon: <Star className="h-5 w-5" />,
      completed: false,
      color: "#f97316"
    },
    {
      id: 3,
      name: "Watch Tutorial Video",
      description: "Watch the full XForge product tutorial",
      points: 25,
      icon: <Zap className="h-5 w-5" />,
      completed: false,
      color: "#8b5cf6"
    },
    {
      id: 4,
      name: "Register Forge Pack Code",
      description: "Register a valid Forge pack code to earn points",
      points: 100,
      icon: <Award className="h-5 w-5" />,
      completed: false,
      color: "#ec4899"
    },
    {
      id: 5,
      name: "Complete Profile",
      description: "Fill out all fields in your profile",
      points: 35,
      icon: <Check className="h-5 w-5" />,
      completed: false,
      color: "#84cc16"
    }
  ]);

  const [flashPromos, setFlashPromos] = useState<FlashPromo[]>([
    {
      id: 1,
      name: "Summer Flash Promo",
      description: "Enter a valid Forge pack code during the promotion period for a chance to win!",
      startDate: "June 6, 2025",
      endDate: "June 30, 2025",
      prize: "PHP 200 GCash Voucher",
      winners: 100,
      active: true
    },
    {
      id: 2,
      name: "Back to School Promo",
      description: "Special promotion for students. Complete all activities to enter!",
      startDate: "August 1, 2025",
      endDate: "August 15, 2025",
      prize: "XForge Premium Pack + PHP 500 GCash",
      winners: 50,
      active: false
    }
  ]);

  const [promoCode, setPromoCode] = useState("");
  
  const completeActivity = (id: number) => {
    setActivities(activities.map(activity => {
      if (activity.id === id && !activity.completed) {
        // Check for points multiplier in localStorage
        const multiplier = parseInt(localStorage.getItem('pointsMultiplier') || '1');
        const pointsEarned = activity.points * multiplier;
        
        // Show notification with multiplier if applicable
        if (multiplier > 1) {
          addNotification({
            title: `${pointsEarned} Points Earned! (${multiplier}x)`,
            message: `You've completed "${activity.name}" and earned ${pointsEarned} points with your ${multiplier}x multiplier!`,
            type: "points"
          });
        } else {
          addNotification({
            title: `${pointsEarned} Points Earned!`,
            message: `You've completed "${activity.name}" and earned ${pointsEarned} points!`,
            type: "points"
          });
        }
        
        return { ...activity, completed: true };
      }
      return activity;
    }));
  };

  const handlePromoCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (promoCode.trim() === "") {
      toast.error("Please enter a valid Forge pack code");
      return;
    }
    
    // Check if code is a winning code (simulated)
    const isWinner = Math.random() < 0.1; // 10% chance to win
    
    if (isWinner) {
      toast.success("Congratulations! You've won a flash promo prize!", {
        description: "PHP 200 GCash Voucher will be sent to your registered mobile number.",
        position: "top-center"
      });
      
      addNotification({
        title: "Flash Promo Winner!",
        message: "You've won PHP 200 GCash Voucher! It will be sent to your registered mobile number.",
        type: "points"
      });
    } else {
      // Award consolation points
      const pointsAwarded = 25;
      
      // Check for multiplier
      const multiplier = parseInt(localStorage.getItem('pointsMultiplier') || '1');
      const totalPoints = pointsAwarded * multiplier;
      
      if (multiplier > 1) {
        toast.success(`Code registered successfully! (${multiplier}x Bonus)`, {
          description: `You've earned ${totalPoints} points with your ${multiplier}x multiplier!`,
          position: "top-center"
        });
      } else {
        toast.success("Code registered successfully!", {
          description: `You've earned ${totalPoints} points!`,
          position: "top-center"
        });
      }
      
      addNotification({
        title: `${totalPoints} Points Earned!`,
        message: `You've registered a Forge pack code and earned ${totalPoints} points!`,
        type: "points"
      });
    }
    
    setPromoCode("");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activities Section */}
          <div>
            <div className="mb-6 flex items-center">
              <div className="bg-xforge-teal/20 p-3 rounded-full mr-3">
                <Zap className="h-6 w-6 text-xforge-teal" />
              </div>
              <h2 className="text-2xl font-bold text-white">Daily Activities</h2>
            </div>
            
            <div className="bg-gradient-to-br from-xforge-dark/80 to-[#141b22] rounded-xl border border-white/5 shadow-lg overflow-hidden">
              <div className="divide-y divide-white/5">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`p-4 transition-all duration-300 ${
                      activity.completed 
                        ? 'bg-xforge-teal/5' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className={`h-10 w-10 rounded-full flex items-center justify-center mr-4`}
                          style={{ background: `${activity.color}30` }}
                        >
                          <div className="text-white">
                            {activity.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium flex items-center">
                            {activity.name}
                            {activity.completed && (
                              <span className="ml-2 bg-green-500/20 text-green-400 text-xs py-1 px-2 rounded-full flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Completed
                              </span>
                            )}
                          </h3>
                          <p className="text-xforge-gray text-sm">{activity.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-xforge-teal font-bold mr-4 flex items-center">
                          <Gift className="h-4 w-4 mr-1" />
                          {activity.points} points
                        </div>
                        
                        <Button 
                          variant={activity.completed ? "outline" : "default"}
                          className={
                            activity.completed 
                              ? "text-xforge-gray border-xforge-gray/30 cursor-not-allowed"
                              : "bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark hover:brightness-110"
                          }
                          disabled={activity.completed}
                          onClick={() => completeActivity(activity.id)}
                        >
                          {activity.completed ? 'Completed' : 'Complete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Flash Promos Section */}
          <div>
            <div className="mb-6 flex items-center">
              <div className="bg-pink-600/20 p-3 rounded-full mr-3">
                <Zap className="h-6 w-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Flash Promotions</h2>
            </div>
            
            <div className="bg-gradient-to-br from-xforge-dark/80 to-[#141b22] rounded-xl border border-white/5 shadow-lg overflow-hidden mb-6">
              <form onSubmit={handlePromoCodeSubmit} className="p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white mb-2">Enter Forge Pack Code</h3>
                <p className="text-xforge-gray mb-4">
                  Register a valid Forge pack code to earn points and get a chance to win prizes during active promotions!
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter Forge pack code"
                    className="flex-1 bg-xforge-dark/60 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-xforge-teal/50"
                  />
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:brightness-110"
                  >
                    Submit
                  </Button>
                </div>
              </form>
              
              <div className="divide-y divide-white/5">
                {flashPromos.map((promo) => (
                  <div 
                    key={promo.id} 
                    className={`p-6 transition-all duration-300 ${
                      promo.active ? 'bg-gradient-to-r from-pink-600/10 to-purple-600/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                        {promo.name}
                        {promo.active && (
                          <span className="ml-2 bg-pink-600/20 text-pink-400 text-xs py-1 px-2 rounded-full flex items-center animate-pulse-light">
                            <Zap className="h-3 w-3 mr-1" /> Active Now
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center text-xforge-gray text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{promo.startDate} - {promo.endDate}</span>
                      </div>
                    </div>
                    
                    <p className="text-xforge-gray mb-4">{promo.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-white/5">
                        <span className="text-xforge-gray text-sm">Prize</span>
                        <div className="text-white font-bold flex items-center">
                          <Award className="h-4 w-4 text-amber-400 mr-1" />
                          {promo.prize}
                        </div>
                      </div>
                      
                      <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-white/5">
                        <span className="text-xforge-gray text-sm">Total Winners</span>
                        <div className="text-white font-bold">{promo.winners}</div>
                      </div>
                      
                      {promo.active ? (
                        <div className="ml-auto">
                          <Button 
                            variant="outline" 
                            className="border-pink-500 text-pink-400 hover:bg-pink-500/20"
                          >
                            View Details 
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="ml-auto flex items-center text-xforge-gray">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-xforge-dark/80 to-[#141b22] rounded-xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Promo Details</h3>
                <div className="text-xs bg-xforge-dark/60 px-3 py-1 rounded-full border border-white/5 text-xforge-gray">
                  <RefreshCw className="h-3 w-3 inline-block mr-1" /> Updated daily
                </div>
              </div>
              
              <div className="text-xforge-gray space-y-4">
                <p className="border-l-2 border-pink-500 pl-4">
                  Flash promotions may be added to the list of Activities during the Spin The Wheel Promotion Period.
                </p>
                <p className="border-l-2 border-pink-500 pl-4">
                  Winners of the Forge Flash Promo will be automatically notified upon input of a Valid Forge pack code.
                </p>
                <p className="border-l-2 border-pink-500 pl-4">
                  The prizes awarded upon winning in the Forge Flash Promo are entirely random. Upon notification of a win, the prize awarded is considered final. Participants may not request to replace or return the prize they have won.
                </p>
                <p className="border-l-2 border-pink-500 pl-4">
                  Prizes will be sent to users via SMS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivities;