
import React from "react";

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen pt-24 overflow-hidden mt-20 md:mt-0">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-xforge-teal blur-[100px] animate-pulse-light"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-xforge-teal blur-[100px] animate-pulse-light" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="container relative z-10 flex flex-col items-center justify-center h-[calc(100vh-6rem)] md:flex-row">
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-1/2 animate-fade-in-left">
          <span className="px-4 py-1 mb-4 text-sm font-semibold tracking-wider uppercase rounded-full bg-xforge-teal bg-opacity-20 text-xforge-teal">
            Premium Vaping Experience
          </span>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-white">
            Experience The <span className="text-xforge-teal">Future</span> Of Vaping
          </h1>
          <p className="max-w-md mb-8 text-lg text-xforge-lightgray">
            Forge combines innovation, elegance, and performance to deliver a vaping experience like no other.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#features" className="btn btn-primary">
              Explore Features
            </a>
            <a href="#register" className="btn btn-outline">
              Join Now
            </a>
          </div>
        </div>

        <div className="relative mt-12 md:mt-0 md:w-1/2 animate-fade-in-right">
          {/* Product Image Container */}
          <div className="relative mx-auto w-72 h-72 md:w-96 md:h-96">
            {/* Glowing background effect */}
            <div className="absolute inset-0 mx-auto w-48 h-48 md:w-64 md:h-64 rounded-full bg-xforge-teal blur-[60px] opacity-40"></div>
            
            {/* Product Image Placeholder - You can replace this with your actual product image */}
            <div className="relative flex items-center justify-center w-full h-full animate-float">
              <div className="w-24 h-64 bg-xforge-dark rounded-3xl border border-xforge-teal shadow-[0_0_30px_rgba(2,236,207,0.3)] relative overflow-hidden">
                {/* Simulated glass effect */}
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-transparent to-transparent"></div>
                
                {/* Simulated liquid level */}
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-xforge-teal bg-opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-t from-xforge-teal to-transparent opacity-40"></div>
                </div>
                
                {/* XForge logo on the device */}
                <div className="absolute top-4 left-0 right-0 text-center">
                  <span className="text-xs font-bold text-xforge-teal">Forge</span>
                </div>
                
                {/* Button/indicator */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                  <div className="w-6 h-6 rounded-full border border-xforge-teal flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-xforge-teal animate-pulse-light"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
        <div className="w-8 h-12 border-2 border-xforge-teal rounded-full flex justify-center">
          <div className="w-1 h-3 bg-xforge-teal rounded-full mt-2 animate-[fade-in_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
