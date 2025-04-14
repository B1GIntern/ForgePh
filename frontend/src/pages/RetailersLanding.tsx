import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Milestones from "@/components/Milestone";
import TermsConditions from "@/components/TermsConditions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronRight, Store, Users, ShieldCheck, ShieldX, Award, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

// Define User interface similar to Header component
interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
}

const RetailersLanding: React.FC = () => {
  const [isVerified, setIsVerified] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMilestones, setShowMilestones] = useState(false);
  const navigate = useNavigate();
  
  const [news, setNews] = useState([
    {
      id: 1,
      title: "New XForge Pro Collection Launch",
      date: "April 15, 2025",
      excerpt: "Introducing our most advanced devices yet with extended battery life and unique flavor profiles.",
      image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["Product Launch", "Featured"]
    },
    {
      id: 2,
      title: "Summer Retailer Conference 2025",
      date: "May 10, 2025",
      excerpt: "Join us for our annual retailer conference with exclusive previews and networking opportunities.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["Event", "Conference"]
    },
    {
      id: 3,
      title: "Updated Retailer Policies for Q3",
      date: "June 1, 2025",
      excerpt: "Important changes to our retailer program including new incentives and promotional materials.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["Policy Update", "Important"]
    }
  ]);

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      setLoading(true); 
      // Get auth token from storage
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      // Get basic user data from storage first to display something quickly
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }

      // Then, fetch fresh user data from the server
      const response = await fetch("http://localhost:5001/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      };

      // Update state with fresh user data
      setUser(fullUser);

      // Update localStorage/sessionStorage with fresh data
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(fullUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(fullUser));
      }

      console.log("Updated user data from server:", fullUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user data when the component mounts
    fetchUserData();

    // Set up event listeners for updates
    const handleAuthChange = () => fetchUserData();
    const handleUserUpdate = () => fetchUserData();

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("storage", handleAuthChange);

    // Clean up listeners when component unmounts
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    // Set page title
    document.title = "ForgePh Retailers Portal";
  }, []);

  // Fallback values for when user data is loading
  const userName = user ? user.name : "Retailer";
  const userPoints = user ? user.points : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-xforge-dark via-xforge-darkgray to-black relative">
      {/* Background decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-xforge-teal/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
      
      <Header />
      
      <main className="flex-grow pt-24 relative z-10">
        {/* Welcome Banner with Animated Elements */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-xforge-dark to-transparent opacity-70"></div>
          <div className="container relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-3/5 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Welcome, <span className="text-gradient-teal bg-clip-text text-transparent bg-gradient-to-r from-xforge-teal to-cyan-400">{userName}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {isVerified ? (
                    <Badge className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 flex items-center gap-1 px-4 py-1.5 rounded-full transition-all duration-300 shadow-lg shadow-green-900/20">
                      <ShieldCheck className="w-4 h-4" /> Verified Retailer
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500 flex items-center gap-1 px-4 py-1.5 rounded-full transition-all duration-300 shadow-lg shadow-red-900/20">
                      <ShieldX className="w-4 h-4" /> Verification Pending
                    </Badge>
                  )}
                  <span className="text-xforge-lightgray bg-xforge-dark/50 px-4 py-1.5 rounded-full border border-xforge-gray/20">Silver Member</span>
                </div>
                <p className="text-xforge-lightgray max-w-xl mb-8 text-lg leading-relaxed">
                  Track your progress, manage your inventory, stay updated with the latest news, and redeem exclusive rewards for our valued retail partners.
                </p>
              </div>
              
              <div className="w-full md:w-2/5 max-w-md">
                <div className="glass-card relative backdrop-blur-xl bg-xforge-dark/40 p-8 rounded-2xl border border-xforge-teal/20 shadow-xl animate-fade-in transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Retailer Status</h3>
                  
                  <div className="mb-6 bg-xforge-dark/50 p-4 rounded-xl border border-white/5">
                    <div className="text-sm text-xforge-lightgray mb-1">Your Points Balance</div>
                    <div className="flex items-end">
                      <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">{userPoints.toLocaleString()}</span>
                      <span className="text-xforge-lightgray ml-2 mb-1">points</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-center">
                      <div className="relative w-40 h-40 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-xforge-teal/20 to-cyan-400/20 animate-pulse-slow"></div>
                        <div className="absolute inset-2 rounded-full bg-xforge-dark/80 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">Silver</div>
                            <div className="text-xforge-lightgray text-sm mt-1">Tier Ranking</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-xforge-lightgray mb-2">
                          <span>Bronze</span>
                          <span>Silver</span>
                          <span>Gold</span>
                          <span>Platinum</span>
                        </div>
                        <div className="h-2 bg-xforge-dark/60 rounded-full overflow-hidden">
                          <div className="h-full w-[45%] bg-gradient-to-r from-xforge-teal to-cyan-400 rounded-full"></div>
                        </div>
                        <div className="text-right text-xs text-xforge-teal mt-1">5,000 more points to Gold</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-xforge-dark/60 p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-xforge-teal/30">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="text-xforge-teal h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">12</div>
                            <div className="text-xs text-xforge-lightgray">Customer Referrals</div>
                          </div>
                        </div>
                        <div className="bg-xforge-dark/60 p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-xforge-teal/30">
                          <div className="flex items-center justify-center mb-1">
                            <Store className="text-xforge-teal h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">#38</div>
                            <div className="text-xs text-xforge-lightgray">Store Ranking</div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 border-xforge-teal/30 text-xforge-teal hover:bg-xforge-teal/10 rounded-xl transition-all duration-300 flex items-center justify-center"
                        onClick={() => setShowMilestones(true)}
                      >
                        <Award className="mr-2 h-4 w-4" /> View Milestone Journey
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Milestone Dialog/Modal */}
        <Dialog open={showMilestones} onOpenChange={setShowMilestones}>
          <DialogContent className="bg-gradient-to-b from-xforge-dark to-xforge-darkgray/95 border-xforge-teal/20 text-white max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl p-0">
            {/* Header area with decorative elements */}
            <div className="sticky top-0 z-20 bg-gradient-to-b from-xforge-dark to-xforge-darkgray/95">
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-xforge-teal/30 to-purple-600/30 overflow-hidden">
                  <div className="absolute -left-20 -top-20 w-64 h-64 bg-xforge-teal/20 rounded-full blur-3xl"></div>
                  <div className="absolute -right-10 top-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
                </div>
                
                <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center px-10">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-xforge-teal to-cyan-500 p-3 rounded-2xl mr-5 shadow-lg shadow-xforge-teal/20">
                      <Award className="h-8 w-8 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">
                        Your Milestone Journey
                      </h2>
                      <p className="text-xforge-lightgray text-lg mt-1">
                        Track your achievements and unlock exclusive rewards
                      </p>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => setShowMilestones(false)} className="absolute top-4 right-4 rounded-full p-2 hover:bg-xforge-dark/60 bg-black/30 backdrop-blur-md transition-all duration-300 z-10">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress tracker */}
            <div className="px-10 py-8 border-b border-white/10">
              <div className="flex flex-col md:flex-row items-stretch gap-8">
                {/* Current status */}
                <div className="w-full md:w-1/3 bg-xforge-dark/60 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                  <h3 className="text-lg font-semibold text-xforge-lightgray mb-4">Current Status</h3>
                  <div className="flex items-center justify-center bg-gradient-to-br from-xforge-teal/10 to-cyan-400/10 p-6 rounded-xl mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400 mb-1">Silver</div>
                      <div className="text-xforge-lightgray text-sm">Tier Ranking</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-xforge-lightgray mb-2">Points Balance</div>
                    <div className="text-3xl font-bold text-white">10,000</div>
                    <div className="text-xs text-xforge-teal mt-1">
                      5,000 more points to reach Gold
                    </div>
                  </div>
                </div>
                
                {/* Progress path */}
                <div className="w-full md:w-2/3 bg-xforge-dark/60 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                  <h3 className="text-lg font-semibold text-xforge-lightgray mb-4">Your Progress Path</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center mb-2 opacity-60">
                        <span className="text-white font-bold">Bronze</span>
                      </div>
                      <span className="text-xs text-xforge-lightgray">0 pts</span>
                    </div>
                    <div className="h-1 flex-grow mx-3 bg-gradient-to-r from-gray-600 to-xforge-teal/80"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-xforge-teal to-cyan-400 flex items-center justify-center mb-2 shadow-lg shadow-xforge-teal/20 animate-pulse-slow">
                        <span className="text-black font-bold">Silver</span>
                      </div>
                      <span className="text-xs text-xforge-teal font-semibold">10,000 pts</span>
                    </div>
                    <div className="h-1 flex-grow mx-3 bg-xforge-dark/80"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center mb-2 opacity-40">
                        <span className="text-black font-bold">Gold</span>
                      </div>
                      <span className="text-xs text-xforge-lightgray">15,000 pts</span>
                    </div>
                    <div className="h-1 flex-grow mx-3 bg-xforge-dark/80"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-300 to-gray-100 flex items-center justify-center mb-2 opacity-40">
                        <span className="text-black font-bold">Platinum</span>
                      </div>
                      <span className="text-xs text-xforge-lightgray">25,000 pts</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="text-sm text-xforge-lightgray">Your current tier: <span className="text-xforge-teal font-semibold">Silver</span></div>
                    {/* <Button variant="link" className="text-xforge-teal text-sm p-0">
                     <ChevronRight className="ml-1 h-4 w-4" />
                    </Button> */}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Milestone benefits */}
            <div className="p-10">
              <h3 className="text-xl font-bold text-white mb-6">Unlocked Benefits</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-xforge-dark/40 rounded-xl p-5 border border-xforge-teal/20 transition-all duration-300 hover:border-xforge-teal/40 hover:bg-xforge-dark/50">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-xforge-teal/20 to-cyan-400/20 p-3 rounded-lg mr-4">
                      <Award className="h-6 w-6 text-xforge-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Priority Customer Support</h4>
                      <p className="text-sm text-xforge-lightgray">Get prioritized support with dedicated account manager access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* News Preview Section with Card Hover Effects */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-xforge-dark/90 to-black"></div>
          <div className="container relative z-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">Latest News</h2>
              <Button variant="outline" onClick={() => navigate("/news")} className="flex items-center border-xforge-teal/30 text-xforge-teal hover:bg-xforge-teal/10 px-5 py-2 rounded-xl transition-all duration-300">
                View All News <ChevronRight className="ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <Card key={item.id} className="glass-card backdrop-blur-sm bg-xforge-dark/40 border-xforge-lightgray/10 overflow-hidden rounded-xl transition-all duration-500 hover:shadow-2xl hover:shadow-xforge-teal/10 hover:border-xforge-teal/30 h-full group animate-fade-in" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="h-52 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-xforge-teal/10 text-xforge-teal border-xforge-teal/30 rounded-full px-3 py-1 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-white text-xl group-hover:text-xforge-teal transition-colors duration-300">{item.title}</CardTitle>
                    <CardDescription className="flex items-center text-xforge-lightgray mt-2">
                      <Calendar className="w-4 h-4 mr-1" /> {item.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xforge-gray mb-4">{item.excerpt}</p>
                    <Button variant="ghost" className="text-xforge-teal hover:text-white p-0 group-hover:translate-x-1 transition-transform duration-300">
                      Read More <ChevronRight className="ml-1 w-4 h-4 group-hover:ml-2 transition-all duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Terms & Conditions Section */}
        <section className="pb-16 relative z-10">
          <div className="container">
            <div className="glass-card backdrop-blur-xl bg-xforge-dark/40 p-8 rounded-2xl border border-xforge-teal/20 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">Terms & Conditions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Retailer Agreement</h3>
                  <p className="text-xforge-lightgray text-sm leading-relaxed">
                    As a verified retailer, you agree to maintain XForge product standards,
                    adhere to pricing guidelines, and participate in our quality assurance program.
                  </p>
                  <Button variant="link" className="text-xforge-teal p-0 flex items-center text-sm">
                    View Full Agreement <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Privacy Policy</h3>
                  <p className="text-xforge-lightgray text-sm leading-relaxed">
                    We respect your privacy and are committed to protecting your personal data.
                    Our privacy policy outlines how we collect, use, and safeguard your information.
                  </p>
                  <Button variant="link" className="text-xforge-teal p-0 flex items-center text-sm">
                    Privacy Details <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Points & Rewards</h3>
                  <p className="text-xforge-lightgray text-sm leading-relaxed">
                    Points are earned through verified sales, customer referrals, and promotional activities.
                    Points can be redeemed for exclusive benefits and product discounts.
                  </p>
                  <Button variant="link" className="text-xforge-teal p-0 flex items-center text-sm">
                    Rewards Program <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-xforge-lightgray/10 text-center">
                <p className="text-xforge-gray text-sm">
                  By continuing to use this platform, you acknowledge that you have read and agree to our 
                  <Button variant="link" className="text-xforge-teal px-1 py-0">Terms of Service</Button> and
                  <Button variant="link" className="text-xforge-teal px-1 py-0">Privacy Policy</Button>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RetailersLanding;