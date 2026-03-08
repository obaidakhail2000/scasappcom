import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Reviews from "@/pages/Reviews";
import Marketing from "@/pages/Marketing";
import QRCodes from "@/pages/QRCodes";
import Campaigns from "@/pages/Campaigns";
import Menu from "@/pages/Menu";
import Customers from "@/pages/Customers";
import Rewards from "@/pages/Rewards";
import Posters from "@/pages/Posters";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/qr-codes" element={<QRCodes />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/posters" element={<Posters />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
