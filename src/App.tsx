import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { PageTransition } from "@/components/PageTransition";
import { I18nProvider } from "@/hooks/use-i18n";
import { CartProvider } from "@/hooks/use-cart-context";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import PromotionsAdmin from "./pages/admin/PromotionsAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import SiteEditor from "./pages/admin/SiteEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: { retry: 1 },
  },
});

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function AppRoutes() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header onCartOpen={() => setCartOpen(true)} />
        <main className="flex-1">
          <AnimatedRoutes>
            <Route path="/" data-genie-title="Home" data-genie-key="Home" element={<PageTransition transition="slide-up"><Index /></PageTransition>} />
            <Route path="/products" data-genie-title="Products" data-genie-key="Products" element={<PageTransition transition="fade"><Products /></PageTransition>} />
            <Route path="/products/:id" data-genie-title="Product Detail" data-genie-key="ProductDetail" element={<PageTransition transition="fade"><ProductDetail /></PageTransition>} />
            <Route path="/checkout" data-genie-title="Checkout" data-genie-key="Checkout" element={<PageTransition transition="slide-up"><Checkout /></PageTransition>} />
            <Route path="/order-success" data-genie-title="Order Success" data-genie-key="OrderSuccess" element={<PageTransition transition="scale"><OrderSuccess /></PageTransition>} />
            <Route path="/login" data-genie-title="Login" data-genie-key="Login" element={<PageTransition transition="fade"><Login /></PageTransition>} />
            <Route path="/admin" data-genie-title="Admin Dashboard" data-genie-key="AdminDashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/products" data-genie-title="Admin Products" data-genie-key="AdminProducts" element={<AdminRoute><ProductsAdmin /></AdminRoute>} />
            <Route path="/admin/categories" data-genie-title="Admin Categories" data-genie-key="AdminCategories" element={<AdminRoute><CategoriesAdmin /></AdminRoute>} />
            <Route path="/admin/promotions" data-genie-title="Admin Promotions" data-genie-key="AdminPromotions" element={<AdminRoute><PromotionsAdmin /></AdminRoute>} />
            <Route path="/admin/orders" data-genie-title="Admin Orders" data-genie-key="AdminOrders" element={<AdminRoute><OrdersAdmin /></AdminRoute>} />
            <Route path="/admin/site" data-genie-title="Admin Site Editor" data-genie-key="AdminSite" element={<AdminRoute><SiteEditor /></AdminRoute>} />
            <Route path="*" data-genie-key="NotFound" data-genie-title="Not Found" element={<PageTransition transition="fade"><NotFound /></PageTransition>} />
          </AnimatedRoutes>
        </main>
        <Footer />
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <CartProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <AppRoutes />
            </TooltipProvider>
          </AuthProvider>
        </CartProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
