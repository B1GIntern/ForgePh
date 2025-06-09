import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface RetailerVerifiedUserRouteProps {
  children: React.ReactNode;
}

const RetailerVerifiedUserRoute: React.FC<RetailerVerifiedUserRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const location = useLocation();
  const notificationShownRef = useRef(false);
  
  // Check if the user is authenticated at all
  const userString = localStorage.getItem("user") || sessionStorage.getItem("user");
  const isAuthenticated = !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
  
  // Get user verification status from localStorage/sessionStorage
  let isVerified = false;
  let isRetailer = false;
  let user = null;
  
  if (userString) {
    try {
      user = JSON.parse(userString);
      isVerified = user.userStatus === "Verified";
      isRetailer = user.userType === "Retailer";
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  useEffect(() => {
    // Only show notification if it hasn't been shown already and only for authentication issues
    if (!notificationShownRef.current && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      notificationShownRef.current = true;
    } else if (!notificationShownRef.current && !isVerified && isRetailer) {
      toast({
        title: "Retailer Verification Required",
        description: "Your retailer account must be verified before accessing this section. Please complete the verification process in your profile.",
        variant: "destructive",
      });
      notificationShownRef.current = true;
    }
  }, [isAuthenticated, isVerified, isRetailer, toast]);
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated but not a retailer, redirect to home page
  if (!isRetailer) {
    return <Navigate to="/home" replace />;
  }
  
  // If retailer but not verified, redirect to profile page
  if (isRetailer && !isVerified) {
    // Pass the attempted URL in state to potentially redirect back after verification
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RetailerVerifiedUserRoute; 