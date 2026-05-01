import { Navigate, Outlet, Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Layers,
  Package,
  BarChart3,
  KeyRound,
  LogOut,
  ArrowLeft,
  FolderTree,
  Newspaper,
  Mail,
  Users,
  Send,
  ClipboardList,
  FileText,
  ScanLine,
  ShieldCheck,
  UserCog,
  TrendingUp,
  ReceiptText,
  HandCoins,
  Truck,
  Database,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import logo from "@assets/logo.png";
import Seo from "@/components/seo/Seo";
import { hasAdminPermission, type AdminPermission } from "@/lib/adminPermissions";

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();

  const navItems = useMemo(() => {
    const baseItems: Array<{ title: string; url: string; icon: LucideIcon; permission?: AdminPermission | AdminPermission[] }> = [
      { title: "Store Dashboard", url: "/admin/dashboard", icon: LayoutDashboard, permission: ["dashboard:view", "dashboard:view_product_stats", "dashboard:view_finance", "dashboard:view_inquiries", "dashboard:view_orders"] },
      { title: "Products", url: "/admin/products", icon: Package, permission: "products:view" },
      { title: "Inventory", url: "/admin/inventory", icon: Layers, permission: ["inventory:view", "inventory:view_overview", "inventory:view_metrics", "inventory:view_stock_health", "inventory:view_categories", "inventory:view_movements", "inventory:view_product_flow", "inventory:view_action_lists"] },
      { title: "POS", url: "/admin/pos", icon: ScanLine, permission: "pos:use" },
      { title: "Orders", url: "/admin/orders", icon: ClipboardList, permission: "orders:view" },
      { title: "Create Quotation", url: "/admin/quotations/new", icon: FileText, permission: "orders:view" },
      { title: "Finance Reports", url: "/admin/finance", icon: TrendingUp, permission: "finance:view" },
      { title: "Expenses", url: "/admin/expenses", icon: ReceiptText, permission: "expenses:view" },
      { title: "Source Payments", url: "/admin/sourcing-payments", icon: HandCoins, permission: "sourcing_payments:view" },
      { title: "Suppliers / Sources", url: "/admin/sources", icon: Truck, permission: "sources:view" },
      { title: "Catalog", url: "/admin/categories", icon: FolderTree, permission: "catalog:view" },
      { title: "Blog", url: "/admin/blog", icon: Newspaper, permission: "blog:view" },
      { title: "Messages", url: "/admin/messages", icon: Mail, permission: "messages:view" },
      { title: "Newsletter", url: "/admin/newsletter", icon: Send, permission: "newsletter:view" },
      { title: "Customers", url: "/admin/customers", icon: Users, permission: "customers:view" },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3, permission: "analytics:view" },
      { title: "Change Password", url: "/admin/password", icon: KeyRound },
    ];

    const superItems: Array<{ title: string; url: string; icon: LucideIcon; permission?: AdminPermission | AdminPermission[] }> = [
      { title: "Super Admin", url: "/admin/super-admin", icon: ShieldCheck, permission: "super_admin:view" },
      { title: "Admin Users", url: "/admin/admin-users", icon: UserCog, permission: "admin_users:manage" },
      { title: "DB Migrations", url: "/admin/database-migrations", icon: Database, permission: "super_admin:view" },
    ];

    return [...superItems, ...baseItems].filter((item) => Array.isArray(item.permission)
      ? item.permission.some((permission) => hasAdminPermission(user, permission))
      : hasAdminPermission(user, item.permission)
    );
  }, [user]);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <Link to="/">
          <div className="border-b border-sidebar-border p-4">
            {!collapsed && <img src={logo} alt="TECHALVES" className="h-8" />}
          </div>
        </Link>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role === "super_admin" ? "Super Admin Panel" : "Admin Panel"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto space-y-2 border-t border-sidebar-border p-4">
          {!collapsed && user && (
            <div className="space-y-2 text-xs text-sidebar-foreground/60">
              <div>
                <p className="font-medium text-sidebar-foreground">{user.name}</p>
                <p>{user.email}</p>
              </div>
              <Badge variant={user.role === "super_admin" ? "default" : "secondary"} className="w-fit">
                {user.role === "super_admin" ? "Super admin" : "Admin"}
              </Badge>
            </div>
          )}
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {!collapsed && "Back to site"}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <>
      <Seo title="Admin Dashboard" description="TECHALVES Solutions admin dashboard." canonicalPath="/admin" noIndex noFollow />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-display font-semibold text-foreground">TECHALVES Admin</h1>
                <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                  {user.role === "super_admin" ? "Super admin" : "Admin"}
                </Badge>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-muted/20 p-3 sm:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AdminLayout;
