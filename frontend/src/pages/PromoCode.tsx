import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  BadgePercent,
  CheckCircle,
  AlertCircle,
  Copy,
  Gift,
  Clock,
  Calendar,
  Tag,
  BadgeCheck,
  Zap,
  Sparkles,
  Award,
  BookOpen,
  Timer,
  Ticket,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
  const validPromoCodes = [
    "XFORGE10",
    "SUMMER25",
    "WELCOME15",
    "XFORGE25",
    "FLASH50",
    "RAFFLE10",
  ];

  useEffect(() => {
    checkAuthentication();
    fetchUserData();
    fetchRetailers();

    // Set up timer for flash deals
    const flashTimer = setInterval(() => {
      setFlashTimeRemaining((prevTime) => {
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
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      console.log("Fetching retailers...");
      const response = await fetch("/api/promo-codes/retailers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        console.error(
          "Failed to fetch retailers:",
          response.status,
          response.statusText
        );
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

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found, cannot refresh redemption count");
        return;
      }

      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const userId = userData?.id || user?.id;

      if (!userId) {
        console.log("User ID not found, cannot refresh redemption count");
        return;
      }

      const response = await fetch(
        `/api/promo-codes/check-redemptions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Redemption count refreshed:", data);

        if (user) {
          const updatedUser = {
            ...user,
            redemptionCount: data.remainingRedemptions,
            dailyLimitReached: data.dailyLimitReached,
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found, user not authenticated");
        return;
      }

      // Get basic user data from storage first to display something quickly
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
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
      console.log(
        "Fetching fresh user data with token:",
        token.substring(0, 15) + "..."
      );
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
      const lastRedemptionDate = userData.lastRedemptionDate
        ? new Date(userData.lastRedemptionDate)
        : null;

      if (
        !lastRedemptionDate ||
        lastRedemptionDate.getDate() !== currentDate.getDate() ||
        lastRedemptionDate.getMonth() !== currentDate.getMonth() ||
        lastRedemptionDate.getFullYear() !== currentDate.getFullYear()
      ) {
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
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
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
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
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
      console.log(
        "Attempting to redeem code:",
        promoCode,
        "at retailer:",
        selectedRetailer
      );
      const response = await fetch("/api/promo-codes/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCode,
          userId,
          shopName: selectedRetailer,
        }),
      });

      console.log("Redemption response status:", response.status);
      const data = await response.json();
      console.log("Redemption response data:", data);

      if (response.ok) {
        setStatus("success");
        setPromoCode(""); // Clear the input field

        // Update local user data with new points and redemption count
        if (user) {
          const updatedUser = {
            ...user,
            points: data.userPoints || user.points + data.points,
            redemptionCount:
              data.remainingRedemptions || user.redemptionCount - 1,
            dailyLimitReached:
              data.dailyLimitReached || data.remainingRedemptions === 0,
            redeemedPromoCodes: [
              ...(user.redeemedPromoCodes || []),
              {
                promoCodeId: data.promoCode._id,
                redeemedAt: new Date().toISOString(),
                shopName: selectedRetailer,
                points: data.points,
                code: promoCode.trim(),
              },
            ],
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
          type: "points",
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

  const recentRedemptions =
    user?.redeemedPromoCodes?.slice(0, 5).map((redemption, index) => ({
      id: index,
      code: redemption.code || "UNKNOWN",
      points: redemption.points || 0,
      date: new Date(redemption.redeemedAt).toISOString().split("T")[0],
      shopName: redemption.shopName,
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
      maxParticipants: 500,
    },
  ];

  const raffles = [
    {
      id: 1,
      title: "iPhone 16 Giveaway",
      prize: "iPhone 16 Pro",
      endDate: "Dec 31, 2023",
      description: "Enter to win the latest iPhone 16 Pro!",
      totalEntries: 1200,
      yourEntries: 3,
      entries: 3,
      status: "ACTIVE",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "PS5 Raffle",
      prize: "PlayStation 5",
      endDate: "Nov 15, 2023",
      description: "Win a brand new PlayStation 5 with two controllers",
      totalEntries: 890,
      yourEntries: 1,
      entries: 1,
      status: "ACTIVE",
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 bg-gradient-to-b from-background to-background/80">
        <div className="mb-6 sm:mb-8 text-center relative">
          <div className="absolute -top-10 sm:-top-14 -left-10 sm:-left-14 w-32 sm:w-40 h-32 sm:h-40 bg-xforge-teal/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 sm:-bottom-14 -right-10 sm:-right-14 w-32 sm:w-40 h-32 sm:h-40 bg-xforge-teal/10 rounded-full blur-3xl"></div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gradient-teal relative z-10 pt-16 sm:pt-12 md:pt-8">
            Promo Codes
          </h1>
          <p
            className={`text-lg sm:text-xl ${user?.dailyLimitReached ? "text-red-400 font-medium" : "text-muted-foreground"} max-w-2xl mx-auto px-4`}
          >
            {user?.dailyLimitReached
              ? "Daily redemption limit reached. Try again tomorrow!"
              : "Redeem promo codes to earn points, discounts, and special rewards"}
          </p>
        </div>

        {!isAuthenticated ? (
          <Card className="mb-6 glass-dark card-3d max-w-md mx-auto animate-fade-in p-4">
            <CardHeader className="pb-2 space-y-1">
              <CardTitle className="text-gradient-teal text-xl sm:text-2xl">
                Authentication Required
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Please log in to redeem promo codes and view your rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-xforge-teal text-xforge-dark hover:brightness-110 text-sm sm:text-base py-2 sm:py-3"
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Promo Code Form & User Points */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Points/Status Card */}
              <Card className="glass-dark border-xforge-teal/20 overflow-hidden relative p-4">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="flex flex-col items-center justify-center p-3 sm:p-4 border border-xforge-teal/20 rounded-lg bg-gradient-to-br from-xforge-dark/80 to-xforge-dark">
                      <span className="text-muted-foreground text-xs sm:text-sm mb-1">
                        Current Points
                      </span>
                      <span className="text-3xl sm:text-4xl font-bold text-gradient-teal">
                        {currentPoints}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 sm:p-4 border border-xforge-teal/20 rounded-lg bg-gradient-to-br from-xforge-dark/80 to-xforge-dark">
                      <span className="text-muted-foreground text-xs sm:text-sm mb-1">
                        Redemptions Left
                      </span>
                      <div className="flex items-center">
                        <span className="text-3xl sm:text-4xl font-bold text-gradient-teal">
                          {user?.redemptionCount || 0}
                        </span>
                        <span className="text-muted-foreground text-base sm:text-lg ml-1">
                          /3
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 sm:p-4 border border-xforge-teal/20 rounded-lg bg-gradient-to-br from-xforge-dark/80 to-xforge-dark">
                      <span className="text-muted-foreground text-xs sm:text-sm mb-1">
                        Next Reset
                      </span>
                      <span className="text-lg sm:text-xl font-mono font-bold text-xforge-teal">
                        {timeToNextReset}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code Redemption Form */}
              <Card className="glass-dark border-xforge-teal/20 overflow-hidden relative card-3d animate-fade-in p-4">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-xforge-teal/10 blur-3xl rounded-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl sm:text-2xl text-gradient-teal">
                    <BadgePercent className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Redeem Promo Code
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Enter your promo code below to earn points and rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-xforge-gray">
                          Promo Code
                        </label>
                        <Input
                          id="promoCodeInput"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) =>
                            setPromoCode(e.target.value.toUpperCase())
                          }
                          className="uppercase glass-dark border-xforge-teal/30 focus:border-xforge-teal/80 h-12 text-lg transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-xforge-gray">
                          Retailer
                        </label>
                        <Select
                          value={selectedRetailer}
                          onValueChange={setSelectedRetailer}
                        >
                          <SelectTrigger className="glass-dark border-xforge-teal/30 h-12 text-lg">
                            <SelectValue placeholder="Select retailer" />
                          </SelectTrigger>
                          <SelectContent className="glass-dark border-xforge-teal/30">
                            {retailers.map((retailer, index) => (
                              <SelectItem
                                key={index}
                                value={retailer.shopName}
                                className="focus:bg-xforge-teal/20 focus:text-xforge-gray"
                              >
                                {retailer.shopName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
                      <div className="flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`text-sm ${user?.dailyLimitReached ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                                >
                                  {user
                                    ? user.dailyLimitReached
                                      ? "Daily limit reached (0/3)"
                                      : `Redemptions left today: ${user.redemptionCount}/3`
                                    : "Loading..."}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    refreshRedemptionCount();
                                  }}
                                  disabled={isRefreshingCount}
                                  className="h-6 w-6 text-xforge-teal/60 hover:text-xforge-teal"
                                >
                                  <RefreshCw
                                    className={`h-3 w-3 ${isRefreshingCount ? "animate-spin" : ""}`}
                                  />
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="glass-dark border-xforge-teal/30">
                              <p>Next reset in {timeToNextReset}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <br />
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isSubmitting}
                          className="border-xforge-teal/50 text-xforge-teal hover:bg-xforge-teal/10 transition-all duration-300"
                        >
                          Clear
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting || (user && user.redemptionCount <= 0)
                          }
                          className="relative bg-xforge-teal text-xforge-dark hover:brightness-110 transition-all duration-300"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="mr-2">Redeeming</span>
                              <span className="flex items-center justify-center">
                                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-xforge-dark opacity-75 mx-0.5"></span>
                                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-xforge-dark opacity-75 mx-0.5 delay-150"></span>
                                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-xforge-dark opacity-75 mx-0.5 delay-300"></span>
                              </span>
                            </>
                          ) : (
                            "Redeem Code"
                          )}
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

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6 animate-fade-in"
              >
                <TabsList className="w-full grid grid-cols-3 bg-xforge-dark/80 p-1 border border-xforge-teal/20">
                  <TabsTrigger
                    value="promos"
                    className="flex items-center data-[state=active]:bg-xforge-teal/20 data-[state=active]:text-xforge-teal"
                  >
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    <span>Active Promos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="flash"
                    className="flex items-center data-[state=active]:bg-xforge-teal/20 data-[state=active]:text-xforge-teal"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Flash Deals</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="raffles"
                    className="flex items-center data-[state=active]:bg-xforge-teal/20 data-[state=active]:text-xforge-teal"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Raffles</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="promos" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {validPromoCodes.map((code, index) => (
                      <Card
                        key={index}
                        className="glass-dark border-xforge-teal/20 hover:border-xforge-teal/50 transition-all duration-300 card-3d"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center text-gradient-teal">
                            <Tag className="mr-2 h-5 w-5 text-xforge-teal" />
                            {code}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">
                            {code.includes("10")
                              ? "10% discount on all products"
                              : code.includes("15")
                                ? "15% off for new customers"
                                : code.includes("25")
                                  ? "25% off selected items"
                                  : code.includes("50")
                                    ? "50% off flash sale"
                                    : code.includes("RAFFLE")
                                      ? "1 raffle entry"
                                      : "Special offer"}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-xforge-teal hover:bg-xforge-teal/10"
                            onClick={() => {
                              setPromoCode(code);
                              document
                                .getElementById("promoCodeInput")
                                ?.focus();
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

                <TabsContent value="flash" className="space-y-6 mt-6">
                  {flashPromos.map((promo) => (
                    <Card
                      key={promo.id}
                      className="glass-dark border-xforge-teal/20 overflow-hidden relative animate-fade-in card-3d"
                    >
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"></div>
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Clock className="mr-2 h-5 w-5 text-red-400" />
                          {promo.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          Time remaining:{" "}
                          <span className="font-mono text-red-400">
                            {promo.expiry}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          {promo.description}
                        </p>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              Participants: {promo.participants}/
                              {promo.maxParticipants}
                            </span>
                            <span>
                              {Math.round(
                                (promo.participants / promo.maxParticipants) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-2 bg-xforge-dark/60 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-xforge-teal to-red-400"
                              style={{
                                width: `${(promo.participants / promo.maxParticipants) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="bg-xforge-dark/60 p-4 rounded-md flex items-center justify-between border border-xforge-teal/20">
                          <div className="flex items-center">
                            <span className="text-lg font-mono font-bold mr-2 text-xforge-teal">
                              {promo.code}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPromoCode(promo.code);
                                document
                                  .getElementById("promoCodeInput")
                                  ?.focus();
                              }}
                              className="text-xforge-teal hover:bg-xforge-teal/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <span className="text-lg font-bold text-red-400">
                              {promo.discount}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="raffles" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {raffles.map((raffle) => (
                      <Card
                        key={raffle.id}
                        className="glass-dark border-xforge-teal/20 overflow-hidden relative card-3d animate-fade-in"
                      >
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-xforge-teal via-purple-500 to-xforge-teal"></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl flex items-center text-gradient-teal">
                              <Trophy className="mr-2 h-5 w-5 text-purple-400" />
                              {raffle.title}
                            </CardTitle>
                            <span className="text-xs py-1 px-3 bg-xforge-dark/60 text-purple-400 border border-purple-400/30 rounded-full">
                              {raffle.status}
                            </span>
                          </div>
                          <CardDescription className="text-base">
                            {raffle.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                End Date
                              </span>
                              <span className="flex items-center text-muted">
                                <Calendar className="h-3 w-3 mr-1" />
                                {raffle.endDate}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground">
                                Prize
                              </span>
                              <span className="text-lg font-bold text-gradient-teal">
                                {raffle.prize}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-xforge-dark/60 border-t border-xforge-teal/10">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-muted-foreground">
                              Your entries:{" "}
                              <span className="text-purple-400 font-bold">
                                {raffle.entries}
                              </span>
                            </span>
                            <Button
                              size="sm"
                              className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                              onClick={() => {
                                setPromoCode("RAFFLE10");
                                document
                                  .getElementById("promoCodeInput")
                                  ?.focus();
                              }}
                            >
                              <Ticket className="h-4 w-4 mr-1" />
                              Enter Raffle
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Redeemed Codes and History */}
            <div>
              <Card className="glass-dark border-xforge-teal/20 overflow-hidden sticky top-20 animate-fade-in card-3d">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-xforge-teal/10 rounded-full blur-3xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Gift className="mr-2 h-5 w-5 text-xforge-teal" />
                    Your Redeemed Codes
                  </CardTitle>
                  <CardDescription>
                    Recent promo codes you've redeemed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user &&
                  user.redeemedPromoCodes &&
                  user.redeemedPromoCodes.length > 0 ? (
                    <div className="space-y-3">
                      {user.redeemedPromoCodes
                        .slice(0, 5)
                        .map((code, index) => (
                          <div
                            key={index}
                            className="flex justify-between p-3 bg-xforge-dark/60 rounded-lg border border-xforge-teal/10 transition-all duration-300 hover:border-xforge-teal/30"
                          >
                            <div>
                              <div className="font-medium text-xforge-gray">
                                {code.code || "XXXXXXXX"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {code.shopName}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-xforge-teal">
                                +{code.points || 10} pts
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(code.redeemedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="inline-block p-3 rounded-full bg-xforge-dark/60 mb-4">
                        <Gift className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        No redeemed promo codes yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Redeem your first code to see it here
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-xforge-teal/10 flex justify-center bg-xforge-dark/40">
                  <div className="p-4 text-center w-full">
                    <div className="text-sm text-muted-foreground mb-1">
                      Your Current Points
                    </div>
                    <div className="text-3xl font-bold text-gradient-teal">
                      {currentPoints}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromoCodes;
