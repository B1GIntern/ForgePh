
import React, { useState } from "react";

const Campaign: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setMessage({ 
        text: "Please enter a promo code", 
        type: "error" 
      });
      return;
    }
    
    // Simulate promo code validation
    setTimeout(() => {
      // Example validation logic (in a real app, this would be a server call)
      if (promoCode.toLowerCase() === "xforge2023") {
        setMessage({ 
          text: "Success! 20% discount applied to your next purchase", 
          type: "success" 
        });
      } else {
        setMessage({ 
          text: "Invalid promo code. Please try again", 
          type: "error" 
        });
      }
    }, 800);
  };

  return (
    <section id="campaign" className="section bg-gradient-to-b from-black to-xforge-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-xforge-teal blur-[120px] animate-pulse-light"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl mb-10 text-center lg:text-left lg:mb-0 lg:w-1/2 animate-fade-in-left">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wider uppercase rounded-full bg-xforge-teal bg-opacity-20 text-xforge-teal">
              Limited Time Offer
            </span>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl text-white">
              Join Our Exclusive <span className="text-xforge-teal">Campaign</span>
            </h2>
            <p className="mb-6 text-xforge-lightgray">
              Enter your promo code to unlock special discounts and exclusive offers on Forge products. Our current campaign gives you access to limited edition flavors and accessories.
            </p>
            <div className="p-6 border border-xforge-teal border-opacity-20 rounded-lg bg-black bg-opacity-30 backdrop-blur">
              <h3 className="mb-3 text-xl font-bold text-white">Campaign Benefits:</h3>
              <ul className="mb-6 space-y-2 text-xforge-lightgray">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Up to 20% off on select products
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Free accessories with purchase
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Early access to new flavors
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Extended warranty on devices
                </li>
              </ul>
              <p className="text-sm italic text-xforge-gray">*Terms and conditions apply. Limited time offer.</p>
            </div>
          </div>

          <div className="w-full max-w-md lg:w-5/12 animate-fade-in-right">
            <div className="p-8 border border-xforge-teal border-opacity-30 rounded-lg bg-black bg-opacity-40 backdrop-blur shadow-[0_0_30px_rgba(2,236,207,0.1)]">
              <h3 className="mb-6 text-2xl font-bold text-center text-white">Redeem Your Promo Code</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="promoCode" className="block mb-2 text-sm font-medium text-xforge-gray">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    id="promoCode"
                    className="input-field"
                    placeholder="Enter your promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>

                {message.text && (
                  <div className={`p-3 mb-4 rounded-md ${
                    message.type === "success" 
                      ? "bg-green-900 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30" 
                      : "bg-red-900 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
                  }`}>
                    {message.text}
                  </div>
                )}

                <button type="submit" className="w-full btn btn-primary">
                  Apply Code
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-xforge-lightgray">
                  Don't have a code? <a href="#register" className="text-xforge-teal hover:underline">Register</a> to receive exclusive offers.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 border border-xforge-teal border-opacity-10 rounded-lg bg-black bg-opacity-20 backdrop-blur">
              <h4 className="flex items-center mb-2 font-bold text-white">
                <svg className="w-5 h-5 mr-2 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Promo Code Hint
              </h4>
              <p className="text-sm text-xforge-lightgray">
                Try using the code <span className="text-xforge-teal font-medium">XFORGE2023</span> to see how our redemption system works!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Campaign;
