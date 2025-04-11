import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components
import Layout from "./components/Layout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";


// Pages
import RetailersLanding from "./pages/RetailersLanding";
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

import { NotificationsProvider } from "./context/NotificationsContext";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isVerified = localStorage.getItem("ageVerified") === "true";
  return isVerified ? <>{children}</> : <Navigate to="/" replace />;
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
          <Routes>
            <Route path="/" element={<AgeVerification />} />
            <Route path="/age-restricted" element={<AgeRestricted />} />
            <Route path="/verification-failed" element={<VerificationFailed />} />
            <Route path="/verification-success" element={<VerificationSuccess />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              }
            />
           
            <Route
              path="/promo-code"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PromoCode />  
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Rewards />  
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <Layout>
                    <News />  
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shops-leaderboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ShopsLeaderboard />  
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AccountSettings />  
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Retailer Routes */}
            <Route
              path="/retailers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RetailersLanding />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ExclusiveNews"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExclusiveNews />
                  </Layout>
                </ProtectedRoute>
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
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;