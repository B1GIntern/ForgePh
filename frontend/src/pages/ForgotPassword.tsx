import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Always show success message regardless of whether email exists
      // This is a security best practice to prevent email enumeration
      setIsSuccess(true);
      
      // Log actual response for debugging
      if (!response.ok) {
        console.error("Error response:", await response.text());
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      // Still show success message to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/home");
  };

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
                      <Mail className="h-6 w-6 text-xforge-teal" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
                    <p className="text-xforge-gray">Enter your email address and we'll send you instructions to reset your password.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block mb-2 text-xforge-gray">Email Address</label>
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
                    
                    <Button 
                      type="submit" 
                      className="w-full btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Instructions"
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={handleBackToLogin}
                        className="text-xforge-teal hover:underline inline-flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center p-3 bg-green-500/30 rounded-full mb-4 backdrop-blur-md">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
                  <p className="text-xforge-gray mb-6">
                    If an account exists with the email <span className="text-white font-medium">{email}</span>, we've sent instructions to reset your password.
                  </p>
                  <p className="text-xforge-gray mb-8">
                    Please check your inbox and spam folder. The reset link will expire in 60 minutes.
                  </p>
                  <Button 
                    onClick={handleBackToLogin}
                    className="btn btn-primary"
                  >
                    Return to Login
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

export default ForgotPassword;