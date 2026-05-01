import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, UserCog, Users, UserPlus, ShoppingBag, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { formatPrice } from "@/api/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const cards = [
  { key: "superAdmins", label: "Super Admins", icon: ShieldCheck, href: "/admin/admin-users" },
  { key: "activeAdmins", label: "Active Admins", icon: UserCog, href: "/admin/admin-users" },
  { key: "promotionCandidates", label: "Promotable Users", icon: UserPlus, href: "/admin/admin-users" },
  { key: "totalCustomers", label: "Customers", icon: Users, href: "/admin/customers" },
];

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [storeOverview, setStoreOverview] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== "super_admin") return;

    setLoading(true);
    Promise.all([adminApi.getAdminUsersOverview(), adminApi.getOverview()])
      .then(([adminSummary, analytics]) => {
        setSummary(adminSummary);
        setStoreOverview(analytics);
      })
      .catch((error) => toast.error(error.message || "Could not load super admin dashboard"))
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (user?.role !== "super_admin") return <Navigate to="/admin/dashboard" replace />;

  const finance = storeOverview?.finance || {};
  const recentAdmins = Array.isArray(summary?.recentAdmins) ? summary.recentAdmins : [];
  const recentCandidates = Array.isArray(summary?.recentCandidates) ? summary.recentCandidates : [];
  const recentActivity = Array.isArray(summary?.recentActivity) ? summary.recentActivity : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge>Super Admin</Badge>
            <Badge variant="outline">System control</Badge>
          </div>
          <h2 className="mt-3 text-2xl font-display font-bold text-foreground">Super Admin Dashboard</h2>
          <p className="mt-1 text-muted-foreground">Manage administrators, promote trusted users, and monitor high-level store activity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/admin-users">Manage Admin Users</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/dashboard">Open Store Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} to={href} className="block">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-display font-bold">{summary?.[key] ?? 0}</p>}
                <div className="mt-3 flex items-center text-xs font-medium text-primary">
                  Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-display font-bold">{storeOverview?.finance?.totalOrders ?? 0}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Revenue</CardTitle>
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-display font-bold">{formatPrice(Number(finance.paidRevenue || 0))}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Revenue</CardTitle>
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-display font-bold">{formatPrice(Number(finance.pendingRevenue || 0))}</p>}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display">Recent Admin Accounts</CardTitle>
              <CardDescription>Most recently created or updated admin users.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/admin-users">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
            ) : recentAdmins.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No admin users found yet.</div>
            ) : (
              recentAdmins.map((admin: any) => (
                <div key={admin.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>{admin.role === "super_admin" ? "Super admin" : "Admin"}</Badge>
                      <Badge variant={admin.isActive ? "outline" : "destructive"}>{admin.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display">Users Ready for Promotion</CardTitle>
              <CardDescription>Customer accounts that can be promoted into admin users.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/admin-users">Promote Users</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
            ) : recentCandidates.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">All current customers with matching emails are already admins or no customers exist yet.</div>
            ) : (
              recentCandidates.map((candidate: any) => (
                <div key={candidate.id} className="rounded-lg border p-4">
                  <p className="font-medium text-foreground">{candidate.fullName}</p>
                  <p className="text-xs text-muted-foreground">{candidate.email}{candidate.phone ? ` • ${candidate.phone}` : ""}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>



        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display">Recent Access Activity</CardTitle>
              <CardDescription>Latest admin-management changes made by super admins.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/admin-users">Open Logs</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
            ) : recentActivity.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No admin access activity has been recorded yet.</div>
            ) : (
              recentActivity.map((log: any) => (
                <div key={log.id} className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-foreground">
                    {log.actorEmail || "System"} → {log.targetName || log.targetEmail || "Admin account"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {String(log.action || "").replace(/_/g, " ")} • {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/admin/orders" className="block">
          <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Order Management</CardTitle>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Review payments, confirm orders, and track fulfilment.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/customers" className="block">
          <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer Accounts</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Inspect customer profiles before promoting trusted team members.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/admin-users" className="block">
          <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admin Access Control</CardTitle>
              <UserCog className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create admins, reset passwords, delete unused accounts, and manage roles.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/dashboard" className="block">
          <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Store Revenue Dashboard</CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Jump into the operational dashboard used by the admin team.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/finance" className="block">
          <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Finance Reports</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Access comprehensive financial analysis with charts and metrics.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
