import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Reviews from "@/pages/Reviews";
import Marketing from "@/pages/Marketing";
import Campaigns from "@/pages/Campaigns";
import Menu from "@/pages/Menu";
import Customers from "@/pages/Customers";
import Rewards from "@/pages/Rewards";
import Posters from "@/pages/Posters";
import AIAssistant from "@/pages/AIAssistant";
import Analytics from "@/pages/Analytics";
import Tables from "@/pages/Tables";
import PrivateFeedback from "@/pages/PrivateFeedback";
import Settings from "@/pages/Settings";
import CustomerReview from "@/pages/CustomerReview";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/review" element={<CustomerReview />} />

          {/* Auth routes */}
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/login" element={<AuthRoute />} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/posters" element={<Posters />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/private-feedback" element={<PrivateFeedback />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/qr-codes" element={<Tables />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
