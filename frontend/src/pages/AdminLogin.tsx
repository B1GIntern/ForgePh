import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, User, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Animation delay for fade-in effect
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // This would normally connect to a backend, but for demo purposes
  // we'll use a simple check with a hardcoded admin credential
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, this would be a backend API call
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        // Store admin status in localStorage (in a real app, use a secure token)
        localStorage.setItem("isAdmin", "true");
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the XForge Admin Dashboard",
        });
        
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-xforge-dark to-xforge-darkgray p-4">
      <div 
        className={`w-full max-w-md transform transition-all duration-700 ${fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <Card className="glass-dark border-xforge-teal/30 shadow-xl overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-xforge-teal via-teal-500 to-xforge-teal animate-shimmer bg-[length:200%_100%]"></div>
          
          <CardHeader className="space-y-2 text-center pb-2">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full glass-teal mb-4 animate-pulse-light">
              <ShieldAlert className="text-xforge-teal" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              <span className="text-xforge-teal">X</span>Forge Admin
            </h2>
            <p className="text-xforge-lightgray text-sm">Secure administrative access portal</p>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-xforge-lightgray" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Admin username"
                    className="pl-10 bg-xforge-darkgray/50 border-xforge-darkgray focus:border-xforge-teal text-xforge-gray"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-xforge-lightgray" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className="pl-10 pr-10 bg-xforge-darkgray/50 border-xforge-darkgray focus:border-xforge-teal text-xforge-gray"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-3 text-xforge-lightgray hover:text-xforge-teal transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-xforge-lightgray italic">Demo: username "admin" & password "admin123"</p>
              </div>
              
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-xforge-teal text-xforge-dark hover:brightness-110 transition-all duration-300 relative overflow-hidden group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Access Admin Panel
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-xforge-dark/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-0 pb-6 text-xs text-xforge-lightgray">
            <div className="flex items-center justify-center space-x-1">
              <div className="h-1 w-1 rounded-full bg-xforge-teal animate-pulse"></div>
              <p>Secured Administration Portal</p>
              <div className="h-1 w-1 rounded-full bg-xforge-teal animate-pulse"></div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;