import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CreditCard,
  Eye,
  Layers,
  MessageSquare,
  MousePointerClick,
  Package,
  Receipt,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/data/products";

const statCards = [
  { key: "totalProducts", label: "Total Products", icon: Package, color: "text-primary", href: "/admin/products" },
  { key: "inStockCount", label: "In Stock", icon: Layers, color: "text-green-600", href: "/admin/products?stock=in_stock" },
  { key: "soldOutCount", label: "Sold Out", icon: XCircle, color: "text-destructive", href: "/admin/products?stock=sold_out" },
  { key: "featuredCount", label: "Featured", icon: Star, color: "text-secondary", href: "/admin/products?featured=featured" },
  { key: "totalViews", label: "Total Views", icon: Eye, color: "text-primary", href: "/admin/analytics" },
  { key: "totalClicks", label: "Total Clicks", icon: MousePointerClick, color: "text-blue-500", href: "/admin/analytics" },
  { key: "totalInquiries", label: "Inquiries", icon: MessageSquare, color: "text-green-600", href: "/admin/messages?status=new" },
  { key: "conversionRate", label: "Conversion Rate", icon: TrendingUp, color: "text-secondary", suffix: "%", href: "/admin/analytics" },
];

const financeCards = [
  { key: "totalRevenue", label: "Total Revenue", icon: Wallet, href: "/admin/orders" },
  { key: "paidRevenue", label: "Paid Revenue", icon: CreditCard, href: "/admin/orders" },
  { key: "pendingRevenue", label: "Pending Revenue", icon: Receipt, href: "/admin/orders" },
  { key: "averageOrderValue", label: "Average Order Value", icon: ShoppingBag, href: "/admin/orders" },
];

function formatRelativeDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function formatInquirySubject(subject: string) {
  return subject.replace(/^\[Product Inquiry\]\s*/i, "").trim() || subject;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getOverview()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const finance = stats?.finance || {};
  const recentInquiries = Array.isArray(stats?.recentInquiries) ? stats.recentInquiries : [];
  const recentOrders = Array.isArray(stats?.recentOrders) ? stats.recentOrders : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Track products, revenue, orders, and incoming product inquiries from one place.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/inventory">Open Inventory Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color, suffix, href }) => (
          <Link key={key} to={href} className="block">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <p className="text-2xl font-bold font-display text-foreground">
                      {stats?.[key] ?? 0}
                      {suffix && stats?.[key] !== undefined ? suffix : ""}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-primary font-medium">
                      Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-xl font-display font-bold">Finance Overview</h3>
            <p className="text-sm text-muted-foreground">Revenue and order health pulled from the live orders table.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <Link to="/admin/finance">View Full Report</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/orders">Open Orders</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {financeCards.map(({ key, label, icon: Icon, href }) => (
            <Link key={key} to={href} className="block">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold font-display">{formatPrice(Number(finance[key] || 0))}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/admin/orders" className="block">
            <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold font-display">{finance.totalOrders ?? 0}</p>}
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/orders" className="block">
            <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold font-display">{finance.pendingOrders ?? 0}</p>}
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/orders" className="block">
            <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paid Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold font-display">{finance.paidOrders ?? 0}</p>}
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display">Latest Product Inquiries</CardTitle>
              <CardDescription>Messages submitted from product pages.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/messages">Open Inbox</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))}
              </div>
            ) : recentInquiries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No product inquiries have been sent yet.
              </div>
            ) : (
              recentInquiries.map((item: any) => (
                <div key={item.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">{item.fullName}</p>
                      <p className="text-xs text-muted-foreground">{item.email}{item.phone ? ` • ${item.phone}` : ""}</p>
                    </div>
                    <Badge variant={item.status === "resolved" ? "default" : "secondary"}>{String(item.status || "new").replace(/_/g, " ")}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatInquirySubject(item.subject)}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">{item.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display">Recent Orders</CardTitle>
              <CardDescription>Quick revenue-related order snapshot.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No orders yet.
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <Link key={order.id} to={`/admin/orders/${order.id}`} className="block rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{order.deliveryName || order.id}</p>
                      <p className="text-xs text-muted-foreground">#{order.id}</p>
                    </div>
                    <p className="font-semibold text-foreground">{formatPrice(Number(order.totalAmount || 0))}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>{order.status}</Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatRelativeDate(order.createdAt)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
