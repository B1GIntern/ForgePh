import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VerifiedUserRouteProps {
  children: React.ReactNode;
}

const VerifiedUserRoute: React.FC<VerifiedUserRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const location = useLocation();
  const notificationShownRef = useRef(false);
  
  // Check if the user is authenticated at all
  const userString = localStorage.getItem("user") || sessionStorage.getItem("user");
  const isAuthenticated = !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
  
  // Get user verification status from localStorage/sessionStorage
  let isVerified = false;
  let user = null;
  
  if (userString) {
    try {
      user = JSON.parse(userString);
      isVerified = user.userStatus === "Verified";
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
    }
  }, [isAuthenticated, toast]);
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated but not verified, redirect to profile page
  // No toast notification, just silently redirect
  if (!isVerified) {
    // Pass the attempted URL in state to potentially redirect back after verification
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default VerifiedUserRoute; 