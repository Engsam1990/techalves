import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/api/client";
import { formatPrice } from "@/api/hooks";
import type { Product } from "@/data/products";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryEmail: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItem[];
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const CustomerAccountPage = () => {
  const { customer, token, logout, updateProfile, changePassword } = useCustomerAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    fullName: customer?.fullName || "",
    phone: customer?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const orderId = useMemo(() => new URLSearchParams(location.search).get("order"), [location.search]);

  useEffect(() => {
    setProfile({
      fullName: customer?.fullName || "",
      phone: customer?.phone || "",
    });
  }, [customer]);

  useEffect(() => {
    if (!token) return;
    setLoadingOrders(true);
    apiClient<Order[]>("/orders/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [token]);

  if (!customer) return <Navigate to="/auth?redirect=/account" replace />;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err.message || "Could not update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleReorder = async (order: Order) => {
    if (!order.items.length) {
      toast.error("No items available to reorder.");
      return;
    }

    setReorderingOrderId(order.id);
    try {
      const products = await Promise.all(
        order.items.map(async (item) => {
          if (!item.product?.slug) return null;
          try {
            return await apiClient<Product>(`/products/${item.product.slug}`);
          } catch {
            return null;
          }
        })
      );

      const productMap = new Map(products.filter((product): product is Product => Boolean(product)).map((product) => [product.id, product]));
      let addedCount = 0;

      for (const item of order.items) {
        const product = item.product?.id ? productMap.get(item.product.id) : undefined;
        if (!product) continue;
        await addToCart(product, item.quantity);
        addedCount += 1;
      }

      if (addedCount === 0) {
        toast.error("Could not rebuild this order in your cart.");
        return;
      }

      toast.success("Items added to your cart.");
      navigate("/checkout");
    } catch (err: any) {
      toast.error(err.message || "Could not reorder this order.");
    } finally {
      setReorderingOrderId(null);
    }
  };

  return (
    <Layout>
      <Seo title="My Account" description="Manage your TECHALVES Solutions customer profile, orders and password." canonicalPath="/account" noIndex noFollow />
      <div className="container py-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">My account</p>
            <h1 className="text-3xl font-display font-bold">Welcome, {customer.fullName.split(" ")[0]}</h1>
            <p className="text-muted-foreground mt-1">Manage your profile, security, and orders from one place.</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Orders placed</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-display font-bold">{orders.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pending orders</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-display font-bold">{orders.filter((order) => order.status === "pending").length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Last payment</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-display font-bold">{orders[0] ? formatPrice(orders[0].totalAmount) : "—"}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue={orderId ? "orders" : "profile"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle className="font-display">Profile details</CardTitle></CardHeader>
              <CardContent>
                <form className="grid gap-4 sm:max-w-xl" onSubmit={handleProfileSave}>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={customer.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={profile.fullName} onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} />
                  </div>
                  <Button className="w-fit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle className="font-display">Change password</CardTitle></CardHeader>
              <CardContent>
                <form className="grid gap-4 sm:max-w-xl" onSubmit={handlePasswordChange}>
                  <div className="space-y-2">
                    <Label>Current password</Label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm new password</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button className="w-fit" disabled={passwordSaving}>{passwordSaving ? "Updating..." : "Update password"}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle className="font-display">Order history</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {loadingOrders ? (
                  <p className="text-muted-foreground">Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground">You have not placed any orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className={`rounded-xl border p-4 ${orderId === order.id ? "border-primary bg-primary/5" : ""}`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-sm sm:text-right space-y-2">
                          <div>
                            <p className="font-medium capitalize">{statusLabel[order.status] || order.status}</p>
                            <p className="text-muted-foreground capitalize">{order.paymentStatus} • {order.paymentMethod.replace(/_/g, " ")}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleReorder(order)}
                            disabled={reorderingOrderId === order.id}
                          >
                            {reorderingOrderId === order.id ? "Reordering..." : "Reorder"}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.product?.image && <img src={item.product.image} alt="" className="h-12 w-12 rounded-lg border object-cover" />}
                            <div className="flex-1">
                              <p className="font-medium">{item.product?.name || "Product"}</p>
                              <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                            </div>
                            <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
                        <p className="text-muted-foreground">{order.deliveryAddress}</p>
                        <p className="font-display font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerAccountPage;
