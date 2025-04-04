import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
  
    setIsLoading(true);
    
    try {
      // Fixed endpoint path to match the backend router
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Error handling before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Login failed";
        
        try {
          // Try to parse as JSON in case it's a structured error
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, use text or fallback
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
  
      // Store the user data and token
      const userData: User = {
        id: data.user.id, // Use id instead of _id to match your interface
        name: data.user.name,
        email: data.user.email,
        userType: data.user.userType,
        points: data.user.points,
      };
      const token = data.token;
  
      // Store user data and token based on rememberMe
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        console.log("Stored Token in Local Storage:", token); // Log the token
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("token", token);
        console.log("Stored Token in Session Storage:", token); // Log the token
      }
  
      // Show success message with username
      toast({
        title: "Login successful",
        description: `Welcome back ${userData.name} to ForgePhilippines!`,
      });
  
      onClose(); // Close the modal
      setEmail(""); // Reset email field
      setPassword(""); // Reset password field
  
      // Replace this line in your handleLogin function:
        if (userData.userType === "Retailer") {
          window.location.href = "/retailers"; // Changed from "/RetailerLanding" to "/retailers"
        } else {
          // Default for Consumer
          window.location.href = "/home";
        }
  
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 mx-4 bg-xforge-dark border border-xforge-lightgray rounded-lg shadow-xl animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-xforge-gray hover:text-xforge-teal transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white">
          <span className="text-xforge-teal">Forge</span> Login
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-xforge-gray">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-xforge-gray">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
              required
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="mr-2 accent-xforge-teal"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-xforge-gray">Remember me</label>
            </div>
            <a href="#" className="text-xforge-teal hover:underline">Forgot password?</a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
          
          <p className="text-center text-xforge-gray">
            Don't have an account?{" "}
            <a href="#register" className="text-xforge-teal hover:underline" onClick={onClose}>
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;