import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
import AdminPermissionGate from "./components/admin/AdminPermissionGate";

const Index = lazy(() => import("./pages/Index"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const WarrantyPage = lazy(() => import("./pages/WarrantyPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CustomerAccountPage = lazy(() => import("./pages/CustomerAccountPage"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminIndex = lazy(() => import("./pages/admin/AdminIndex"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/admin/SuperAdminDashboard"));
const AdminUserManagement = lazy(() => import("./pages/admin/AdminUserManagement"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const InventoryDashboard = lazy(() => import("./pages/admin/InventoryDashboard"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminProductDetail = lazy(() => import("./pages/admin/AdminProductDetail"));
const AdminPos = lazy(() => import("./pages/admin/AdminPos"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminQuotationCreate = lazy(() => import("./pages/admin/AdminQuotationCreate"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogForm = lazy(() => import("./pages/admin/AdminBlogForm"));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminContactMessages"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/AdminCustomerDetail"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminChangePassword = lazy(() => import("./pages/admin/AdminChangePassword"));
const FinanceReportDashboard = lazy(() => import("./pages/admin/FinanceReportDashboard"));
const AdminExpenses = lazy(() => import("./pages/admin/AdminExpenses"));
const AdminSources = lazy(() => import("./pages/admin/AdminSources"));
const AdminSourcingPayments = lazy(() => import("./pages/admin/AdminSourcingPayments"));
const AdminSourcingPaymentDetail = lazy(() => import("./pages/admin/AdminSourcingPaymentDetail"));
const AdminDatabaseMigrations = lazy(() => import("./pages/admin/AdminDatabaseMigrations"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-sm text-muted-foreground">
    Loading page...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <AuthProvider>
            <CustomerAuthProvider>
              <CartProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/warranty" element={<WarrantyPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/account" element={<CustomerAccountPage />} />

                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminIndex />} />
                      <Route path="dashboard" element={<AdminPermissionGate permission={["dashboard:view", "dashboard:view_product_stats", "dashboard:view_finance", "dashboard:view_inquiries", "dashboard:view_orders"]}><AdminDashboard /></AdminPermissionGate>} />
                      <Route path="super-admin" element={<AdminPermissionGate permission="super_admin:view"><SuperAdminDashboard /></AdminPermissionGate>} />
                      <Route path="admin-users" element={<AdminPermissionGate permission="admin_users:manage"><AdminUserManagement /></AdminPermissionGate>} />
                      <Route path="products" element={<AdminPermissionGate permission="products:view"><AdminProducts /></AdminPermissionGate>} />
                      <Route path="inventory" element={<AdminPermissionGate permission={["inventory:view", "inventory:view_overview", "inventory:view_metrics", "inventory:view_stock_health", "inventory:view_categories", "inventory:view_movements", "inventory:view_product_flow", "inventory:view_action_lists"]}><InventoryDashboard /></AdminPermissionGate>} />
                      <Route path="products/new" element={<AdminPermissionGate permission="products:create"><AdminProductForm /></AdminPermissionGate>} />
                      <Route path="products/:id" element={<AdminPermissionGate permission="products:view"><AdminProductDetail /></AdminPermissionGate>} />
                      <Route path="products/:id/edit" element={<AdminPermissionGate permission={["products:edit", "products:edit_basic", "products:edit_serials", "products:edit_pricing_stock", "products:edit_sources", "products:edit_images"]}><AdminProductForm /></AdminPermissionGate>} />
                      <Route path="pos" element={<AdminPermissionGate permission="pos:use"><AdminPos /></AdminPermissionGate>} />
                      <Route path="orders" element={<AdminPermissionGate permission="orders:view"><AdminOrders /></AdminPermissionGate>} />
                      <Route path="orders/:id" element={<AdminPermissionGate permission="orders:view"><AdminOrderDetail /></AdminPermissionGate>} />
                      <Route path="quotations/new" element={<AdminPermissionGate permission="orders:view"><AdminQuotationCreate /></AdminPermissionGate>} />
                      <Route path="categories" element={<AdminPermissionGate permission="catalog:view"><AdminCategories /></AdminPermissionGate>} />
                      <Route path="blog" element={<AdminPermissionGate permission="blog:view"><AdminBlog /></AdminPermissionGate>} />
                      <Route path="blog/new" element={<AdminPermissionGate permission="blog:manage"><AdminBlogForm /></AdminPermissionGate>} />
                      <Route path="blog/:id" element={<AdminPermissionGate permission="blog:manage"><AdminBlogForm /></AdminPermissionGate>} />
                      <Route path="messages" element={<AdminPermissionGate permission="messages:view"><AdminContactMessages /></AdminPermissionGate>} />
                      <Route path="newsletter" element={<AdminPermissionGate permission="newsletter:view"><AdminNewsletter /></AdminPermissionGate>} />
                      <Route path="customers" element={<AdminPermissionGate permission="customers:view"><AdminCustomers /></AdminPermissionGate>} />
                      <Route path="customers/:id" element={<AdminPermissionGate permission="customers:view"><AdminCustomerDetail /></AdminPermissionGate>} />
                      <Route path="analytics" element={<AdminPermissionGate permission="analytics:view"><AdminAnalytics /></AdminPermissionGate>} />
                      <Route path="finance" element={<AdminPermissionGate permission="finance:view"><FinanceReportDashboard /></AdminPermissionGate>} />
                      <Route path="expenses" element={<AdminPermissionGate permission="expenses:view"><AdminExpenses /></AdminPermissionGate>} />
                      <Route path="sources" element={<AdminPermissionGate permission="sources:view"><AdminSources /></AdminPermissionGate>} />
                      <Route path="sourcing-payments" element={<AdminPermissionGate permission="sourcing_payments:view"><AdminSourcingPayments /></AdminPermissionGate>} />
                      <Route path="sourcing-payments/:id" element={<AdminPermissionGate permission="sourcing_payments:view"><AdminSourcingPaymentDetail /></AdminPermissionGate>} />
                      <Route path="database-migrations" element={<AdminPermissionGate permission="super_admin:view"><AdminDatabaseMigrations /></AdminPermissionGate>} />
                      <Route path="password" element={<AdminChangePassword />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </CartProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
