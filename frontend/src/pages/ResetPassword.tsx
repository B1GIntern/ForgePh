import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsTokenChecked(true);
        return;
      }

      try {
        const response = await fetch(`https://forgeph-2.onrender.com/api/auth/reset-password?token=${token}`, {
          method: "GET",
        });

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          console.error("Invalid or expired token");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setIsValidToken(false);
      } finally {
        setIsTokenChecked(true);
      }
    };

    validateToken();
  }, [token]);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = "";

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    switch (strength) {
      case 0:
      case 1:
        feedback = "Very weak";
        break;
      case 2:
        feedback = "Weak";
        break;
      case 3:
        feedback = "Medium";
        break;
      case 4:
        feedback = "Strong";
        break;
      case 5:
        feedback = "Very strong";
        break;
      default:
        feedback = "";
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-400";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter both password fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("https://forgeph-2.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/home");
  };

  // Show loading state while token is being validated
  if (!isTokenChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark via-[#1a1f24] to-[#141b22]">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-xforge-teal" />
            <p className="text-xforge-gray">Validating your reset link...</p>
          </div>
        </main>

      </div>
    );
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark via-[#1a1f24] to-[#141b22]">
 
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="relative glass-dark rounded-3xl overflow-hidden border border-white/5 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent z-0"></div>
              
              <div className="relative z-10 text-center py-6">
                <div className="inline-flex items-center justify-center p-3 bg-red-500/30 rounded-full mb-4 backdrop-blur-md">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Invalid or Expired Link</h2>
                <p className="text-xforge-gray mb-6">
                  This password reset link is invalid or has expired. Please request a new password reset link.
                </p>
                <Button 
                  onClick={() => navigate("/forgot-password")}
                  className="btn btn-primary mb-4"
                >
                  Request New Link
                </Button>
                <div>
                  <button 
                    type="button" 
                    onClick={handleBackToLogin}
                    className="text-xforge-teal hover:underline inline-flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark via-[#1a1f24] to-[#141b22]">
      
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="relative glass-dark rounded-3xl overflow-hidden border border-white/5 p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent z-0"></div>
            
            <div className="relative z-10">
              {!isSuccess ? (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-xforge-teal/30 rounded-full mb-4 backdrop-blur-md">
                      <Lock className="h-6 w-6 text-xforge-teal" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
                    <p className="text-xforge-gray">Create a new password for your account.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="password" className="block mb-2 text-xforge-gray">New Password</label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="input-field pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-xforge-gray"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      
                      {password && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getStrengthColor()}`} 
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <p className={`text-xs mt-1 ${passwordStrength >= 3 ? 'text-green-400' : 'text-orange-400'}`}>
                            {passwordFeedback}
                          </p>
                          <ul className="text-xs text-xforge-gray mt-2 space-y-1">
                            <li className={password.length >= 8 ? 'text-green-400' : ''}>
                              • At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                              • At least one uppercase letter
                            </li>
                            <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
                              • At least one lowercase letter
                            </li>
                            <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                              • At least one number
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}>
                              • At least one special character
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block mb-2 text-xforge-gray">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="input-field pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-xforge-gray"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {password && confirmPassword && (
                        <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                          {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={handleBackToLogin}
                        className="text-xforge-teal hover:underline inline-flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center p-3 bg-green-500/30 rounded-full mb-4 backdrop-blur-md">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful</h2>
                  <p className="text-xforge-gray mb-6">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                  <Button 
                    onClick={handleBackToLogin}
                    className="btn btn-primary"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ResetPassword;