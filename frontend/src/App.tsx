import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Products from "./pages/Products";
import AgeVerification from "./pages/AgeVerification";
import AgeRestricted from "./pages/AgeRestricted";
import Rewards from "./pages/Rewards";  {/* Import Rewards Page */}
import AccountSettings from "./pages/AccountSettings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { NotificationsProvider } from "./context/NotificationsContext";  // Import NotificationsProvider
import News from "./pages/News";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isVerified = localStorage.getItem("ageVerified") === "true";
  return isVerified ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationsProvider>  {/* Wrap the app with NotificationsProvider */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AgeVerification />} />
            <Route path="/age-restricted" element={<AgeRestricted />} />

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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
