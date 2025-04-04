import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Milestones from "@/components/Milestone";
import TermsConditions from "@/components/TermsConditions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronRight, Store, Users, ShieldCheck, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RetailersLanding: React.FC = () => {
  const [isVerified, setIsVerified] = useState(true);
  const [userName, setUserName] = useState("Sarah");
  const [points, setPoints] = useState(5280);
  const navigate = useNavigate();
  
  const [news, setNews] = useState([
    {
      id: 1,
      title: "New XForge Pro Collection Launch",
      date: "April 15, 2025",
      excerpt: "Introducing our most advanced devices yet with extended battery life and unique flavor profiles.",
      image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["Product Launch", "Featured"]
    },
    {
      id: 2,
      title: "Summer Retailer Conference 2025",
      date: "May 10, 2025",
      excerpt: "Join us for our annual retailer conference with exclusive previews and networking opportunities.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["Event", "Conference"]
    },
    {
      id: 3,
      title: "Updated Retailer Policies for Q3",
      date: "June 1, 2025",
      excerpt: "Important changes to our retailer program including new incentives and promotional materials.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: ["Policy Update", "Important"]
    }
  ]);

  useEffect(() => {
    // Simulating data loading
    document.title = "XForge Retailers Portal";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-xforge-dark">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Welcome Banner */}
        <section className="py-12 bg-xforge-darkgray relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-xforge-dark to-transparent opacity-70"></div>
          <div className="container relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  Welcome, <span className="text-xforge-teal">{userName}</span>
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  {isVerified ? (
                    <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1 px-3 py-1">
                      <ShieldCheck className="w-4 h-4" /> Verified Retailer
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1">
                      <ShieldX className="w-4 h-4" /> Verification Pending
                    </Badge>
                  )}
                  <span className="text-xforge-gray">Silver Member</span>
                </div>
                <p className="text-xforge-lightgray max-w-xl mb-6">
                  Track your progress, manage your inventory, stay updated with the latest news, and redeem exclusive rewards for our valued retail partners.
                </p>
              </div>
              
              <div className="bg-xforge-dark p-6 rounded-lg border border-xforge-teal border-opacity-30 glass-dark shadow-lg animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Your Points</h3>
                  <Bell className="text-xforge-teal" />
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-xforge-teal">{points.toLocaleString()}</span>
                  <span className="text-xforge-lightgray ml-2">points</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-xforge-darkgray bg-opacity-50 p-3 rounded">
                    <Store className="text-xforge-teal mb-1" />
                    <div className="text-sm text-xforge-lightgray">Store Sales</div>
                    <div className="text-white font-bold">53 units</div>
                  </div>
                  <div className="bg-xforge-darkgray bg-opacity-50 p-3 rounded">
                    <Users className="text-xforge-teal mb-1" />
                    <div className="text-sm text-xforge-lightgray">Customer Referrals</div>
                    <div className="text-white font-bold">12 people</div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate("/rewards")}>
                  View Rewards
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <Milestones isVerified={isVerified} />
        
        {/* News Preview Section */}
        <section className="py-12 bg-xforge-dark">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Latest News</h2>
              <Button variant="outline" onClick={() => navigate("/news")} className="flex items-center">
                View All News <ChevronRight className="ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="bg-xforge-darkgray border-xforge-lightgray border-opacity-20 overflow-hidden hover:border-xforge-teal transition-all duration-300 h-full">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex gap-2 mb-2">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-xforge-teal bg-opacity-10 text-xforge-teal border-xforge-teal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-white text-xl">{item.title}</CardTitle>
                    <CardDescription className="flex items-center text-xforge-lightgray">
                      <Calendar className="w-4 h-4 mr-1" /> {item.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xforge-gray mb-4">{item.excerpt}</p>
                    <Button variant="ghost" className="text-xforge-teal hover:text-white p-0">
                      Read More <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Terms & Conditions Section */}
        <TermsConditions />
      </main>
      
      <Footer />
    </div>
  );
};

export default RetailersLanding;