import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginModal from "./LoginModal";

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const checkUserAuth = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    checkUserAuth();

    // Set up event listener for storage changes (in case user logs in from another tab)
    window.addEventListener("storage", checkUserAuth);

    // Custom event listener for user login/logout
    const handleAuthChange = () => checkUserAuth();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkUserAuth);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const openLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear user data from storage
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
    
    // Refresh the page to reset state seamlessly
    window.location.reload();

    // Dispatch event to notify other components
    window.dispatchEvent(new Event("authChange"));
  };

  // Function to determine if a link is active
  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-xforge-dark bg-opacity-80 backdrop-blur shadow-md"
            : "py-5 bg-transparent"
        }`}
      >
        {/* Government Warning Section */}
        <div className="flex items-center bg-[#E5E5E5] text-[#333] rounded-full px-3 py-1 text-[10px] sm:text-xs w-fit mx-auto mb-4">
          <div className="bg-[#D6D6D6] text-[#333] font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
            18+
          </div>
          <p className="ml-2 leading-tight">
            <span className="font-bold">GOVERNMENT WARNING:</span> THIS IS
            HARMFUL AND CONTAINS NICOTINE WHICH IS A HIGHLY ADDICTIVE SUBSTANCE.
            THIS IS FOR USE ONLY BY ADULTS AND IS NOT RECOMMENDED FOR USE BY
            NON-SMOKERS.
          </p>
        </div>
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/home" className="text-2xl font-bold text-white">
              <span className="text-teal-400">FORGE</span> PHILIPPINES
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            <Link
              to="/home"
              className={`nav-link ${isLinkActive("/home") ? "text-xforge-teal" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`nav-link ${isLinkActive("/products") ? "text-xforge-teal" : ""}`}
            >
              Products
            </Link>
              <Link
                to="/news"
                className={`nav-link ${isLinkActive("/news") ? "text-xforge-teal" : ""}`}
              >
                News
              </Link>
            
            {user && (
              <Link
                to="/rewards"
                className={`nav-link ${isLinkActive("/rewards") ? "text-xforge-teal" : ""}`}
              >
                Rewards
              </Link>
            )}
            {user && (
              <Link
                to="/promo-code"
                className={`nav-link ${isLinkActive("/promo-code") ? "text-xforge-teal" : ""}`}
              >
                Promo Code
              </Link>
            )}
          </nav>

          {/* Login/Sign Up Buttons or User Profile */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-white">
                Welcome,{" "}
                <span className="text-xforge-teal font-medium">
                  {user.name}
                </span>
              </div>
              <div className="bg-xforge-teal bg-opacity-20 text-xforge-teal px-3 py-1 rounded-full text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>{user.points} Points</span>
              </div>
              <div className="relative group">
                <button className="btn btn-outline flex items-center">
                  My Account
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 w-48 mt-2 bg-xforge-dark border border-xforge-lightgray rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-white hover:bg-xforge-lightgray hover:text-xforge-teal"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-white hover:bg-xforge-lightgray hover:text-xforge-teal"
                    >
                      Orders
                    </Link>
                    <div className="border-t border-xforge-lightgray my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-xforge-lightgray hover:text-xforge-teal"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden space-x-4 md:flex">
              <a
                href="#login"
                className="btn btn-outline"
                onClick={openLoginModal}
              >
                Login
              </a>
              <a href="#register" className="btn btn-primary">
                Sign Up
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="p-2 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="space-y-2">
              <span
                className={`block w-8 h-0.5 bg-xforge-teal transition-all duration-300 ${isMobileMenuOpen ? "translate-y-2.5 rotate-45" : ""}`}
              ></span>
              <span
                className={`block w-8 h-0.5 bg-xforge-teal transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`block w-8 h-0.5 bg-xforge-teal transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-2.5 -rotate-45" : ""}`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-40 flex flex-col pt-24 pb-8 md:hidden bg-xforge-dark bg-opacity-95 backdrop-blur transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {user && (
            <div className="text-center text-white mb-6">
              <p>Welcome,</p>
              <p className="text-xforge-teal font-medium text-lg">
                {user.name}
              </p>
            </div>
          )}

          <nav className="flex flex-col items-center space-y-6 text-lg">
            <Link
              to="/home"
              className={`nav-link ${isLinkActive("/home") ? "text-xforge-teal" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`nav-link ${isLinkActive("/products") ? "text-xforge-teal" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/news"
              className={`nav-link ${isLinkActive("/news") ? "text-xforge-teal" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              News
            </Link>

            <Link
              to="/rewards"
              className={`nav-link ${isLinkActive("/rewards") ? "text-xforge-teal" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rewards
            </Link>

            <Link
              to="/promo-code"
              className={`nav-link ${isLinkActive("/promo-code") ? "text-xforge-teal" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Promo Code
            </Link>
            

            {user && (
              <>
                <Link
                  to="/profile"
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              </>
            )}
          </nav>

          <div className="flex flex-col items-center mt-10 space-y-4">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="btn btn-outline w-44 text-center"
              >
                Logout
              </button>
            ) : (
              <>
                <a
                  href="#login"
                  className="btn btn-outline w-44 text-center"
                  onClick={openLoginModal}
                >
                  Login
                </a>
                <a
                  href="#register"
                  className="btn btn-primary w-44 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
