import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
} from "lucide-react";
import image from "../assets/image.png";

const flavorPods = [
  {
    id: 1,
    name: "B1G RED",
    description: "A vibrant and refreshing burst of sweet, sun-kissed energy.",
    color: "#02ECCF",
    image: "/images/B1GSparkle.png",
  },
  {
    id: 2,
    name: "B1G HEART",
    description:
      "A playful and smooth sensation that captures a sweet, lively essence.",
    color: "#02ECCF",
    image: "/images/B1GHeart.png",
  },
  {
    id: 3,
    name: "B1G LUSH",
    description: "A luxurious wave of delicate sweetness with an exotic touch.",
    color: "#02ECCF",
    image: "/images/B1GLush.png",
  },
  {
    id: 4,
    name: "B1G FROST",
    description:
      "A cool, invigorating breeze that awakens and refreshes with a crisp clarity.",
    color: "#02ECCF",
    image: "/images/B1GFrost.png",
  },
  {
    id: 5,
    name: "B1G BLUE",
    description:
      "A calm, deep sensation that gently balances sweetness with a refreshing coolness.",
    color: "#02ECCF",
    image: "/images/B1GBlue.png",
  },
  {
    id: 6,
    name: "B1G SHIROTA",
    description:
      "A smooth, creamy experience that's light and subtly refreshing with a hint of smoothness.",
    color: "#02ECCF",
    image: "/images/B1GShirota.png",
  },
  {
    id: 7,
    name: "B1G PURPLE",
    description:
      "A rich, bold experience that evokes a sense of sophistication and indulgence.",
    color: "#02ECCF",
    image: "/images/B1GPurple.png",
  },
  {
    id: 8,
    name: "B1G RIZZ",
    description:
      "A dynamic, zesty blend that brings together a vibrant symphony of tangy and sweet notes.",
    color: "#02ECCF",
    image: "/images/B1GRizz.png",
  },
  {
    id: 9,
    name: "B1G BLACK",
    description:
      "A bold, intense sensation with a deep and slightly tart edge that lingers.",
    color: "#02ECCF",
    image: "/images/B1GBlack.png",
  },
  {
    id: 10,
    name: "B1G SPARKLE",
    description:
      "A bright, fizzy explosion of zest and zestful energy that tingles with excitement.",
    color: "#02ECCF",
    image: "/images/B1GSparkle.png",
  },
];

const batteries = [
  {
    id: 1,
    name: "Obsidian Black",
    color: "#2b2b2b",
    colorName: "Black",
    image: "/images/ObsidianBlack.png",
  },
  {
    id: 2,
    name: "Tiffany Blue",
    color: "#82ded2",
    colorName: "Teal",
    image: "/images/VividCyan.png",
  },
  {
    id: 3,
    name: "Metallic Grey",
    color: "#909393",
    colorName: "Gray",
    image: "/images/GraphiteGray.png",
  },
];

const ProductsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPod, setSelectedPod] = useState(flavorPods[0]);
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState(batteries[0]);

  const scrollToProducts = () => {
    const productsElement = document.getElementById("products");
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const podsPerPage = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 5, // Changed from 4 to 5
  };

  const showNext = () => {
    const maxIndex = Math.max(0, flavorPods.length - getPodsPerPage());
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
  };

  const showPrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const getPodsPerPage = () => {
    if (window.innerWidth < 640) return podsPerPage.xs;
    if (window.innerWidth < 768) return podsPerPage.sm;
    if (window.innerWidth < 1024) return podsPerPage.md;
    return podsPerPage.lg;
  };

  const viewPodDetails = (pod) => {
    setSelectedPod(pod);
    setIsDetailView(true);
  };

  const closeDetails = () => {
    setIsDetailView(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-[#292929] -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,236,207,0.1),transparent_70%)] -z-10"></div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-white">
              <span className="text-xforge-teal">FORGE</span> Your Perfect
              Vaping Experience
            </h1>

            <p
              className="max-w-md mb-8 text-lg text-xforge-lightgray"
              style={{ animationDelay: "0.2s" }}
            >
              Modern design meets premium performance. Discover the versatility
              of Forge Philippines' cutting-edge vaping products designed for
              the discerning enthusiast.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Button
                variant="outline"
                className="border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] text-lg py-6 px-8 transition-colors duration-300"
                onClick={scrollToProducts}
              >
                Explore Products
              </Button>
              <Button
                variant="outline"
                className="border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] text-lg py-6 px-8 transition-colors duration-300"
                onClick={() =>
                  window.open(
                    "/X FORGE POD MANUAL(Not final. Missing shelf life only)_1.pdf",
                    "_blank"
                  )
                }
              >
                View Manual
              </Button>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            <div className="relative w-full max-w-md mx-auto">
              <div className="w-40 h-40 rounded-full bg-[#02ECCF]/20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-xl animate-pulse-subtle -z-10"></div>

              <div className="relative z-10 animate-float">
                <svg viewBox="0 0 200 200" className="w-full drop-shadow-xl">
                  <path
                    fill="#02ECCF"
                    d="M44.8,-76.1C57.9,-69.8,68.4,-57.6,76.1,-43.9C83.8,-30.3,88.6,-15.1,88.5,-0.1C88.3,15,83.3,29.9,75.4,43.1C67.5,56.2,56.8,67.6,43.6,74.3C30.5,81,15.2,83.1,0.2,82.7C-14.8,82.4,-29.6,79.6,-42.6,72.5C-55.6,65.4,-66.9,54.1,-74.2,40.7C-81.5,27.3,-84.8,13.6,-84.1,0.4C-83.4,-12.9,-78.6,-25.8,-71.2,-37.7C-63.7,-49.6,-53.5,-60.4,-41.2,-67.5C-28.9,-74.5,-14.5,-77.8,0.4,-78.5C15.2,-79.2,30.5,-77.2,44.8,-76.1Z animate-fade-in"
                    transform="translate(100 100)"
                  />
                </svg>

                <img
                  src={image}
                  alt="Forge Vape Device"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 md:w-[30rem] lg:w-[35rem]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={scrollToProducts}
            className="text-forge-gray/70 hover:text-forge-teal transition-colors focus:outline-none"
          >
            <ChevronDown size={32} />
          </button>
        </div>
      </section>

      {/* Battery Options Section */}
      <section
        id="products"
        className="section min-h-screen flex items-center justify-center relative overflow-hidden pt-24"
      >
        <div className="absolute inset-0 bg-[#292929] -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,236,207,0.1),transparent_70%)] -z-10"></div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4 text-[#D6D6D6] animate-fade-in text-4xl font-extrabold">
              Premium Battery Options
            </h2>
            <p
              className="subheading mx-auto text-[#D6D6D6]/80 animate-fade-in text-lg font-light"
              style={{ animationDelay: "0.2s" }}
            >
              All our batteries feature the same powerful specs with different
              color options to match your style.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 relative">
              <div className="w-72 h-72 rounded-full bg-[#02ECCF]/20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
              <div className="relative animate-float">
                <img
                  src={selectedBattery.image}
                  alt={selectedBattery.name}
                  className="max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] mx-auto drop-shadow-2xl transition-all duration-500"
                />
              </div>
            </div>

            <div className="lg:w-1/2 space-y-8">
              <div className="animate-fade-in">
                <h3 className="heading-md mb-2 text-[#D6D6D6] text-3xl font-bold">
                  {selectedBattery.name}
                </h3>
                <p className="text-[#D6D6D6]/70 mb-6 text-base font-light">
                  Elevate your vaping experience with our premium battery
                  designed for optimal performance and longevity.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "500mAh Battery Capacity",
                    "Quick 30-Minute Charging",
                    "Premium Aluminum+PC Body",
                    "LED Battery Indicator",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="text-[#02ECCF]" />
                      <span className="text-[#D6D6D6]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <p className="font-medium mb-3 text-[#D6D6D6]">
                  Available Colors:
                </p>
                <div className="flex gap-4 mb-8">
                  {batteries.map((battery) => (
                    <button
                      key={battery.id}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        selectedBattery.id === battery.id
                          ? "ring-2 ring-offset-2 ring-[#02ECCF]"
                          : ""
                      }`}
                      style={{ backgroundColor: battery.color }}
                      onClick={() => setSelectedBattery(battery)}
                      aria-label={`Select ${battery.colorName} color`}
                    >
                      {selectedBattery.id === battery.id && (
                        <Check className="text-white" size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flavor Pods Section */}
      <section
        id="flavors"
        className="section min-h-screen flex items-center justify-center relative overflow-hidden pt-0 sm:pt-24 pb-0 sm:pb-24"
      >
        <div className="absolute inset-0 bg-[#292929] -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,236,207,0.1),transparent_70%)] -z-10"></div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#02ECCF]/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#D6D6D6] animate-fade-in">
              Flavor Pods Collection
            </h2>
            <p
              className="text-sm sm:text-base text-[#D6D6D6]/70 max-w-xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Explore our wide range of premium flavor pods designed to satisfy
              every taste preference.
            </p>
          </div>

          {/* Detail View */}
          {isDetailView ? (
            <div className="animate-fade-in">
              <Button
                variant="outline"
                className="mb-6 sm:mb-10 border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] px-6 py-3 text-lg font-medium"
                onClick={closeDetails}
              >
                <ChevronLeft className="mr-3" size={18} />
                Back to all flavors
              </Button>

              <div className="flex flex-col md:flex-row gap-12 sm:gap-16 items-center">
                {/* Image Section */}
                <div className="w-full md:w-1/2 relative flex justify-center">
                  {/* Glowing Background */}
                  <div
                    className="w-40 h-40 sm:w-56 sm:h-56 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50 -z-10"
                    style={{ backgroundColor: `${selectedPod.color}80` }}
                  ></div>

                  {/* Floating Product Image */}
                  <div className="animate-float">
                    <img
                      src={selectedPod.image}
                      alt={selectedPod.name}
                      className="max-h-[280px] sm:max-h-[420px] mx-auto drop-shadow-xl"
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 space-y-5 sm:space-y-8 text-center md:text-left">
                  {/* Product Name */}
                  <h3 className="text-2xl sm:text-4xl font-bold text-[#D6D6D6] tracking-wide">
                    {selectedPod.name}
                  </h3>

                  {/* Description */}
                  <p className="text-base sm:text-lg text-[#D6D6D6]/80 leading-relaxed">
                    {selectedPod.description}
                  </p>

                  {/* Product Specs */}
                  <div className="space-y-2 sm:space-y-4">
                    {[
                      "E-liquid Capacity: 10ml",
                      "Nicotine Content: 120 mg (12mg/ml)",
                      "Coil: 1.2Ω mesh coil",
                      "PG/VG Ratio: 60/40",
                      "Product Type: Prefilled Pod",
                    ].map((detail, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[16px_auto] gap-2 items-center text-[#D6D6D6]/80 text-sm sm:text-base font-light pl-4"
                      >
                        <span className="text-[#02ECCF]">●</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 overflow-hidden">
                  {flavorPods
                    .slice(currentIndex, currentIndex + getPodsPerPage())
                    .map((pod) => (
                      <div
                        key={pod.id}
                        className="bg-[#292929]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-md flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in cursor-pointer"
                        onClick={() => viewPodDetails(pod)}
                      >
                        <div className="relative w-full h-32 sm:h-40 mb-2 sm:mb-4">
                          <div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-lg -z-10"
                            style={{ backgroundColor: `${pod.color}65` }}
                          ></div>
                          <img
                            src={pod.image}
                            alt={pod.name}
                            className="h-full object-contain mx-auto"
                          />
                        </div>
                        <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-[#D6D6D6]">
                          {pod.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#D6D6D6]/70 mb-2 sm:mb-4 line-clamp-2">
                          {pod.description}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-auto w-full border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929]"
                          size="sm"
                        >
                          <Plus size={16} className="mr-2" />
                          View Details
                        </Button>
                      </div>
                    ))}
                </div>

                {/* Navigation arrows */}
                <div className="flex justify-center mt-4 sm:mt-8 gap-4">
                  <Button
                    variant="outline"
                    onClick={showPrev}
                    disabled={currentIndex === 0}
                    className={`border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] ${
                      currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={showNext}
                    disabled={
                      currentIndex >= flavorPods.length - getPodsPerPage()
                    }
                    className={`border-[#D6D6D6] text-[#D6D6D6] bg-[#292929] hover:border-[#02ECCF] hover:text-[#02ECCF] hover:bg-[#292929] ${
                      currentIndex >= flavorPods.length - getPodsPerPage()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
