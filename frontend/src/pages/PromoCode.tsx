import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { 
  BadgePercent, CheckCircle, AlertCircle, Copy, Gift, Clock, Calendar, 
  Tag, BadgeCheck, Zap, Sparkles, Award, BookOpen, Timer, Ticket, Trophy, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interfaces to match your MongoDB schema
interface RedeemedPromoCode {
  promoCodeId: string;
  redeemedAt: string;
  shopName: string;
  points?: number;
  code?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
  redeemedPromoCodes: RedeemedPromoCode[];
  redemptionCount: number;
  lastRedemptionDate?: string;
  rank: string;
  dailyLimitReached: boolean;
}

const PromoCodes: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [retailers, setRetailers] = useState<Array<{ shopName: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast: uiToast } = useToast();
  const { addNotification } = useNotifications();
  const [flashTimeRemaining, setFlashTimeRemaining] = useState(3600); // 1 hour in seconds
  const [raffleEntries, setRaffleEntries] = useState(0);
  const [activeTab, setActiveTab] = useState("promos");
  const [user, setUser] = useState<User | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeToNextReset, setTimeToNextReset] = useState<string>("");
  const [isRefreshingCount, setIsRefreshingCount] = useState(false);
 
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate time until next midnight reset
  const calculateTimeToNextReset = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diffMs = tomorrow.getTime() - now.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    return formatTimeRemaining(diffSec);
  };
  
  // Example promo codes for validation
  const validPromoCodes = ["XFORGE10", "SUMMER25", "WELCOME15", "XFORGE25", "FLASH50", "RAFFLE10"];

  useEffect(() => {
    checkAuthentication();
    fetchUserData();
    fetchRetailers();
    
    // Set up timer for flash deals
    const flashTimer = setInterval(() => {
      setFlashTimeRemaining(prevTime => {
        if (prevTime <= 0) return 0;
        return prevTime - 1;
      });
    }, 1000);
    
    // Set up timer for midnight reset countdown
    const resetTimer = setInterval(() => {
      setTimeToNextReset(calculateTimeToNextReset());
    }, 1000);

    // Initial calculation
    setTimeToNextReset(calculateTimeToNextReset());

    return () => {
      clearInterval(flashTimer);
      clearInterval(resetTimer);
    };
  }, []);

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      console.log("Token found in storage:", token.substring(0, 15) + "...");
      setIsAuthenticated(true);
    } else {
      console.log("No authentication token found");
      setIsAuthenticated(false);
    }
  };
  
  // Fetch available retailers for the dropdown
  const fetchRetailers = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      console.log("Fetching retailers...");
      const response = await fetch('/api/promo-codes/retailers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("Retailers response:", responseData);
        
        // Handle different possible response formats
        if (responseData.data && Array.isArray(responseData.data)) {
          setRetailers(responseData.data);
        } else if (Array.isArray(responseData)) {
          setRetailers(responseData);
        } else {
          console.error("Unexpected retailers data format:", responseData);
          setRetailers([]);
        }
      } else {
        console.error("Failed to fetch retailers:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error details:", errorText);
      }
    } catch (error) {
      console.error("Error fetching retailers:", error);
    }
  };
  
  // Refresh redemption count
  const refreshRedemptionCount = async () => {
    try {
      setIsRefreshingCount(true);
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found, cannot refresh redemption count");
        return;
      }
      
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const userId = userData?.id || user?.id;
      
      if (!userId) {
        console.log("User ID not found, cannot refresh redemption count");
        return;
      }
      
      const response = await fetch(`/api/promo-codes/check-redemptions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Redemption count refreshed:", data);
        
        if (user) {
          const updatedUser = {
            ...user,
            redemptionCount: data.remainingRedemptions,
            dailyLimitReached: data.dailyLimitReached
          };
          
          setUser(updatedUser);
          
          // Update storage
          if (localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } else if (sessionStorage.getItem("user")) {
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }
        
        uiToast({
          title: "Updated",
          description: data.dailyLimitReached 
            ? "Daily limit reached (0/3)" 
            : `You have ${data.remainingRedemptions} redemptions remaining today`,
        });
      } else {
        console.error("Failed to refresh redemption count");
      }
    } catch (error) {
      console.error("Error refreshing redemption count:", error);
    } finally {
      setIsRefreshingCount(false);
    }
  };
  
  const fetchUserData = async () => {
    try {
      // Get auth token from storage
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found, user not authenticated");
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
      console.log("Fetching fresh user data with token:", token.substring(0, 15) + "...");
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Failed to fetch user data:", response.status, errorData);
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log("Received user data:", userData);
      
      // Check if we need to reset redemption count
      const currentDate = new Date();
      const lastRedemptionDate = userData.lastRedemptionDate ? new Date(userData.lastRedemptionDate) : null;
      
      if (!lastRedemptionDate || 
          lastRedemptionDate.getDate() !== currentDate.getDate() ||
          lastRedemptionDate.getMonth() !== currentDate.getMonth() ||
          lastRedemptionDate.getFullYear() !== currentDate.getFullYear()) {
        // Reset redemption count if it's a new day
        userData.redemptionCount = 3;
        userData.lastRedemptionDate = currentDate.toISOString();
      }
      
      // Update state with fresh user data
      setUser(userData);
      setCurrentPoints(userData.points);
      
      // Update localStorage/sessionStorage with fresh data
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
      
      window.dispatchEvent(new Event("authChange"));
      console.log("Updated user data from server:", userData);
      await refreshRedemptionCount();

    } catch (error) {
      console.error("Error fetching user data:", error);
      uiToast({
        title: "Error",
        description: "Failed to fetch your account data",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.log("No token found, cannot proceed with redemption");
      uiToast({
        title: "Authentication Required",
        description: "Please log in to redeem promo codes",
        variant: "destructive",
      });
      return;
    }
    
    // Log token for debugging
    console.log("Using token for redemption:", token.substring(0, 15) + "...");
    
    // Get user info from storage
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const userId = userData?.id || user?.id;
  
    if (!userId) {
      uiToast({
        title: "Error",
        description: "User information not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }
  
    if (!promoCode.trim()) {
      uiToast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
  
    if (!selectedRetailer) {
      uiToast({
        title: "Error",
        description: "Please select a retailer",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has used all their daily redemptions
    if (user && user.redemptionCount <= 0) {
      uiToast({
        title: "Daily Limit Reached",
        description: `You've used all your daily promo code redemptions. Next reset in ${timeToNextReset}`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Attempting to redeem code:", promoCode, "at retailer:", selectedRetailer);
      const response = await fetch('/api/promo-codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode,
          userId,
          shopName: selectedRetailer
        })
      });
  
      console.log("Redemption response status:", response.status);
      const data = await response.json();
      console.log("Redemption response data:", data);
  
      if (response.ok) {
        setStatus("success");
        setPromoCode(''); // Clear the input field
        
        // Update local user data with new points and redemption count
        if (user) {
          const updatedUser = {
            ...user,
            points: data.userPoints || (user.points + data.points),
            redemptionCount: data.remainingRedemptions || (user.redemptionCount - 1),
            dailyLimitReached: data.dailyLimitReached || (data.remainingRedemptions === 0),
            redeemedPromoCodes: [
              ...(user.redeemedPromoCodes || []),
              {
                promoCodeId: data.promoCode._id,
                redeemedAt: new Date().toISOString(),
                shopName: selectedRetailer,
                points: data.points,
                code: promoCode.trim()
              }
            ]
          };
          setUser(updatedUser);
          setCurrentPoints(updatedUser.points);
          
          // Update storage
          if (localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } else if (sessionStorage.getItem("user")) {
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }
        
        uiToast({
          title: "Success",
          description: `You've earned ${data.points} points! (${data.remainingRedemptions} redemptions remaining today)`,
          variant: "default",
        });
        
        addNotification({
          title: "Promo Code Redeemed",
          message: `You've successfully redeemed ${promoCode.toUpperCase()} for ${data.points} points!`,
          type: "points"
        });
      } else {
        setStatus("error");
        
        // Check for specific error messages
        if (data.message.includes("daily redemption limit")) {
          uiToast({
            title: "Daily Limit Reached",
            description: `You've used all your daily promo code redemptions. Next reset in ${timeToNextReset}`,
            variant: "destructive",
          });
        } else {
          uiToast({
            title: "Error",
            description: data.message || "Failed to redeem promo code",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error redeeming promo code:", error);
      setStatus("error");
      uiToast({
        title: "Error",
        description: "An error occurred while redeeming the code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setPromoCode("");
    setStatus("idle");
  };
  
  const recentRedemptions = user?.redeemedPromoCodes?.slice(0, 5).map((redemption, index) => ({
    id: index,
    code: redemption.code || "UNKNOWN",
    points: redemption.points || 0,
    date: new Date(redemption.redeemedAt).toISOString().split('T')[0],
    shopName: redemption.shopName
  })) || [];
  
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
    <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Promo Codes</h1>
        <p className={`text-gray-600 ${user?.dailyLimitReached ? 'text-red-500 font-medium' : ''}`}>
          {user?.dailyLimitReached 
            ? "Daily redemption limit reached. Try again tomorrow!" 
            : "Redeem promo codes to earn points, discounts, and special rewards"}
        </p>
      </div>

      {!isAuthenticated ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to redeem promo codes and view your rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/login"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Promo Code Form */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BadgePercent className="mr-2" />
                  Redeem a Promo Code
                </CardTitle>
                <CardDescription>
                  Enter your promo code below to earn points and rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Promo Code
                      </label>
                      <Input
                        id="promoCodeInput"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Retailer
                      </label>
                      <Select 
                        value={selectedRetailer} 
                        onValueChange={setSelectedRetailer}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select retailer" />
                        </SelectTrigger>
                        <SelectContent>
                          {retailers.map((retailer, index) => (
                            <SelectItem key={index} value={retailer.shopName}>
                              {retailer.shopName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <div className={`text-sm ${user?.dailyLimitReached ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                {user ? (
                                  user.dailyLimitReached ? (
                                    "Daily limit reached (0/3)"
                                  ) : (
                                    `Redemptions left today: ${user.redemptionCount}/3`
                                  )
                                ) : (
                                  'Loading...'
                                )}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  refreshRedemptionCount();
                                }}
                                disabled={isRefreshingCount}
                                className="h-6 w-6"
                              >
                                <RefreshCw className={`h-3 w-3 ${isRefreshingCount ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Next reset in {timeToNextReset}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        disabled={isSubmitting}
                      >
                        Clear
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || (user && user.redemptionCount <= 0)}
                        className="relative"
                      >
                        {isSubmitting ? 'Redeeming...' : 'Redeem Code'}
                        {status === "success" && (
                          <CheckCircle className="absolute right-2 top-2 h-4 w-4 text-green-500" />
                        )}
                        {status === "error" && (
                          <AlertCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="promos" className="flex items-center">
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    <span>Active Promos</span>
                  </TabsTrigger>
                  <TabsTrigger value="flash" className="flex items-center">
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Flash Deals</span>
                  </TabsTrigger>
                  <TabsTrigger value="raffles" className="flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Raffles</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="promos" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {validPromoCodes.map((code, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Tag className="mr-2 h-5 w-5" />
                            {code}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-500">
                            {code.includes("10") ? "10% discount on all products" : 
                             code.includes("15") ? "15% off for new customers" :
                             code.includes("25") ? "25% off selected items" :
                             code.includes("50") ? "50% off flash sale" :
                             code.includes("RAFFLE") ? "1 raffle entry" :
                             "Special offer"}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => {
                              setPromoCode(code);
                              document.getElementById("promoCodeInput")?.focus();
                            }}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy code
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="flash" className="space-y-6 mt-4">
                  {flashPromos.map((promo) => (
                    <Card key={promo.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Clock className="mr-2 h-5 w-5 text-red-500" />
                          {promo.title}
                        </CardTitle>
                        <CardDescription>
                          Time remaining: <span className="font-mono">{promo.expiry}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>{promo.description}</p>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Participants: {promo.participants}/{promo.maxParticipants}</span>
                            <span>{Math.round((promo.participants / promo.maxParticipants) * 100)}%</span>
                          </div>
                          <Progress value={(promo.participants / promo.maxParticipants) * 100} />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg font-mono font-bold mr-2">{promo.code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPromoCode(promo.code);
                                document.getElementById("promoCodeInput")?.focus();
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <span className="text-lg font-bold text-red-500">{promo.discount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="raffles" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {raffles.map((raffle) => (
                      <Card key={raffle.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Award className="mr-2 h-5 w-5 text-yellow-500" />
                            {raffle.title}
                          </CardTitle>
                          <CardDescription>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Ends: {raffle.endDate}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <Trophy className="h-12 w-12 text-yellow-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Prize: {raffle.prize}</h4>
                            <p className="text-sm text-gray-500">{raffle.description}</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Total entries: {raffle.totalEntries}</span>
                              <span>Your entries: {raffle.yourEntries}</span>
                            </div>
                            <Progress value={(raffle.yourEntries / 10) * 100} max={100} />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setPromoCode("RAFFLE10")}
                          >
                            <Ticket className="mr-2 h-4 w-4" />
                            Enter with code RAFFLE10
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right Column - Stats and History */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                    Your Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{currentPoints}</div>
                  <p className="text-sm text-gray-500 mt-1">Available Points</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Recent Redemptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {recentRedemptions.length > 0 ? (
                    <ul className="space-y-3">
                      {recentRedemptions.map((item) => (
                        <li key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                          <div>
                            <p className="font-medium">{item.code}</p>
                            <p className="text-xs text-gray-500">{item.date} • {item.shopName}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-green-600">+{item.points}</span>
                            {'special' in item && (
                              <p className="text-xs text-purple-600">{item.special as string}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No recent redemptions</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Gift className="mr-2 h-5 w-5 text-red-500" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                      <span>Enter a valid promo code from retailers or promotional materials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                      <span>Select the retailer where you received the code</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                      <span>Earn points that can be redeemed for rewards and discounts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromoCodes;