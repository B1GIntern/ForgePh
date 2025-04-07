import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Percent, CheckCircle, AlertCircle, Copy, Gift, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationsContext";

const PromoCodes: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast: uiToast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Add a notification when visiting the promo codes page for the first time
    const hasVisitedPromos = localStorage.getItem('visited-promos');
    if (!hasVisitedPromos) {
      setTimeout(() => {
        addNotification({
          title: "New Promo Code Available!",
          message: "Use XFORGE25 for 25% off your next purchase!",
          type: "promotion"
        });
        localStorage.setItem('visited-promos', 'true');
      }, 2000);
    }
  }, [addNotification]);

  // Mock active promo codes
  const validPromoCodes = ["XFORGE10", "SUMMER25", "WELCOME15", "XFORGE25"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      uiToast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (validPromoCodes.includes(promoCode.toUpperCase())) {
        setStatus("success");
        
        // Show toast
        toast.success("Promo code applied successfully!", {
          description: "Points have been added to your account!",
          position: "top-center",
        });
        
        // Add notification
        addNotification({
          title: "Promo Code Redeemed",
          message: `You've successfully redeemed ${promoCode.toUpperCase()} for 250 points!`,
          type: "points"
        });
      } else {
        setStatus("error");
        toast.error("Invalid code", {
          description: "The promo code you entered is invalid or expired.",
          position: "top-center",
        });
      }
      setIsSubmitting(false);
    }, 1500);
  };

  // Reset form when changing status back to idle
  const resetForm = () => {
    setPromoCode("");
    setStatus("idle");
  };

  // Recent promo redemptions
  const recentRedemptions = [
    { id: 1, code: "SUMMER25", points: 250, date: "2023-06-10" },
    { id: 2, code: "XFORGE10", points: 100, date: "2023-05-22" }
  ];

  // Featured promo codes
  const featuredCodes = [
    { code: "XFORGE25", discount: "25% OFF", expiry: "July 30, 2023", description: "25% off your next purchase" },
    { code: "POINTS100", discount: "100 POINTS", expiry: "August 15, 2023", description: "Get 100 bonus points with any purchase" },
    { code: "FREESHIP", discount: "FREE SHIPPING", expiry: "Limited time", description: "Free shipping on orders over $50" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-xforge-dark">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-xforge-teal bg-opacity-20 rounded-full mb-4">
            <Percent className="h-6 w-6 text-xforge-teal" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-xforge-teal bg-clip-text text-transparent">
            Promo Codes
          </h1>
          <p className="text-xforge-gray max-w-2xl mx-auto">
            Redeem special codes to earn reward points and unlock exclusive offers.
            Enter your code below to get started!
          </p>
        </div>

        {/* Featured Promo Codes */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 inline-block border-b-2 border-xforge-teal pb-2">
            Featured <span className="text-xforge-teal">Offers</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCodes.map((promo, index) => (
              <div key={index} className="bg-gradient-to-br from-xforge-darkgray to-xforge-dark rounded-xl overflow-hidden border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300 shadow-lg">
                <div className="bg-xforge-teal/10 p-6 text-center">
                  <h3 className="text-xforge-teal font-bold text-xl mb-2">{promo.discount}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-xforge-gray" />
                    <span className="text-xforge-gray text-sm">Expires: {promo.expiry}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xforge-gray mb-4 text-center">{promo.description}</p>
                  <div className="flex items-center justify-between bg-xforge-dark rounded-lg p-3 border border-xforge-lightgray">
                    <code className="text-white font-mono font-bold">{promo.code}</code>
                    <button 
                      className="p-2 text-xforge-teal hover:text-xforge-gray transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(promo.code);
                        toast.success("Code copied to clipboard!");
                      }}
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-xforge-darkgray to-xforge-dark rounded-xl shadow-2xl overflow-hidden border border-xforge-teal/10">
            {status === "idle" && (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-6">
                  <label htmlFor="promoCode" className="block text-white font-bold mb-3">
                    Enter Your Promo Code
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. XFORGE10"
                      className="flex-grow px-4 py-3 bg-xforge-dark border border-xforge-lightgray rounded-lg text-white focus:border-xforge-teal focus:outline-none focus:ring-1 focus:ring-xforge-teal transition-colors"
                    />
                    <button 
                      type="submit" 
                      className={`px-8 py-3 bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark font-bold rounded-lg hover:brightness-110 transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Validating..." : "Redeem"}
                    </button>
                  </div>
                </div>
                
                <p className="text-center text-xforge-gray mt-6 text-sm">
                  Find promo codes on our product packaging, social media, or during special events.
                </p>
              </form>
            )}
            
            {status === "success" && (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Code Successfully Redeemed!
                </h3>
                <p className="text-xforge-gray mb-8 max-w-md mx-auto">
                  You've earned 250 reward points with your promo code. 
                  Check your rewards page to see your updated balance.
                </p>
                <button 
                  onClick={resetForm}
                  className="px-8 py-3 bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark font-bold rounded-lg hover:brightness-110 transition-all duration-300"
                >
                  Redeem Another Code
                </button>
              </div>
            )}
            
            {status === "error" && (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Invalid Promo Code
                </h3>
                <p className="text-xforge-gray mb-8 max-w-md mx-auto">
                  The promo code you entered is invalid or has expired.
                  Please check the code and try again.
                </p>
                <button 
                  onClick={resetForm}
                  className="px-8 py-3 bg-gradient-to-r from-xforge-teal to-teal-500 text-xforge-dark font-bold rounded-lg hover:brightness-110 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Redemptions Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 inline-block border-b-2 border-xforge-teal pb-2">
            Recent <span className="text-xforge-teal">Redemptions</span>
          </h2>
          
          {recentRedemptions.length > 0 ? (
            <div className="bg-gradient-to-br from-xforge-darkgray to-xforge-dark rounded-xl overflow-hidden shadow-lg border border-xforge-teal/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-xforge-lightgray">
                      <th className="px-6 py-4 text-left text-xforge-gray">Code</th>
                      <th className="px-6 py-4 text-left text-xforge-gray">Points Earned</th>
                      <th className="px-6 py-4 text-left text-xforge-gray">Date Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRedemptions.map(redemption => (
                      <tr key={redemption.id} className="border-b border-xforge-lightgray hover:bg-xforge-dark transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-white bg-xforge-dark px-3 py-1 rounded-md">{redemption.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Gift className="h-4 w-4 text-xforge-teal mr-2" />
                            <span className="text-xforge-teal font-bold">{redemption.points}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-xforge-gray">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(redemption.date).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-xforge-darkgray rounded-xl p-8 text-center">
              <p className="text-xforge-gray">
                You haven't redeemed any promo codes yet.
              </p>
            </div>
          )}
        </div>
        
        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 inline-block border-b-2 border-xforge-teal pb-2">
            How It <span className="text-xforge-teal">Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-xforge-darkgray to-xforge-dark rounded-xl p-8 text-center shadow-lg border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300">
              <div className="w-16 h-16 bg-xforge-teal bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xforge-teal font-bold text-2xl">1</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Find a Promo Code</h3>
              <p className="text-xforge-gray">
                Locate promo codes on product packaging, social media, or during ForgePh events.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-xforge-darkgray to-xforge-dark rounded-xl p-8 text-center shadow-lg border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300">
              <div className="w-16 h-16 bg-xforge-teal bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xforge-teal font-bold text-2xl">2</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Enter Your Code</h3>
              <p className="text-xforge-gray">
                Submit your promo code in the form above to validate it and claim your reward.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-xforge-darkgray to-xforge-dark rounded-xl p-8 text-center shadow-lg border border-xforge-teal/10 hover:border-xforge-teal/30 transition-all duration-300">
              <div className="w-16 h-16 bg-xforge-teal bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xforge-teal font-bold text-2xl">3</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Earn Rewards</h3>
              <p className="text-xforge-gray">
                Successfully redeemed codes add points to your account which can be used for exclusive rewards.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromoCodes;