import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import SupportChatWidget from "@/components/SupportChatWidget";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import { OnlinePresenceTracker } from "./components/OnlinePresenceTracker";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import AdminGuard from "./components/admin/AdminGuard";
import { Loader2 } from "lucide-react";

// Páginas públicas — carregadas sob demanda
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Auctions = lazy(() => import("./pages/Auctions"));
const AuctionDetails = lazy(() => import("./pages/AuctionDetails"));
const LotDetail = lazy(() => import("./pages/LotDetail"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));

// Área do usuário
const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Profile = lazy(() => import("./pages/app/Profile"));
const Favorites = lazy(() => import("./pages/app/Favorites"));
const History = lazy(() => import("./pages/app/History"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Verify = lazy(() => import("./pages/app/Verify"));

// Área admin (carregada só para admins)
const Admin = lazy(() => import("./pages/Admin"));
const AdminCreateLot = lazy(() => import("./pages/AdminCreateLot"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <MaintenanceGuard>
            <OnlinePresenceTracker />
            <Toaster />
            <SupportChatWidget />
            <WhatsAppWidget />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/faq" element={<FAQ />} />

                {/* App / User Routes */}
                <Route path="/app/dashboard" element={<Dashboard />} />
                <Route path="/app/profile" element={<Profile />} />
                <Route path="/app/favorites" element={<Favorites />} />
                <Route path="/app/wins" element={<History />} />
                <Route path="/app/notifications" element={<Notifications />} />
                <Route path="/app/checkout/:id" element={<Checkout />} />
                <Route path="/app/verify" element={<Verify />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
                <Route path="/admin/lots/create" element={<AdminGuard><AdminCreateLot /></AdminGuard>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </MaintenanceGuard>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;