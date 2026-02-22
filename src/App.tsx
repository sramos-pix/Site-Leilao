import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import LotDetail from "./pages/LotDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/app/Dashboard";
import Profile from "./pages/app/Profile";
import Favorites from "./pages/app/Favorites";
import History from "./pages/app/History";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import AdminCreateLot from "./pages/AdminCreateLot";
import Checkout from "./pages/Checkout";
import Verify from "./pages/app/Verify";
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import Vehicles from "./pages/Vehicles";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import { OnlinePresenceTracker } from "./components/OnlinePresenceTracker";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <OnlinePresenceTracker />
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:id" element={<AuctionDetails />} />
            <Route path="/lots/:id" element={<LotDetail />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* App / User Routes */}
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/profile" element={<Profile />} />
            <Route path="/app/favorites" element={<Favorites />} />
            <Route path="/app/wins" element={<History />} />
            <Route path="/app/notifications" element={<Notifications />} />
            <Route path="/app/checkout/:id" element={<Checkout />} />
            <Route path="/app/verify" element={<Verify />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/lots/create" element={<AdminCreateLot />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;