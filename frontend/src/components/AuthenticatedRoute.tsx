import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const location = useLocation();
  const notificationShownRef = useRef(false);
  
  // Check if the user is authenticated
  const isAuthenticated = !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
  
  useEffect(() => {
    // Show notification if not authenticated and notification hasn't been shown yet
    if (!notificationShownRef.current && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      notificationShownRef.current = true;
    }
  }, [isAuthenticated, toast]);
  
  // If not authenticated, redirect to the home page
  if (!isAuthenticated) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default AuthenticatedRoute; 