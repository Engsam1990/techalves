import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { formatPrice } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = () => {
    setLoading(true);
    adminApi.getCustomers({ q: search || undefined })
      .then(setCustomers)
      .catch((err) => toast.error(err.message || "Could not load customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCustomers(); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Customers</h2>
      <div className="flex gap-3">
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={loadCustomers}>Search</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="font-display">Customer list</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Last order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.fullName}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>{customer.lastOrder ? formatPrice(customer.lastOrder.totalAmount) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/customers/${customer.id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
