import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
    }
  }, [isAdmin, toast]);
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;