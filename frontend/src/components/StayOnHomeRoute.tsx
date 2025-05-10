import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface StayOnHomeRouteProps {
  children: React.ReactNode;
}

const StayOnHomeRoute: React.FC<StayOnHomeRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const location = useLocation();
  const notificationShownRef = useRef(false);
  
  // List of paths that should NOT be redirected (public paths or home)
  const allowedPaths = ["/", "/home", "/age-restricted", "/verification-failed", "/verification-success", "/forgot-password", "/reset-password", "/api-test", "/admin", "/retailer-registration"];
  
  // Check if the current path is allowed or needs authentication
  const isAllowedPath = allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith("/admin")
  );
  
  // Check if the user is authenticated
  const isAuthenticated = !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
  
  useEffect(() => {
    // Show notification if not authenticated, notification hasn't been shown yet, 
    // and the path requires authentication
    if (!notificationShownRef.current && !isAuthenticated && !isAllowedPath) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      notificationShownRef.current = true;
    }
  }, [isAuthenticated, toast, isAllowedPath]);
  
  // If not authenticated and trying to access a protected route, redirect to the home page
  if (!isAuthenticated && !isAllowedPath) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default StayOnHomeRoute; 