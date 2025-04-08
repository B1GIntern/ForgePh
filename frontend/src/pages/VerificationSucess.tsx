import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Define User interface similar to your other components
interface Location {
  province: string;
  city: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: string;
  location: Location;
  userStatus: string;
  birthdate: string;
  points: number;
  rewardsclaimed: number;
  registrationDate: string;
}

const VerificationSuccess: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<"success" | "already" | "unknown">("unknown");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    // Check URL parameters for verification status
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    const alreadyVerified = queryParams.get("already");
    
    if (status === "success") {
      setVerificationStatus("success");
      toast({
        title: "Email Verified!",
        description: "Your account is now fully activated.",
        type: "foreground",
      });
    } else if (alreadyVerified === "true") {
      setVerificationStatus("already");
      toast({
        title: "Already Verified",
        description: "Your email was already verified previously.",
        type: "foreground",
      });
    } else {
      // If we got here without proper parameters, show an info message
      toast({
        title: "Information",
        description: "Verification status unknown. Please check your email.",
        type: "background",
      });
    }

    // Fetch and update user data
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    
        // Get the token from localStorage or sessionStorage
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!token) {
          throw new Error("No token found");
        }

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Set initial profile from stored data
          setProfile({
            id: parsedUser.id,
            name: parsedUser.name,
            email: parsedUser.email,
            phoneNumber: parsedUser.phoneNumber || "",
            userType: parsedUser.userType,
            location: parsedUser.location || { province: "", city: "" },
            userStatus: status === "success" ? "Verified" : parsedUser.userStatus || "Not Verified",
            birthdate: parsedUser.birthdate,
            points: parsedUser.points,
            rewardsclaimed: parsedUser.rewardsclaimed,
            registrationDate: parsedUser.registrationDate
          });

          // Choose storage based on where the user was found
          const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
          
          // If verification was successful, update the user status in storage
          if (status === "success") {
            const updatedUser = {
              ...parsedUser,
              userStatus: "Verified"
            };
            storage.setItem("user", JSON.stringify(updatedUser));
          }
        }

        // Fetch updated user data from the server
        const response = await fetch(`http://localhost:5001/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        const user = userData.user;

        // Store which storage to use (localStorage or sessionStorage)
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        
        // Include previous userStatus if available from stored user or set to Verified if verification was successful
        const previousUserStatus = profile?.userStatus || "Not Verified";
        const userStatus = status === "success" ? "Verified" : previousUserStatus;

        const updatedUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          userType: user.userType,
          location: user.location || { province: "", city: "" },
          birthdate: user.birthdate,
          points: user.points,
          rewardsclaimed: user.rewardsclaimed,
          registrationDate: user.registrationDate,
          userStatus: userStatus
        };

        setProfile(updatedUser);
        storage.setItem("user", JSON.stringify(updatedUser));
        
        console.log("Updated user data from server:", updatedUser);

      } catch (error) {
        console.error("Error fetching user data:", error);
        // If we can't fetch user data but we have verification success,
        // we should still update local storage with Verified status if possible
        if (status === "success") {
          try {
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
              parsedUser.userStatus = "Verified";
              storage.setItem("user", JSON.stringify(parsedUser));
            }
          } catch (e) {
            console.error("Error updating stored user data:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast, location.search]);

  const handleNavigateHome = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (token) {
      navigate("/");
    } else {
      toast({
        title: "Session expired",
        description: "Please log in to continue.",
        type: "background",
      });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark to-black">
      <div className="container flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-black bg-opacity-60 border border-xforge-teal border-opacity-30 backdrop-blur">
          <CardContent className="pt-8 pb-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-xforge-teal rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-xforge-teal bg-opacity-20 flex items-center justify-center"
                  >
                    <CheckCircle size={60} className="text-xforge-teal" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-xforge-teal flex items-center justify-center shadow-lg"
                  >
                    <Mail size={20} className="text-black" />
                  </motion.div>
                </div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center"
                >
                  Email Verification Successful!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-xforge-lightgray text-center mb-8"
                >
                  {verificationStatus === "already" 
                    ? "Your email was already verified. Your account is active and ready to use."
                    : "Your email has been verified and your account is now fully activated. Thank you for completing this important security step."}
                </motion.p>
                {profile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="bg-xforge-dark bg-opacity-40 p-4 rounded-lg mb-6 w-full border border-xforge-teal border-opacity-20"
                  >
                    <p className="text-xforge-lightgray text-sm">
                      <span className="font-medium text-white">Welcome, {profile.name}!</span>
                      <br />
                      <span className="text-xforge-teal">Status:</span> {profile.userStatus}
                      <br />
                      <span className="text-xforge-teal">Points:</span> {profile.points}
                    </p>
                  </motion.div>
                )}
                <div className="space-y-4 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <Button
                      className="w-full bg-xforge-teal hover:bg-xforge-teal/80 text-black font-semibold"
                      onClick={handleNavigateHome}
                    >
                      Go to Dashboard
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-center"
                  >
                    <Link
                      to="/rewards"
                      className="text-xforge-teal hover:text-xforge-teal/80 text-sm inline-flex items-center"
                    >
                      Check your rewards
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mt-10 pt-6 border-t border-xforge-lightgray border-opacity-20 w-full text-center"
                >
                  <p className="text-xforge-gray text-sm">
                    Need help?{" "}
                    <a href="#" className="text-xforge-teal hover:underline">
                      Contact Support
                    </a>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationSuccess;