
import React from "react";

const Features: React.FC = () => {
  const features = [
    {
      id: 1,
      title: "Premium Design",
      description: "Crafted from high-quality materials with elegant, ergonomic design for comfort and style.",
      icon: (
        <svg className="w-12 h-12 mb-4 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
      ),
    },
    {
      id: 2,
      title: "Advanced Technology",
      description: "Cutting-edge heating system ensures consistent vapor production and flavor delivery.",
      icon: (
        <svg className="w-12 h-12 mb-4 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
    },
    {
      id: 3,
      title: "Long Battery Life",
      description: "Extended battery capacity keeps you vaping longer between charges for all-day enjoyment.",
      icon: (
        <svg className="w-12 h-12 mb-4 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
        </svg>
      ),
    },
    {
      id: 4,
      title: "Premium Flavors",
      description: "Wide range of meticulously crafted flavors to satisfy every preference and taste.",
      icon: (
        <svg className="w-12 h-12 mb-4 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      ),
    },
    {
      id: 5,
      title: "Smart Controls",
      description: "Intuitive temperature control ensures the perfect vaping experience every time.",
      icon: (
        <svg className="w-12 h-12 mb-4 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
    },
    {
      id: 6,
      title: "Eco-Friendly",
      description: "Sustainable design and recyclable components minimize environmental impact.",
      icon: (
        <svg className="w-12 h-12 mb-4 text-xforge-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="section bg-gradient-to-b from-xforge-dark to-black">
      <div className="container">
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wider uppercase rounded-full bg-xforge-teal bg-opacity-20 text-xforge-teal">
            Features
          </span>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl text-white">
            Engineered For <span className="text-xforge-teal">Excellence</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xforge-lightgray">
            Every aspect of Forge has been meticulously designed and engineered to deliver an exceptional vaping experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="p-6 transition-all duration-300 border border-xforge-teal border-opacity-20 rounded-lg hover:border-opacity-50 bg-gradient-to-br from-xforge-dark to-black hover:shadow-[0_0_30px_rgba(2,236,207,0.1)] group"
            >
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:text-xforge-teal">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-xforge-lightgray">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
