import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Campaign from "../components/Campaign";
import Register from "../components/Register";
import Footer from "../components/Footer";

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
}

const Index: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage or sessionStorage
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Check auth on mount
    checkAuth();
    
    // Set up event listener for auth changes
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("storage", checkAuth);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      });
    });
    
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function() {});
      });
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      {/* <Campaign /> */}
      {!user && <Register />} {/* Only show Register component if not logged in */}
    </div>
  );
};

export default Index;