import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { formatPrice } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminApi.getCustomer(id)
      .then(setCustomer)
      .catch((err) => toast.error(err.message || "Could not load customer"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-muted-foreground">Loading customer...</p>;
  if (!customer) return <p className="text-muted-foreground">Customer not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">{customer.fullName}</h2>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
        <Link to="/admin/customers"><Button variant="outline">Back</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Phone</CardTitle></CardHeader>
          <CardContent>{customer.phone || "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Joined</CardTitle></CardHeader>
          <CardContent>{new Date(customer.createdAt).toLocaleDateString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total orders</CardTitle></CardHeader>
          <CardContent>{customer.orders.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">Orders</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {customer.orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            customer.orders.map((order: any) => (
              <div key={order.id} className="rounded-xl border p-4 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-sm sm:text-right">
                    <p className="capitalize">{order.status}</p>
                    <p className="text-muted-foreground capitalize">{order.paymentStatus} • {order.paymentMethod.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.product?.name || "Product"} × {item.quantity}</span>
                      <span>{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end font-display font-bold text-primary">{formatPrice(order.totalAmount)}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerDetail;
