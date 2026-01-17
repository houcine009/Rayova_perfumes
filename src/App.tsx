import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Boutique from "./pages/Boutique";
import CategoryPage from "./pages/CategoryPage";
import APropos from "./pages/APropos";
import Auth from "./pages/Auth";
import Panier from "./pages/Panier";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/boutique" element={<Boutique />} />
              <Route path="/categorie/:slug" element={<CategoryPage />} />
              <Route path="/a-propos" element={<APropos />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/panier" element={<Panier />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/produit/:slug" element={<ProductDetails />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminHome />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="avis" element={<AdminReviews />} />
                <Route path="utilisateurs" element={<AdminUsers />} />
                <Route path="parametres" element={<AdminSettings />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
