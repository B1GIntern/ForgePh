import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, this would be a backend API call
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        // Store admin status in localStorage (in a real app, use a secure token)
        localStorage.setItem("isAdmin", "true");
        
        toast({
          title: "Login Successful",
          description: "Welcome to the ForgePhilippines Admin Dashboard",
        });
        
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid admin credentials. Please try again.",
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
    <div className="min-h-screen flex items-center justify-center bg-[#292929] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 -left-10 w-72 h-72 bg-[#02ECCF] rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-[#A8A8A8] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#D6D6D6] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: "linear-gradient(#A8A8A8 1px, transparent 1px), linear-gradient(to right, #A8A8A8 1px, transparent 1px)",
          backgroundSize: "40px 40px" 
        }}>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        <Card className="bg-[#292929] border border-[#A8A8A8]/20 shadow-2xl overflow-hidden">
          {/* Brand bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#02ECCF] to-[#02ECCF]"></div>
          
          <CardHeader className="space-y-2 text-center pt-8 pb-4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#02ECCF]/20 to-[#02ECCF]/10 flex items-center justify-center ring-2 ring-[#02ECCF]/30 p-0.5">
                <div className="w-full h-full rounded-full bg-[#292929] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#02ECCF]" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-[#D6D6D6] tracking-tighter mt-4">
                Admin Portal
              </h2>
              <p className="text-[#A8A8A8] text-sm mt-1">
                ForgePhilippines Management Dashboard
              </p>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-2 pb-6 px-6">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-xs font-medium text-[#A8A8A8]">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A8A8]" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="pl-10 h-11 bg-[#1e1e1e] border-[#A8A8A8]/20 text-[#D6D6D6] focus-visible:ring-[#02ECCF] focus-visible:ring-offset-0 focus-visible:border-[#02ECCF]"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-medium text-[#A8A8A8]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A8A8]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11 bg-[#1e1e1e] border-[#A8A8A8]/20 text-[#D6D6D6] focus-visible:ring-[#02ECCF] focus-visible:ring-offset-0 focus-visible:border-[#02ECCF]"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={toggleShowPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A8A8] hover:text-[#D6D6D6] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#02ECCF] hover:bg-[#02d8be] text-[#292929] font-medium rounded-md transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign In</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-[#A8A8A8]">
                  Demo credentials: <span className="text-[#D6D6D6] font-medium">admin</span> / <span className="text-[#D6D6D6] font-medium">admin123</span>
                </p>
              </div>
            </motion.form>
          </CardContent>
          
          <CardFooter className="py-4 bg-[#1e1e1e]/40 border-t border-[#A8A8A8]/10">
            <div className="w-full flex items-center justify-center text-xs text-[#A8A8A8]">
              <div className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#02ECCF]"></div>
                <span>ForgePhilippines © {new Date().getFullYear()} • Secure Administrative Access</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;