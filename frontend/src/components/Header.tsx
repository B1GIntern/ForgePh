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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Award, 
  Settings,
  AlertTriangle,
  UserCircle
} from "lucide-react";

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
      // Update storage to ensure consistency
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(user));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(user));
      }
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
        // { path: "/shops-leaderboard", label: "Shops Leaderboard" },
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
    // consumerLinks.push({ path: "/shops-leaderboard", label: "Shops Leaderboard" });

    return consumerLinks;
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20"
            : "py-5 bg-transparent"
        }`}
      >
        {/* Government Warning Section */}
        <div className="flex items-center bg-white/5 text-white/80 rounded-full px-3 py-1 text-[10px] sm:text-xs w-fit mx-auto mb-4 backdrop-blur-sm border border-white/10">
          <div className="bg-amber-500/80 text-black font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            18+
          </div>
          <p className="ml-2 leading-tight">
            <span className="font-bold">GOVERNMENT WARNING:</span> THIS IS
            HARMFUL AND CONTAINS NICOTINE WHICH IS A HIGHLY ADDICTIVE SUBSTANCE.
            THIS IS FOR USE ONLY BY ADULTS AND IS NOT RECOMMENDED FOR USE BY
            NON-SMOKERS.
          </p>
        </div>
        
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/home" className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">FORGE</span>
              <span className="text-white"> PHILIPPINES</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  isLinkActive(link.path) 
                    ? "text-emerald-400" 
                    : "text-white/80 hover:text-white"
                } ${
                  link.readonly ? "opacity-70 cursor-not-allowed" : ""
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
                  <span className="ml-1 text-xs text-amber-400">
                    (Verify)
                  </span>
                )}
                {isLinkActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Login/Sign Up Buttons or User Profile */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-black/30 backdrop-blur-sm text-emerald-400 px-3 py-1.5 rounded-full text-sm flex items-center border border-emerald-500/20">
                <Award className="w-4 h-4 mr-1.5" />
                <span>{user.points.toLocaleString()} Points</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors duration-200">
                    <span>My Account</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#121520] border border-white/10 text-white w-48 rounded-lg shadow-xl shadow-black/50">
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-emerald-400 cursor-pointer">
                    <Link to="/profile" className="flex w-full items-center">
                      <UserCircle className="w-4 h-4 mr-2 text-emerald-400" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="focus:bg-white/5 focus:text-red-400 cursor-pointer"
                    onClick={openLogoutDialog}
                  >
                    <LogOut className="w-4 h-4 mr-2 text-red-400" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden space-x-4 md:flex">
              <a
                href="#login"
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors duration-200"
                onClick={openLoginModal}
              >
                Login
              </a>
              <a 
                href="/home#register" 
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-medium hover:opacity-90 transition-opacity"
              >
                Sign Up
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="p-2 md:hidden flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-emerald-400" />
            ) : (
              <Menu className="w-6 h-6 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-40 flex flex-col pt-24 pb-8 md:hidden bg-[#0A0D14]/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
          }`}
        >
          {user && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black text-xl font-bold mb-3">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''}
              </div>
              <p className="text-white text-lg font-medium">{user.name}</p>
              <div className="bg-black/30 backdrop-blur-sm text-emerald-400 px-3 py-1.5 rounded-full text-sm flex items-center justify-center w-fit mx-auto mt-2 border border-emerald-500/20">
                <Award className="w-4 h-4 mr-1.5" />
                <span>{currentPoints.toLocaleString()} Points</span>
              </div>
            </div>
          )}

          <nav className="flex flex-col items-center space-y-5 text-base">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 font-medium transition-colors duration-200 ${
                  isLinkActive(link.path) 
                    ? "text-emerald-400" 
                    : "text-white/80 hover:text-white"
                } ${
                  link.readonly ? "opacity-70 cursor-not-allowed" : ""
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
                  <span className="ml-1 text-xs text-amber-400">
                    (Verify)
                  </span>
                )}
              </Link>
            ))}
            {user && (
              <Link
                to="/profile"
                className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Link>
            )}
          </nav>

          <div className="flex flex-col items-center mt-10 space-y-4 px-4">
            {user ? (
              <button
                onClick={openLogoutDialog}
                className="w-full py-2.5 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            ) : (
              <>
                <a
                  href="#login"
                  className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors duration-200 text-center"
                  onClick={openLoginModal}
                >
                  Login
                </a>
                <a
                  href="#register"
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-medium hover:opacity-90 transition-opacity text-center"
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
        <AlertDialogContent className="bg-[#121520] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out of Your Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;
