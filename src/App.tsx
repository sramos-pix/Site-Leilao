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

// Importações com tratamento de erro para o carregamento dinâmico
const lazyRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Erro ao carregar componente, tentando recarregar a página...", error);
      window.location.reload();
      return { default: () => null };
    }
  });
};

// Páginas públicas
const Index = lazyRetry(() => import("./pages/Index"));
const Login = lazyRetry(() => import("./pages/Login"));
const Register = lazyRetry(() => import("./pages/Register"));
const Auctions = lazyRetry(() => import("./pages/Auctions"));
const AuctionDetails = lazyRetry(() => import("./pages/AuctionDetails"));
const LotDetail = lazyRetry(() => import("./pages/LotDetail"));
const Vehicles = lazyRetry(() => import("./pages/Vehicles"));
const HowItWorks = lazyRetry(() => import("./pages/HowItWorks"));
const Contact = lazyRetry(() => import("./pages/Contact"));
const FAQ = lazyRetry(() => import("./pages/FAQ"));

// Área do usuário
const Dashboard = lazyRetry(() => import("./pages/app/Dashboard"));
const Profile = lazyRetry(() => import("./pages/app/Profile"));
const Favorites = lazyRetry(() => import("./pages/app/Favorites"));
const History = lazyRetry(() => import("./pages/app/History"));
const Notifications = lazyRetry(() => import("./pages/Notifications"));
const Checkout = lazyRetry(() => import("./pages/Checkout"));
const Verify = lazyRetry(() => import("./pages/app/Verify"));

// Área admin
const Admin = lazyRetry(() => import("./pages/Admin"));
const AdminCreateLot = lazyRetry(() => import("./pages/AdminCreateLot"));

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