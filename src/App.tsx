import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Wins from "./pages/Wins";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import AppLayout from "./components/layout/AppLayout";
import LotDetails from "./pages/LotDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lot/:id" element={<LotDetails />} />
        
        {/* Rotas do App com Layout */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/app/wins" element={<AppLayout><Wins /></AppLayout>} />
        <Route path="/app/favorites" element={<AppLayout><Favorites /></AppLayout>} />
        <Route path="/app/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        
        {/* Rota Admin */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;