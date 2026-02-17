import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

// Páginas Públicas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import LotDetail from "./pages/LotDetail";
import Vehicles from "./pages/Vehicles";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";

// Páginas do Aplicativo (Logado)
import Dashboard from "./pages/app/Dashboard";
import Profile from "./pages/app/Profile";
import History from "./pages/app/History";
import Favorites from "./pages/app/Favorites";
import Notifications from "./pages/Notifications";
import Verify from "./pages/app/Verify";
import Checkout from "./pages/Checkout";

// Admin
import Admin from "./pages/Admin";

// Layouts e Componentes
import AppLayout from "./components/layout/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ScrollToTop />
      <Toaster />
      <Sonner />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetails />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Rotas do App (Área do Cliente) */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/app/favorites" element={<Favorites />} />
        <Route path="/app/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        <Route path="/app/verify" element={<Verify />} />
        <Route path="/app/checkout/:id" element={<Checkout />} />
        
        {/* Rota Admin */}
        <Route path="/admin" element={<Admin />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;