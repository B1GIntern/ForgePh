import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const VerificationSuccess: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Show welcome toast
    toast({
      title: "Email Verified!",
      description: "Your account is now fully activated.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-xforge-dark to-black">
      <div className="container flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-black bg-opacity-60 border border-xforge-teal border-opacity-30 backdrop-blur">
          <CardContent className="pt-8 pb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-xforge-teal bg-opacity-20 flex items-center justify-center"
                >
                  <CheckCircle size={60} className="text-xforge-teal" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-xforge-teal flex items-center justify-center shadow-lg"
                >
                  <Mail size={20} className="text-black" />
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center"
              >
                Email Verification Successful!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xforge-lightgray text-center mb-8"
              >
                Your email has been verified and your account is now fully activated.
                Thank you for completing this important security step.
              </motion.p>

              <div className="space-y-4 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Button
                    className="w-full bg-xforge-teal hover:bg-xforge-teal/80 text-black font-semibold"
                    onClick={() => navigate("/home")}
                  >
                    Go to Dashboard
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-center"
                >
                  <Button
                    className="text-xforge-teal hover:text-xforge-teal/80 text-sm inline-flex items-center"
                    onClick={() => navigate("/rewards")}
                  >
                    Check your rewards
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-10 pt-6 border-t border-xforge-lightgray border-opacity-20 w-full text-center"
              >
                <p className="text-xforge-gray text-sm">
                  Need help? <a href="#" className="text-xforge-teal hover:underline">Contact Support</a>
                </p>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationSuccess;
