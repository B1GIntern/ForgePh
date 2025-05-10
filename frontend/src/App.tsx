import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Components
import Layout from "./components/Layout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import ApiTest from "./components/ApiTest"; // Import our API test component
import VerifiedUserRoute from "./components/VerifiedUserRoute"; // Import the new component
import RetailerVerifiedUserRoute from './components/RetailerVerifiedUserRoute';
import StayOnHomeRoute from './components/StayOnHomeRoute';

// Pages
import RetailersLanding from "./pages/RetailersLanding";
import RetailerRegistration from "./pages/RetailerRegistration";
import ExclusiveNews from "./pages/ExclusiveNews";  // Import ExclusiveNews for retailers
import News from "./pages/News";
import Products from "./pages/Products";
import AgeVerification from "./pages/AgeVerification";
import AgeRestricted from "./pages/AgeRestricted";
import Rewards from "./pages/Rewards";
import PromoCode from "./pages/PromoCode";  // Import PromoCode Page
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AccountSettings from "./pages/AccountSettings";
import VerificationSuccess from "./pages/VerificationSucess";
import VerificationFailed from "./pages/VerificationFailed";
import ShopsLeaderboard from "./pages/ShopsLeaderboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { NotificationsProvider } from "./context/NotificationsContext";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

// Custom hook to enforce age verification
const useAgeVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check on mount and whenever the component re-renders
    const checkVerification = () => {
      const verified = localStorage.getItem("ageVerified") === "true";
      setIsVerified(verified);
      setIsLoading(false);
    };
    
    checkVerification();
    
    // Also listen for storage changes (in case another tab updates it)
    const handleStorageChange = () => {
      checkVerification();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  return { isVerified, isLoading };
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isVerified, isLoading } = useAgeVerification();
  const location = useLocation();
  const notificationShownRef = useRef(false);
  
  useEffect(() => {
    // Only show notification once per session when redirected from a protected page
    if (!isLoading && !isVerified && !notificationShownRef.current && location.pathname !== "/") {
      notificationShownRef.current = true;
      toast.error("Age verification required", {
        description: "You must verify your age before accessing this content",
        duration: 5000,
      });
    }
  }, [isVerified, isLoading, location.pathname]);

  // Show nothing during initial check
  if (isLoading) {
    return null;
  }
  
  // If not verified, redirect to the age verification page
  if (!isVerified) {
    // Pass the attempted URL in state to potentially redirect back after verification
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Wrap the entire app with a route protection component
const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isVerified, isLoading } = useAgeVerification();
  const location = useLocation();
  
  // No verification needed for these paths
  const publicPaths = ["/", "/age-restricted", "/verification-failed", "/verification-success", "/forgot-password", "/reset-password", "/api-test", "/admin"];
  
  const isPublicPath = publicPaths.some(path => 
    location.pathname === path || location.pathname.startsWith("/admin")
  );
  
  // If on a public path or still loading, just render
  if (isPublicPath || isLoading) {
    return <>{children}</>;
  }
  
  // For any other path, verify age
  if (!isVerified) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <RouteGuard>
              <StayOnHomeRoute>
                <Routes>
                  <Route path="/" element={<AgeVerification />} />
                  <Route path="/age-restricted" element={<AgeRestricted />} />
                  <Route path="/verification-failed" element={<VerificationFailed />} />
                  <Route path="/verification-success" element={<VerificationSuccess />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* API test route - no age verification needed */}
                  <Route path="/api-test" element={<ApiTest />} />

                  {/* Protected Routes */}
                  <Route
                    path="/home"
                    element={
                      <Layout>
                        <Index />
                      </Layout>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <VerifiedUserRoute>
                        <Layout>
                          <Products />
                        </Layout>
                      </VerifiedUserRoute>
                    }
                  />
                 
                  {/* Routes requiring user verification */}
                  <Route
                    path="/promo-code"
                    element={
                      <VerifiedUserRoute>
                        <Layout>
                          <PromoCode />  
                        </Layout>
                      </VerifiedUserRoute>
                    }
                  />
                  <Route
                    path="/rewards"
                    element={
                      <VerifiedUserRoute>
                        <Layout>
                          <Rewards />  
                        </Layout>
                      </VerifiedUserRoute>
                    }
                  />
                  <Route
                    path="/news"
                    element={
                      <Layout>
                        <News />  
                      </Layout>
                    }
                  />
                  
                  <Route
                    path="/profile"
                    element={
                      <Layout>
                        <AccountSettings />  
                      </Layout>
                    }
                  />
                  {/* Retailer Routes */}
                  <Route
                    path="/retailers"
                    element={
                      <RetailerVerifiedUserRoute>
                        <Layout>
                          <RetailersLanding />
                        </Layout>
                      </RetailerVerifiedUserRoute>
                    }
                  />
                  <Route
                    path="/retailer-registration"
                    element={
                      <Layout>
                        <RetailerRegistration />
                      </Layout>
                    }
                  />
                  <Route
                    path="/ExclusiveNews"
                    element={
                      <Layout>
                        <ExclusiveNews />
                      </Layout>
                    }
                  />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } />
                    
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </StayOnHomeRoute>
            </RouteGuard>
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;