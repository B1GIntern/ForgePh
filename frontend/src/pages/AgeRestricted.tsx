import React from 'react';
import { ChevronDown } from 'lucide-react';

const AgeRestricted: React.FC = () => {
  const handleGoBack = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-16">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-[#292929] -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,236,207,0.1),transparent_70%)] -z-10"></div>

      {/* Animated Blur Circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="flex-1 text-center z-10 max-w-md">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl text-white">
            <span className="text-xforge-teal">AGE</span> RESTRICTION
          </h1>

          <p 
            className="max-w-md mb-8 text-lg text-xforge-lightgray"
            style={{ animationDelay: "0.2s" }}
          >
            <strong>This is a member-only website for adult smokers 18 years or older residing in the Philippines.</strong>
            <br /><br />
            Access to this website is subject to age verification.
          </p>

          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={handleGoBack}
              className="w-full border-2 border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] text-lg py-4 px-8 rounded-lg transition-colors duration-300"
            >
              Go Back to Browser
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgeRestricted;