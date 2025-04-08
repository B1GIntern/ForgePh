import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { BadgePercent, CheckCircle, AlertCircle, Copy, Gift, Clock, Calendar, Tag, BadgeCheck, Zap, Sparkles, Award, BookOpen, Timer, Ticket, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const PromoCodes: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast: uiToast } = useToast();
  const { addNotification } = useNotifications();
  const [flashTimeRemaining, setFlashTimeRemaining] = useState(3600); // 1 hour in seconds
  const [raffleEntries, setRaffleEntries] = useState(0);
  const [activeTab, setActiveTab] = useState("promos");

  useEffect(() => {
    const hasVisitedPromos = localStorage.getItem('visited-promos');
    if (!hasVisitedPromos) {
      setTimeout(() => {
        addNotification({
          title: "New Promo Code Available!",
          message: "Use XFORGE25 for 25% off your next purchase!",
          type: "promotion"
        });
        localStorage.setItem('visited-promos', 'true');
      }, 2000);
    }

    const timer = setInterval(() => {
      setFlashTimeRemaining(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [addNotification]);

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validPromoCodes = ["XFORGE10", "SUMMER25", "WELCOME15", "XFORGE25", "FLASH50", "RAFFLE10"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      uiToast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (validPromoCodes.includes(promoCode.toUpperCase())) {
        setStatus("success");
        
        if (promoCode.toUpperCase() === "FLASH50") {
          toast.success("Flash Promo code applied successfully!", {
            description: "50% discount applied to your next purchase!",
            position: "top-center",
          });
          
          addNotification({
            title: "Flash Promo Activated!",
            message: "You've unlocked a limited-time 50% discount!",
            type: "promotion"
          });
        } else if (promoCode.toUpperCase() === "RAFFLE10") {
          setRaffleEntries(prev => prev + 1);
          
          toast.success("Raffle entry confirmed!", {
            description: "You've earned 1 entry into the current raffle!",
            position: "top-center",
          });
          
          addNotification({
            title: "Raffle Entry Added",
            message: "You now have " + (raffleEntries + 1) + " entries in the XForge Mega Raffle!",
            type: "points"
          });
        } else {
          toast.success("Promo code applied successfully!", {
            description: "Points have been added to your account!",
            position: "top-center",
          });
          
          addNotification({
            title: "Promo Code Redeemed",
            message: `You've successfully redeemed ${promoCode.toUpperCase()} for 250 points!`,
            type: "points"
          });
        }
      } else {
        setStatus("error");
        toast.error("Invalid code", {
          description: "The promo code you entered is invalid or expired.",
          position: "top-center",
        });
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const resetForm = () => {
    setPromoCode("");
    setStatus("idle");
  };

  const recentRedemptions = [
    { id: 1, code: "SUMMER25", points: 250, date: "2023-06-10" },
    { id: 2, code: "XFORGE10", points: 100, date: "2023-05-22" },
    { id: 3, code: "FLASH50", points: 0, date: "2023-07-05", special: "50% Discount" },
    { id: 4, code: "RAFFLE10", points: 0, date: "2023-07-01", special: "1 Raffle Entry" }
  ];



  const flashPromos = [
    {
      id: 1,
      title: "Flash Sale: 50% OFF",
      code: "FLASH50",
      description: "Limited time offer! Get 50% off on all XForge merchandise.",
      expiry: formatTimeRemaining(flashTimeRemaining),
      discount: "50%",
      participants: 342,
      maxParticipants: 500
    }
  ];

  const raffles = [
    {
      id: 1,
      title: "XForge Mega Raffle",
      prize: "Gaming PC + XForge Ultimate Pack",
      endDate: "August 1, 2023",
      description: "Win a high-end gaming PC and the complete XForge collection!",
      totalEntries: 1287,
      yourEntries: raffleEntries,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Monthly Cash Draw",
      prize: "$500 Cash Prize",
      endDate: "July 31, 2023",
      description: "Monthly cash raffle - this month's prize is $500!",
      totalEntries: 876,
      yourEntries: raffleEntries > 0 ? 1 : 0,
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark to-black overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-xforge-teal/5 blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-2/3 right-1/5 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-pink-500/5 blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      </div>
      
      <Header />
      <main className="flex-grow py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse bg-xforge-teal/20 rounded-full blur-xl"></div>
                <div className="relative p-5 rounded-full bg-gradient-to-br from-xforge-teal/20 to-transparent backdrop-blur-sm border border-xforge-teal/30">
                  <Sparkles className="h-8 w-8 text-xforge-teal" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80">Exclusive</span>{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-xforge-teal to-cyan-400">Promo Codes</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-xforge-teal/0 via-xforge-teal to-xforge-teal/0"></span>
              </span>
            </h1>
            
            <p className="text-xforge-gray/90 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Unlock special rewards, earn points, and access exclusive offers with our promo codes.
              Get started today and maximize your XForge experience!
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-12">
            <Tabs defaultValue="promos" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-xforge-dark/60 border border-white/10 p-1">
                <TabsTrigger value="promos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-xforge-teal/20 data-[state=active]:to-xforge-teal/5 data-[state=active]:text-xforge-teal">
                  <Tag className="h-4 w-4 mr-2" />
                  Promo Codes
                </TabsTrigger>
                <TabsTrigger value="flash" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-pink-500/5 data-[state=active]:text-pink-400">
                  <Zap className="h-4 w-4 mr-2" />
                  Flash Deals
                </TabsTrigger>
                <TabsTrigger value="raffle" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-amber-500/5 data-[state=active]:text-amber-400">
                  <Ticket className="h-4 w-4 mr-2" />
                  Raffles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="promos" className="mt-0">
                <div className="max-w-7xl mx-auto mb-20">
                  <div className="flex items-center mb-12">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 mr-4">
                      <Award className="h-6 w-6 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      <span className="text-white">Featured</span>{" "}
                      <span className="text-amber-400">Offers</span>
                    </h2>
                  </div>
                </div>

                <div className="max-w-3xl mx-auto mb-24 relative">
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-xforge-teal/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-xforge-teal/10 rounded-full blur-3xl"></div>
                  
                  <Card className="backdrop-blur-lg border-white/10 bg-gradient-to-br from-[rgba(30,30,30,0.8)] to-[rgba(20,20,20,0.7)] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-xforge-teal/0 via-xforge-teal to-xforge-teal/0"></div>
                    
                    {status === "idle" && (
                      <form onSubmit={handleSubmit} className="p-8">
                        <CardHeader className="px-0 pt-0">
                          <div className="flex items-center mb-2">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-xforge-teal/20 to-transparent border border-xforge-teal/20 mr-4">
                              <Tag className="h-6 w-6 text-xforge-teal" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Redeem Your Code</CardTitle>
                          </div>
                          <CardDescription className="text-xforge-gray/80">
                            Enter your promo code below to receive exclusive rewards and bonuses
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="px-0 py-6">
                          <div className="relative">
                            <Input
                              type="text"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              placeholder="Enter your promo code here..."
                              className="bg-xforge-dark/60 border-xforge-lightgray/20 focus:border-xforge-teal text-white placeholder:text-xforge-gray/60 py-6 pr-32"
                            />
                            <Button 
                              type="submit" 
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark hover:brightness-110 transition-all shadow-glow"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-xforge-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Validating
                                </span>
                              ) : "Redeem"}
                            </Button>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="p-0">
                          <div className="w-full flex items-center p-4 rounded-lg bg-gradient-to-r from-xforge-teal/10 to-transparent border border-xforge-teal/10">
                            <div className="bg-xforge-teal/10 rounded-full p-2 mr-3">
                              <Gift className="h-5 w-5 text-xforge-teal" />
                            </div>
                            <p className="text-xforge-gray text-sm">
                              Find exclusive promo codes on our product packaging, social media, or during special XForge events.
                            </p>
                          </div>
                        </CardFooter>
                      </form>
                    )}
                    
                    {status === "success" && (
                      <div className="p-8 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 relative">
                          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                          <div className="relative w-full h-full bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">
                          Code Successfully Redeemed!
                        </h3>
                        <p className="text-xforge-gray mb-8 max-w-md mx-auto">
                          You've earned 250 reward points with your promo code. 
                          Check your rewards page to see your updated balance.
                        </p>
                        <Button 
                          onClick={resetForm}
                          className="bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark font-bold hover:brightness-110 transition-all shadow-glow px-8 py-6"
                        >
                          Redeem Another Code
                        </Button>
                      </div>
                    )}
                    
                    {status === "error" && (
                      <div className="p-8 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 relative">
                          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                          <div className="relative w-full h-full bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">
                          Invalid Promo Code
                        </h3>
                        <p className="text-xforge-gray mb-8 max-w-md mx-auto">
                          The promo code you entered is invalid or has expired.
                          Please check the code and try again.
                        </p>
                        <Button 
                          onClick={resetForm}
                          className="bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark font-bold hover:brightness-110 transition-all shadow-glow px-8 py-6"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="max-w-4xl mx-auto mb-24">
                  <div className="flex items-center mb-12">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/20 mr-4">
                      <Gift className="h-6 w-6 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      <span className="text-white">Recent</span>{" "}
                      <span className="text-purple-400">Redemptions</span>
                    </h2>
                  </div>
                  
                  {recentRedemptions.length > 0 ? (
                    <Card className="backdrop-blur-lg border-white/10 bg-gradient-to-br from-[rgba(30,30,30,0.8)] to-[rgba(20,20,20,0.7)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-6 py-4 text-left text-purple-400 font-medium">Code</th>
                              <th className="px-6 py-4 text-left text-purple-400 font-medium">Reward</th>
                              <th className="px-6 py-4 text-left text-purple-400 font-medium">Date Redeemed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentRedemptions.map(redemption => (
                              <tr key={redemption.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="font-mono text-white bg-xforge-dark/60 px-3 py-1 rounded-md border border-purple-500/10">{redemption.code}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                                      <Gift className="h-3 w-3 text-purple-400" />
                                    </div>
                                    <span className="text-purple-400 font-bold">
                                      {redemption.special || `${redemption.points} Points`}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center text-xforge-gray">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {new Date(redemption.date).toLocaleDateString()}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ) : (
                    <Card className="backdrop-blur-lg border-white/10 bg-gradient-to-br from-[rgba(30,30,30,0.8)] to-[rgba(20,20,20,0.7)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 text-center">
                      <p className="text-xforge-gray">
                        You haven't redeemed any promo codes yet.
                      </p>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="flash" className="mt-0">
                <div className="max-w-5xl mx-auto mb-16">
                  <div className="flex items-center mb-12">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/20 mr-4">
                      <Zap className="h-6 w-6 text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      <span className="text-white">Limited Time</span>{" "}
                      <span className="text-pink-400">Flash Deals</span>
                    </h2>
                  </div>
                  
                  {flashPromos.map(promo => (
                    <Card key={promo.id} className="backdrop-blur-lg border-white/10 bg-gradient-to-br from-[rgba(30,30,30,0.9)] to-[rgba(20,20,20,0.8)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] mb-8 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500/0 via-pink-500 to-pink-500/0"></div>
                      
                      <div className="flex flex-col md:flex-row">
                        <div className="p-8 md:w-7/12">
                          <div className="flex items-center mb-4">
                            <div className="bg-gradient-to-r from-pink-600/20 to-pink-500/10 p-3 rounded-full mr-3 border border-pink-500/20">
                              <Zap className="h-7 w-7 text-pink-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{promo.title}</h3>
                          </div>
                          
                          <p className="text-xforge-gray mb-6">{promo.description}</p>
                          
                          <div className="flex flex-wrap gap-4 mb-6">
                            <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-pink-500/20 flex items-center">
                              <Clock className="h-4 w-4 text-pink-400 mr-2" />
                              <div>
                                <span className="text-xs text-xforge-gray">Ends in</span>
                                <div className="text-white font-mono font-bold">
                                  {promo.expiry}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-pink-500/20">
                              <span className="text-xs text-xforge-gray">Discount</span>
                              <div className="text-pink-400 font-bold">{promo.discount}</div>
                            </div>
                            
                            <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-pink-500/20">
                              <span className="text-xs text-xforge-gray">Participants</span>
                              <div className="text-white font-bold">{promo.participants}/{promo.maxParticipants}</div>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <div className="flex justify-between text-xs text-xforge-gray mb-2">
                              <span>Participation progress</span>
                              <span>{Math.round((promo.participants / promo.maxParticipants) * 100)}%</span>
                            </div>
                            <Progress value={(promo.participants / promo.maxParticipants) * 100} className="h-2 bg-xforge-dark/60" />
                          </div>
                          
                          <div className="flex gap-4">
                            <Button 
                              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:brightness-110 shadow-glow flex-1 md:flex-none"
                              onClick={() => {
                                setPromoCode("FLASH50");
                                setActiveTab("promos");
                                
                                setTimeout(() => {
                                  toast.info("Use code FLASH50 to redeem this flash deal!", {
                                    description: "Enter it in the promo code form to get 50% off"
                                  });
                                }, 500);
                              }}
                            >
                              <Tag className="h-4 w-4 mr-2" />
                              Redeem Now
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 flex-1 md:flex-none"
                              onClick={() => {
                                navigator.clipboard.writeText(promo.code);
                                toast.success("Code copied to clipboard!");
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Code
                            </Button>
                          </div>
                        </div>
                        
                        <div className="md:w-5/12 bg-gradient-to-br from-pink-500/20 to-purple-500/10 p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10">
                          <div className="text-center space-y-6">
                            <div className="relative w-32 h-32 mx-auto">
                              <div className="absolute inset-0 bg-pink-500/10 rounded-full animate-ping-slow"></div>
                              <div className="relative bg-gradient-to-br from-pink-500/30 to-pink-500/10 rounded-full flex items-center justify-center h-full w-full border border-pink-500/30">
                                <div className="font-bold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-200">
                                  {promo.discount}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-white font-bold text-xl mb-2">Your Flash Code</h4>
                              <div className="bg-xforge-dark/80 p-4 rounded-lg border border-pink-500/30 mx-auto mb-4">
                                <code className="text-pink-400 font-mono font-bold text-xl tracking-widest">{promo.code}</code>
                              </div>
                              <p className="text-xforge-gray/70 text-sm max-w-xs mx-auto">
                                This offer is only available for a limited time. Act fast before it expires!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <div className="text-center mt-12">
                    <p className="text-xforge-gray mb-6">
                      Flash deals are updated regularly. Check back often for new limited-time offers!
                    </p>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-xforge-gray">
                      <Clock className="h-4 w-4 mr-2" />
                      Set Flash Deal Alerts
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="raffle" className="mt-0">
                <div className="max-w-5xl mx-auto mb-16">
                  <div className="flex items-center mb-12">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 mr-4">
                      <Trophy className="h-6 w-6 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      <span className="text-white">XForge</span>{" "}
                      <span className="text-amber-400">Raffles</span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {raffles.map(raffle => (
                      <Card key={raffle.id} className="backdrop-blur-lg border-white/10 bg-gradient-to-br from-[rgba(30,30,30,0.9)] to-[rgba(20,20,20,0.8)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden hover:translate-y-[-5px] transition-all duration-300">
                        <div className="h-40 bg-gradient-to-r from-amber-500/30 to-amber-600/10 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Trophy className="h-20 w-20 text-amber-300/30" />
                          </div>
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1 text-xs text-white border border-white/10">
                            <Clock className="h-3 w-3 inline-block mr-1" />
                            Ends: {raffle.endDate}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{raffle.title}</h3>
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4 inline-block">
                            <span className="text-amber-400 font-bold">{raffle.prize}</span>
                          </div>
                          
                          <p className="text-xforge-gray mb-6">{raffle.description}</p>
                          
                          <div className="flex flex-wrap gap-4 mb-6">
                            <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-white/10">
                              <span className="text-xs text-xforge-gray">Total Entries</span>
                              <div className="text-white font-bold">{raffle.totalEntries.toLocaleString()}</div>
                            </div>
                            
                            <div className="bg-xforge-dark/60 rounded-lg px-4 py-2 border border-white/10">
                              <span className="text-xs text-xforge-gray">Your Entries</span>
                              <div className="text-amber-400 font-bold">{raffle.yourEntries}</div>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-xforge-dark hover:brightness-110 shadow-glow"
                            onClick={() => {
                              if (raffleEntries > 0) {
                                toast.info("You already have entries in this raffle!");
                              } else {
                                setPromoCode("RAFFLE10");
                                setActiveTab("promos");
                                
                                setTimeout(() => {
                                  toast.info("Use code RAFFLE10 to get a raffle entry!", {
                                    description: "Enter it in the promo code form"
                                  });
                                }, 500);
                              }
                            }}
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            {raffleEntries > 0 ? "Get More Entries" : "Enter Raffle"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-12 p-6 backdrop-blur-lg border border-white/10 bg-gradient-to-br from-[rgba(30,30,30,0.6)] to-[rgba(20,20,20,0.4)] rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">How Raffles Work</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
                          <span className="text-amber-400 font-bold">1</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Get Entries</h4>
                        <p className="text-xforge-gray">
                          Redeem promo codes to get entries into our exciting raffles.
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
                          <span className="text-amber-400 font-bold">2</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Increase Your Odds</h4>
                        <p className="text-xforge-gray">
                          The more entries you have, the higher your chances of winning.
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
                          <span className="text-amber-400 font-bold">3</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Win Prizes</h4>
                        <p className="text-xforge-gray">
                          Winners are randomly selected at the end of the raffle period.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromoCodes;