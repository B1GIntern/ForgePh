import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginModal from "./LoginModal";
import io from "socket.io-client"; // Make sure to import socket.io-client
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Define a type for navigation links
interface NavLink {
  path: string;
  label: string;
  readonly?: boolean; // Make readonly optional
}
// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  points: number;
  userStatus: string; // Add this field to track verification status
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0); 
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const location = useLocation();

  // Enhanced user data loading that also fetches fresh user data from the API
  const fetchUserData = async () => {
    try {
      // Get auth token from storage
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        return;
      }

      // Get basic user data from storage first to display something quickly
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setCurrentPoints(parsedUser.points || 0);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }

      // Then, fetch fresh user data from the server
      const response = await fetch("http://localhost:5001/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();

      // Create a proper user object with the correct structure
        const fullUser: User = {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          userType: userData.userType,
          points: userData.points,
          userStatus: userData.userStatus || "Not Verified", // Add with default fallback
        };

      // Update state with fresh user data
      setUser(fullUser);
      setCurrentPoints(fullUser.points);

      // Update localStorage/sessionStorage with fresh data
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(fullUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(fullUser));
      }

      window.dispatchEvent(new Event("authChange"));

      console.log("Updated user data from server:", fullUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Call this function when the component mounts and after redeeming rewards
  useEffect(() => {
    fetchUserData();

    window.addEventListener("storage", fetchUserData);

    return () => {
      window.removeEventListener("storage", fetchUserData);
    };
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      fetchUserData(); // Re-fetch user data to update the header
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  // Update state whenever user object changes
  useEffect(() => {
    if (user) {
      setCurrentPoints(user.points);
    }
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    // Connect to the socket server
    const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");

    // Listen for point updates
    socket.on("pointsUpdated", (data) => {
      if (user && data.userId === user.id) {
        // Update local user data with new points
        updateUserPoints(data.points);
      }
    });

    // Listen for reward redemption events
    socket.on("rewardRedeemed", (data) => {
      if (user && data.userId === user.id) {
        // Fetch updated user data to reflect new points balance
        refreshUserData();
      }
    });

    return () => {
      // Disconnect socket when component unmounts
      socket.disconnect();
    };
  }, [user]); // Re-establish connection when user changes

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      // Create updated user object
      const updatedUser = { ...user, points: newPoints };

      // Update local state
      setUser(updatedUser);

      // Update storage
      const storage = localStorage.getItem("user")
        ? localStorage
        : sessionStorage;
      storage.setItem("user", JSON.stringify(updatedUser));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("authChange"));
    }
  };

  const refreshUserData = async () => {
    if (!user) return;

    try {
      // Fetch fresh user data from API
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();

        // Update user in state and storage
        setUser(userData);

        // Update storage based on where the user was originally stored
        const storage = localStorage.getItem("user")
          ? localStorage
          : sessionStorage;
        storage.setItem("user", JSON.stringify(userData));

        // Notify other components
        window.dispatchEvent(new Event("authChange"));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

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

  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogout = () => {
    // Clear user data from storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setIsLogoutDialogOpen(false);

    // Dispatch event to notify other components
    window.dispatchEvent(new Event("authChange"));

    // Redirect to home page
    window.location.href = "/home";
  };

  // Function to determine if a link is active
  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

      // Determine navigation links based on user type
    const getNavLinks = (): NavLink[] => {
      if (!user) {
        // Default links for non-logged in users
        return [
          { path: "/home", label: "Home" },
          { path: "/products", label: "Products" },
          { path: "/news", label: "News" },
        ];
      }

      if (user.userType === "Retailer") {
        // Links for Retailer users
        return [
          { path: "/retailers", label: "Home" },
          { path: "/products", label: "Products" },
          { path: "/ExclusiveNews", label: "News" },
          { path: "/shops-leaderboard", label: "Shops Leaderboard" },
        ];
      }

      // Links for Consumer users (default)
      const consumerLinks: NavLink[] = [
        { path: "/home", label: "Home" },
        { path: "/products", label: "Products" },
        { path: "/news", label: "News" },
      ];

      // Add rewards and promo code links with appropriate behavior based on verification status
      if (user.userStatus === "Verified") {
        // Fully functional links for verified users
        consumerLinks.push(
          { path: "/rewards", label: "Rewards" },
          { path: "/promo-code", label: "Promo Code" }
        );
      } else {
        // Read-only links for unverified users
        consumerLinks.push(
          { path: "#", label: "Rewards", readonly: true },
          { path: "#", label: "Promo Code", readonly: true }
        );
      }

      // Add the shop leaderboard link that's available to all consumers
      consumerLinks.push({ path: "/shops-leaderboard", label: "Shops Leaderboard" });

      return consumerLinks;
    };

  const navLinks = getNavLinks();

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
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isLinkActive(link.path) ? "text-xforge-teal" : ""} ${
                    link.readonly ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => {
                    if (link.readonly) {
                      e.preventDefault();
                      alert("Your account needs to be verified to access this feature");
                    }
                  }}
                >
                  {link.label}
                  {link.readonly && (
                    <span className="ml-1 text-xs text-yellow-400">
                      (Verify)
                    </span>
                  )}
                </Link>
              ))}
            </nav>

          {/* Login/Sign Up Buttons or User Profile */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* <div className="text-white">
                Welcome,{" "}
                <span className="text-xforge-teal font-medium">
                  {user.name}
                </span>
              </div> */}
              <div className="bg-xforge-teal bg-opacity-20 text-xforge-teal px-3 py-1 rounded-full text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>{user.points.toLocaleString()} Points</span>
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
                    <div className="border-t border-xforge-lightgray my-1"></div>
                    <button
                      onClick={openLogoutDialog}
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
              <a href="/home#register" className="btn btn-primary">
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
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white text-3xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            &times;
          </button>

          {user && (
            <div className="text-center text-white mb-6">
              {/* <p>Welcome,</p>
              <p className="text-xforge-teal font-medium text-lg">
                {user.name}
              </p> */}
              <div className="bg-xforge-teal bg-opacity-20 text-xforge-teal px-3 py-1 rounded-full text-sm flex items-center justify-center mx-auto mt-2 w-fit">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>{currentPoints} Points</span>
              </div>
            </div>
          )}

          <nav className="flex flex-col items-center space-y-6 text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isLinkActive(link.path) ? "text-xforge-teal" : ""} ${
                  link.readonly ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={(e) => {
                  if (link.readonly) {
                    e.preventDefault();
                    alert("Your account needs to be verified to access this feature");
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
              >
                {link.label}
                {link.readonly && (
                  <span className="ml-1 text-xs text-yellow-400">
                    (Verify)
                  </span>
                )}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/profile"
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              </>
            )}
          </nav>

          <div className="flex flex-col items-center mt-10 space-y-4">
            {user ? (
              <button
                onClick={openLogoutDialog}
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

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent className="bg-xforge-dark border border-xforge-teal/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-xforge-gray">
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-xforge-darkgray text-white border-xforge-gray hover:bg-xforge-darkgray/80 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-xforge-teal text-xforge-dark hover:bg-xforge-teal/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;
