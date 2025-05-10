import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Star,
  Calendar,
  ArrowRight,
  Clock,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bookmark,
  Share2,
  Search,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const News: React.FC = () => {
  const { addNotification } = useNotifications();
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Add a notification when the news page is visited
    const hasVisitedNews = localStorage.getItem("visited-news");
    if (!hasVisitedNews) {
      setTimeout(() => {
        addNotification({
          title: "New Content Available",
          message: "Check out our latest news and upcoming events!",
          type: "system",
        });
        localStorage.setItem("visited-news", "true");
      }, 2000);
    }
  }, [addNotification]);

  // News items
  const newsItems = [
    {
      id: 1,
      title: "XForge Partners with Leading Music Festival",
      date: "June 15, 2023",
      author: "XForge Team",
      category: "Events",
      image: "https://placehold.co/600x400/292929/02ECCF?text=XForge+Festival",
      excerpt:
        "XForge is proud to announce our partnership with Soundwave, one of the biggest music festivals in the country.",
      hasVideo: true,
      content:
        "XForge is proud to announce our partnership with Soundwave, one of the biggest music festivals in the country. This collaboration will bring our innovative vaping products to festival-goers across the nation. Look for our branded tents and exclusive festival editions of our most popular products. We'll be offering special discounts and limited-edition flavors only available at Soundwave events.",
    },
    {
      id: 2,
      title: "New XForge Pro Model Coming Soon",
      date: "May 28, 2023",
      author: "Product Team",
      category: "Product Update",
      image: "https://placehold.co/600x400/292929/02ECCF?text=XForge+Pro",
      excerpt:
        "We're excited to announce our upcoming XForge Pro model, featuring longer battery life and enhanced flavor technology.",
      hasVideo: false,
      content:
        "We're excited to announce our upcoming XForge Pro model, featuring longer battery life and enhanced flavor technology. Our engineering team has been working tirelessly to bring you the most advanced vaping experience yet. The XForge Pro will offer up to 30% more battery life, improved flavor delivery systems, and a sleeker design that fits comfortably in your hand. Look for pre-orders starting next month!",
    },
    {
      id: 3,
      title: "XForge Community Spotlight: User Stories",
      date: "May 10, 2023",
      author: "Community Manager",
      category: "Community",
      image: "https://placehold.co/600x400/292929/02ECCF?text=XForge+Community",
      excerpt:
        "Hear from real XForge users about how our products have enhanced their vaping experience.",
      hasVideo: true,
      content:
        "Hear from real XForge users about how our products have enhanced their vaping experience. In this month's community spotlight, we feature stories from five long-time XForge enthusiasts who share their journey with our products. From first-time vapers to seasoned connoisseurs, discover the diverse ways our community uses XForge to elevate their lifestyle.",
    },
  ];

  // Additional news items (only shown when View All is clicked)
  const additionalNewsItems = [
    {
      id: 4,
      title: "XForge Flavor Lab: Behind the Scenes",
      date: "April 25, 2023",
      author: "Flavor Development Team",
      category: "Product Development",
      image:
        "https://placehold.co/600x400/292929/02ECCF?text=XForge+Flavor+Lab",
      excerpt:
        "Take a peek inside our flavor development laboratory and learn how we create our signature tastes.",
      hasVideo: false,
      content:
        "Take a peek inside our flavor development laboratory and learn how we create our signature tastes. Our team of flavor scientists combines the art and science of taste to develop unique profiles that delight our customers. This article explores the rigorous testing, quality control, and creative processes that go into every XForge flavor.",
    },
    {
      id: 5,
      title: "XForge Introduces Sustainable Packaging",
      date: "April 12, 2023",
      author: "Sustainability Team",
      category: "Environment",
      image:
        "https://placehold.co/600x400/292929/02ECCF?text=XForge+Sustainable",
      excerpt:
        "Our commitment to the environment continues with our new eco-friendly packaging initiative.",
      hasVideo: false,
      content:
        "Our commitment to the environment continues with our new eco-friendly packaging initiative. Starting next month, all XForge products will ship in 100% recyclable packaging made from sustainable materials. This change is part of our broader sustainability goals for reducing our carbon footprint and minimizing waste across our entire supply chain.",
    },
    {
      id: 6,
      title: "Vaping Regulations: What You Need to Know",
      date: "March 30, 2023",
      author: "Legal Team",
      category: "Regulations",
      image:
        "https://placehold.co/600x400/292929/02ECCF?text=XForge+Regulations",
      excerpt:
        "Stay informed about the latest regulatory changes affecting the vaping industry and what they mean for you.",
      hasVideo: false,
      content:
        "Stay informed about the latest regulatory changes affecting the vaping industry and what they mean for you. This comprehensive guide breaks down recent legislation, upcoming regulatory changes, and how XForge is adapting to ensure full compliance while continuing to deliver the quality products you expect.",
    },
  ];

  // Display all news items if showAllArticles is true
  const displayedNews = showAllArticles
    ? [...newsItems, ...additionalNewsItems]
    : newsItems;

  // Filter news items based on search query
  const filteredNews = displayedNews.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upcoming events
  const events = [
    {
      id: 1,
      title: "XForge Tasting Event",
      date: "July 12, 2023",
      location: "San Francisco, CA",
      description:
        "Join us for an exclusive tasting of our newest flavors before they hit the market.",
    },
    {
      id: 2,
      title: "Vape Expo 2023",
      date: "August 5-7, 2023",
      location: "Las Vegas, NV",
      description:
        "Visit our booth at the biggest vape industry event of the year and try our products.",
    },
    {
      id: 3,
      title: "XForge Pro Launch Party",
      date: "September 20, 2023",
      location: "Miami, FL",
      description:
        "Be the first to experience our new XForge Pro model with special promotions and giveaways.",
    },
  ];

  const [currentArticle, setCurrentArticle] = useState<
    (typeof newsItems)[0] | null
  >(null);

  const handleReadMore = (article: (typeof newsItems)[0]) => {
    setCurrentArticle(article);
    window.scrollTo(0, 0);
  };

  const handleCloseArticle = () => {
    setCurrentArticle(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dynamic background with animated gradients */}
      <div className="fixed inset-0 bg-xforge-dark overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(2,236,207,0.15),transparent_70%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(2,236,207,0.08),transparent_70%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-xforge-teal/5 blur-[120px] animate-pulse-light"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-xforge-teal/8 blur-[150px] animate-pulse-light"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <Header />

      <main className="relative z-10 flex-grow container mx-auto px-4 pt-32 pb-8">
        {currentArticle ? (
          // Article Detail View - Completely reimagined with striking visual effects
          <div className="animate-scale-in max-w-4xl mx-auto">
            <button
              onClick={handleCloseArticle}
              className="flex items-center text-xforge-teal mb-8 hover:brightness-110 transition-all group"
            >
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              Back to News
            </button>

            {/* Hero article card with enhanced 3D and glass effects */}
            <div className="relative card-3d bg-gradient-to-b from-xforge-darkgray/50 to-xforge-dark/90 rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(2,236,207,0.2)] border border-xforge-teal/30">
              {/* Article image with overlay */}
              <div className="relative">
                <img
                  src={currentArticle.image}
                  alt={currentArticle.title}
                  className="w-full h-[500px] object-cover scale-105 hover:scale-100 transition-all duration-700 brightness-90 hover:brightness-100"
                />

                {/* Image overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-xforge-dark via-xforge-dark/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-xforge-dark/70 via-transparent to-transparent"></div>

                {/* Floating category badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-xforge-teal px-4 py-2 rounded-full text-xforge-dark font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(2,236,207,0.5)] animate-float">
                    {currentArticle.category}
                  </div>
                </div>

                {/* Title and metadata section */}
                <div className="absolute bottom-0 left-0 w-full p-10">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gradient-teal">
                    {currentArticle.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center glass-teal px-4 py-2 rounded-full">
                      <Clock className="h-4 w-4 mr-2 text-xforge-teal" />
                      <span className="text-white">{currentArticle.date}</span>
                    </div>
                    <div className="flex items-center glass-teal px-4 py-2 rounded-full">
                      <User className="h-4 w-4 mr-2 text-xforge-teal" />
                      <span className="text-white">
                        {currentArticle.author}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article content with enhanced typography and layout */}
              <div className="p-10 md:p-12 space-y-8">
                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-xl leading-relaxed text-white/90 first-letter:text-5xl first-letter:font-bold first-letter:text-xforge-teal first-letter:mr-2 first-letter:float-left">
                    {currentArticle.content}
                  </p>

                  <p className="text-xl leading-relaxed text-white/90 mt-8">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam auctor, nunc eget ultricies sodales, nisl metus
                    vulputate nisi, eget vehicula felis massa at nisi. Proin
                    sagittis nisi vel dui faucibus, nec iaculis eros faucibus.
                  </p>

                  {/* Highlighted quote section */}
                  <div className="relative my-12">
                    <div className="absolute -left-6 top-0 text-8xl text-xforge-teal opacity-30">
                      "
                    </div>
                    <blockquote className="pl-8 py-4 border-l-4 border-xforge-teal glass-teal rounded-r-xl p-8">
                      <p className="text-2xl italic font-light text-white leading-relaxed">
                        Our goal is to constantly push the boundaries of what's
                        possible in vaping technology while maintaining our
                        commitment to quality and user experience.
                      </p>
                      
                    </blockquote>
                  </div>

                  <p className="text-xl leading-relaxed text-white/90">
                    Sed ut erat non sem cursus tempus. Donec quis lorem vitae
                    libero elementum posuere. Quisque at justo non dui interdum
                    semper. Integer vel erat vel sapien semper ultrices at eu
                    turpis.
                  </p>
                </div>

                {/* Interactive article actions */}
                <div className="mt-12 pt-8 border-t border-xforge-teal/20">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex space-x-3">
                      <Button
                        variant="default"
                        className="bg-xforge-teal/20 border border-xforge-teal/40 hover:bg-xforge-teal/40 text-white group relative overflow-hidden"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-xforge-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <Share2 className="mr-2 h-4 w-4 text-xforge-teal group-hover:scale-110 transition-transform" />{" "}
                        Share
                      </Button>
                      <Button
                        variant="default"
                        className="bg-xforge-teal/20 border border-xforge-teal/40 hover:bg-xforge-teal/40 text-white group relative overflow-hidden"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-xforge-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <Bookmark className="mr-2 h-4 w-4 text-xforge-teal group-hover:scale-110 transition-transform" />{" "}
                        Save
                      </Button>
                    </div>

                    {/* Navigation buttons with animated effects */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="glass-teal text-white hover:bg-xforge-teal/30 group"
                        onClick={() => {
                          const prevIndex =
                            displayedNews.findIndex(
                              (item) => item.id === currentArticle.id
                            ) - 1;
                          if (prevIndex >= 0) {
                            setCurrentArticle(displayedNews[prevIndex]);
                            window.scrollTo(0, 0);
                          }
                        }}
                        disabled={
                          displayedNews.findIndex(
                            (item) => item.id === currentArticle.id
                          ) === 0
                        }
                      >
                        <ChevronLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform text-xforge-teal" />
                        <span>Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="glass-teal text-white hover:bg-xforge-teal/30 group"
                        onClick={() => {
                          const nextIndex =
                            displayedNews.findIndex(
                              (item) => item.id === currentArticle.id
                            ) + 1;
                          if (nextIndex < displayedNews.length) {
                            setCurrentArticle(displayedNews[nextIndex]);
                            window.scrollTo(0, 0);
                          }
                        }}
                        disabled={
                          displayedNews.findIndex(
                            (item) => item.id === currentArticle.id
                          ) ===
                          displayedNews.length - 1
                        }
                      >
                        <span>Next</span>
                        <ChevronRight className="h-5 w-5 group-hover:transform group-hover:translate-x-1 transition-transform text-xforge-teal" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related articles section */}
            <div className="mt-20">
              <h3 className="text-3xl font-bold inline-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-white to-xforge-teal mb-10">
                Related <span className="ml-2 text-xforge-teal">Articles</span>
                <div className="ml-4 h-px w-40 bg-gradient-to-r from-xforge-teal to-transparent self-end mb-2"></div>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayedNews
                  .filter((item) => item.id !== currentArticle.id)
                  .slice(0, 3)
                  .map((item, index) => (
                    <Card
                      key={`related-${item.id}`}
                      className="group card-3d bg-gradient-to-b from-xforge-darkgray/40 to-xforge-dark/80 border-xforge-teal/20 hover:border-xforge-teal/50 shadow-lg hover:shadow-[0_10px_40px_rgba(2,236,207,0.2)] overflow-hidden"
                      onClick={() => handleReadMore(item)}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-xforge-dark to-transparent opacity-70"></div>
                        <div className="absolute top-3 right-3 bg-xforge-dark/70 backdrop-blur-md text-xforge-teal text-xs font-bold px-3 py-1 rounded-full border border-xforge-teal/30">
                          {item.category}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-white font-bold text-xl mb-3 group-hover:text-xforge-teal transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xforge-gray mb-4 line-clamp-2 text-sm">
                          {item.excerpt}
                        </p>
                        <Button
                          variant="ghost"
                          className="p-0 text-xforge-teal group-hover:text-white font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadMore(item);
                          }}
                        >
                          Read Article{" "}
                          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          // News List View - Completely redesigned with futuristic elements
          <>
            {/* Hero header with dynamic elements */}
            <div className="relative mb-24 text-center overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute -top-20 left-1/3 w-72 h-72 rounded-full bg-xforge-teal/10 filter blur-[100px] animate-pulse-light"></div>
              <div
                className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-xforge-teal/5 filter blur-[120px] animate-pulse-light"
                style={{ animationDelay: "2s" }}
              ></div>

              <div className="relative z-10 max-w-4xl mx-auto">
                {/* Animated icon with glow effect */}
                <div className="inline-flex items-center justify-center p-4 bg-xforge-teal/10 backdrop-blur-xl rounded-full mb-8 border border-xforge-teal/30 shadow-[0_0_30px_rgba(2,236,207,0.3)] animate-glow">
                  <Star className="h-8 w-8 text-xforge-teal animate-pulse-light" />
                </div>

                {/* Dramatic headline with gradient effect */}
                <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
                  <span className="bg-gradient-to-br from-white via-white to-xforge-teal bg-clip-text text-transparent">
                    ForgePh Innovation Hub
                  </span>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-36 h-1 bg-gradient-to-r from-transparent via-xforge-teal to-transparent"></div>
                </h1>

                <p className="text-xforge-gray max-w-2xl mx-auto text-xl leading-relaxed mb-10">
                  Explore the cutting edge of vaping technology with our latest
                  news, product innovations, and exclusive community events.
                </p>

                {/* Search bar with glassmorphism effect */}
                <div className="max-w-xl mx-auto relative glass-dark rounded-full p-1 border border-xforge-teal/20 shadow-[0_0_20px_rgba(2,236,207,0.15)] focus-within:shadow-[0_0_30px_rgba(2,236,207,0.25)] transition-all duration-300">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-xforge-teal ml-4 mr-2" />
                    <input
                      type="text"
                      placeholder="Search articles, categories, authors..."
                      className="w-full bg-transparent border-none text-white py-3 px-2 focus:outline-none placeholder:text-xforge-gray/70"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="mr-4 text-xforge-gray hover:text-white"
                        onClick={() => setSearchQuery("")}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured article - Completely redesigned with dramatic visual impact */}
            <div className="mb-24 relative overflow-hidden rounded-2xl card-3d group">
              {/* Layered background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-xforge-dark/80 via-xforge-dark/60 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(2,236,207,0.2),transparent_70%)]"></div>

              <img
                src="https://placehold.co/1200x600/292929/02ECCF?text=XForge+Featured+News"
                alt="Featured News"
                className="w-full h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105 brightness-50 group-hover:brightness-60"
              />

              {/* Content overlay with depth and animation */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 md:p-16">
                <div className="max-w-4xl">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="glass-teal px-4 py-2 rounded-full text-white text-sm backdrop-blur-xl shadow-[0_0_15px_rgba(2,236,207,0.3)] animate-float">
                      <span className="text-xforge-teal font-bold">
                        FEATURED
                      </span>
                    </div>
                    <div className="h-px w-20 bg-gradient-to-r from-xforge-teal to-transparent"></div>
                  </div>

                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 leading-tight group-hover:text-xforge-teal transition-colors duration-300">
                    <span className="bg-gradient-to-r from-white to-xforge-gray bg-clip-text text-transparent">
                      ForgePh Introduces Revolutionary New <br />
                      Flavor Technology
                    </span>
                  </h2>

                  <p className="text-white text-xl mb-10 max-w-3xl leading-relaxed">
                    Our groundbreaking extraction process delivers the most
                    authentic vaping experience yet. Discover how our engineers
                    are redefining industry standards with molecular precision.
                  </p>

                  <div className="flex flex-wrap items-center space-x-6 mb-8">
                    <div className="flex items-center glass-dark backdrop-blur-xl px-4 py-2 rounded-full">
                      <Clock className="h-4 w-4 mr-2 text-xforge-teal" />
                      <span className="text-white">July 2, 2023</span>
                    </div>
                    <div className="flex items-center glass-dark backdrop-blur-xl px-4 py-2 rounded-full">
                      <User className="h-4 w-4 mr-2 text-xforge-teal" />
                      <span className="text-white">ForgePh Research Team</span>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      handleReadMore({
                        id: 7,
                        title:
                          "XForge Introduces Revolutionary New Flavor Technology",
                        date: "July 2, 2023",
                        author: "ForgePh Research Team",
                        category: "Technology",
                        image:
                          "https://placehold.co/1200x600/292929/02ECCF?text=XForge+Featured+News",
                        excerpt:
                          "Our new proprietary flavor extraction process delivers the most authentic taste experience yet.",
                        hasVideo: false,
                        content:
                          "Our new proprietary flavor extraction process delivers the most authentic taste experience yet. Learn how our engineers are pushing the boundaries of vaping technology. This breakthrough comes after years of research and development, combining cutting-edge molecular gastronomy techniques with advanced vaping hardware. The result is a flavor profile that's indistinguishable from the real thing, whether you're enjoying fruits, desserts, or specialty blends.",
                      })
                    }
                    className="bg-gradient-to-r from-xforge-teal to-teal-400 text-xforge-dark hover:to-teal-300 font-bold px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(2,236,207,0.4)] hover:shadow-[0_0_40px_rgba(2,236,207,0.6)] transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      Explore Article{" "}
                      <ArrowRight className="ml-2 h-5 w-5 animate-pulse-light group-hover/btn:animate-none group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Latest News Section - Futuristic grid with 3D cards */}
            <section className="mb-16 relative">

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                <div>
                  <h2 className="text-3xl font-bold inlineF-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-white to-xforge-teal">
                    Latest{" "}
                    <span className="ml-2 text-xforge-teal">Innovations</span>
                    <div className="ml-4 h-px w-20 bg-gradient-to-r from-xforge-teal to-transparent self-end mb-2"></div>
                  </h2>
                  <p className="text-xforge-gray mt-2 max-w-xl">
                    Explore our newest developments and industry insights
                  </p>
                </div>

                <Button
                  onClick={() => setShowAllArticles(!showAllArticles)}
                  variant="outline"
                  className="mt-4 md:mt-0 glass-teal border-xforge-teal/30 text-white hover:bg-xforge-teal hover:text-xforge-dark"
                >
                  {showAllArticles ? "Show Less" : "View All Articles"}
                </Button>
              </div>

              {/* Interactive card grid with hover effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item, index) => (
                    <Card
                      key={item.id}
                      className="group card-3d bg-gradient-to-b from-xforge-darkgray/40 to-xforge-dark/80 rounded-xl overflow-hidden border border-xforge-teal/10 hover:border-xforge-teal/40 shadow-lg hover:shadow-[0_20px_50px_rgba(2,236,207,0.2)] transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleReadMore(item)}
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-90"
                        />

                        {/* Video play button */}
                        {item.hasVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-xforge-teal/70 backdrop-blur-md rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(2,236,207,0.5)] border border-white/20">
                              <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1"></div>
                            </div>
                          </div>
                        )}

                        {/* Category badge */}
                        <div className="absolute top-3 right-3 glass-dark text-xforge-teal text-xs font-bold px-3 py-1 rounded-full border border-xforge-teal/20 backdrop-blur-md">
                          {item.category}
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-xforge-dark via-xforge-dark/60 to-transparent opacity-90"></div>
                      </div>

                      <CardContent className="p-7">
                        <div className="flex items-center text-xs text-xforge-gray mb-3">
                          <Clock className="h-3 w-3 mr-1 text-xforge-teal/70" />
                          <span className="mr-3">{item.date}</span>
                          <User className="h-3 w-3 mr-1 text-xforge-teal/70" />
                          <span>{item.author}</span>
                        </div>

                        <h3 className="text-white font-bold text-xl mb-3 group-hover:text-xforge-teal transition-colors leading-tight min-h-[4rem] line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xforge-gray mb-5 line-clamp-2 text-sm">
                          {item.excerpt}
                        </p>

                        <div className="absolute bottom-5 right-6">
                          <div className="flex items-center text-xforge-teal group-hover:translate-x-1 transition-transform duration-300">
                            <span className="mr-1 text-sm font-medium">
                              Read
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-20">
                    <div className="glass-dark rounded-xl p-10 border border-xforge-teal/20 max-w-md mx-auto">
                      <Search className="h-12 w-12 text-xforge-teal mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">
                        No Results Found
                      </h3>
                      <p className="text-xforge-gray mb-6">
                        We couldn't find any articles matching "{searchQuery}"
                      </p>
                      <Button
                        onClick={() => setSearchQuery("")}
                        className="bg-xforge-teal/20 border border-xforge-teal/40 hover:bg-xforge-teal text-white hover:text-xforge-dark"
                      >
                        Clear Search
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Load more action */}
              {!showAllArticles &&
                filteredNews.length > 0 &&
                filteredNews.length === newsItems.length && (
                  <div className="text-center mt-16">
                    <Button
                      onClick={() => setShowAllArticles(true)}
                      className="bg-gradient-to-r from-xforge-dark to-xforge-darkgray border border-xforge-teal/30 text-xforge-teal hover:text-white px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(2,236,207,0.1)] hover:shadow-[0_0_30px_rgba(2,236,207,0.3)] transition-all duration-300"
                    >
                      Load More Articles{" "}
                      <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                    </Button>
                  </div>
                )}
            </section>

            {/* Events Section - Futuristic card design */}
            <section className="mb-24 relative">
              <h2 className="text-3xl font-bold inline-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-white to-xforge-teal mb-10">
                Upcoming <span className="ml-2 text-xforge-teal">Events</span>
                <div className="ml-4 h-px w-20 bg-gradient-to-r from-xforge-teal to-transparent self-end mb-2"></div>
              </h2>

              <div className="space-y-6">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="group card-3d glass-dark rounded-xl p-1 border border-xforge-teal/20 hover:border-xforge-teal/40 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(2,236,207,0.15)] transform hover:-translate-y-1 backdrop-blur-md animate-fade-in"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="p-6 relative overflow-hidden rounded-lg">
                      {/* Subtle animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-xforge-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                        {/* Calendar card with 3D effect */}
                        <div className="glass-teal rounded-xl p-6 text-center w-full md:w-36 shadow-lg group-hover:shadow-[0_0_20px_rgba(2,236,207,0.2)] transition-all transform group-hover:translate-y-[-5px] group-hover:rotate-3 duration-300">
                          <Calendar className="h-10 w-10 text-xforge-teal mx-auto mb-3" />
                          <p className="text-white font-bold text-lg">
                            {event.date.split(",")[0]}
                          </p>
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-white font-bold text-2xl mb-3 group-hover:text-xforge-teal transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center mb-4">
                            <Tag className="h-4 w-4 text-xforge-teal mr-2" />
                            <p className="text-xforge-teal">{event.location}</p>
                          </div>
                          <p className="text-xforge-gray text-lg">
                            {event.description}
                          </p>
                        </div>

                        <div className="mt-4 md:mt-0 flex-shrink-0">
                          <Button className="glass-teal border-none text-white hover:bg-xforge-teal hover:text-xforge-dark transition-all duration-300 rounded-lg shadow-[0_0_15px_rgba(2,236,207,0.1)] hover:shadow-[0_0_25px_rgba(2,236,207,0.3)] group/btn">
                            <span className="mr-2">RSVP</span>
                            <ExternalLink className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Newsletter subscription - Redesigned with futuristic appeal */}
              <div className="relative mt-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-xforge-dark/90 via-xforge-darkgray/20 to-xforge-dark/80 z-0"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,236,207,0.15),transparent_70%)]"></div>

                {/* Animated background elements */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-xforge-teal/10 filter blur-[120px] animate-pulse-light"></div>
                <div
                  className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-xforge-teal/5 filter blur-[100px] animate-pulse-light"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>
            </section>
          </>
        )}
        
      </main>
      </div>
      
        

  );
};

export default News;
