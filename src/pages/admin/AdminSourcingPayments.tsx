import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { hasAdminPermission } from "@/lib/adminPermissions";

function dataEntrantDisplay(record: any) {
  const name = record?.dataEntrantName || record?.createdByName || "";
  const email = record?.dataEntrantEmail || record?.createdByEmail || "";
  const primary = name || email || "Unknown admin";
  const secondary = name && email && name !== email ? email : "";
  return { primary, secondary };
}

function normalizedPaymentStatus(item: any) {
  const value = String(item.sourcePaymentStatus || item.sourcingPaymentStatus || "pending").toLowerCase();
  if (value === "paid") return "paid";
  if (value === "pay_later") return "pending";
  return value;
}

function statusBadgeVariant(status: string) {
  if (status === "paid") return "default" as const;
  if (status === "partial") return "secondary" as const;
  if (status === "waived") return "outline" as const;
  return "destructive" as const;
}

export default function AdminSourcingPayments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdatePayments = hasAdminPermission(user, "sourcing_payments:update");
  const [items, setItems] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => setItems(await adminApi.getSourcingPayments("all"));

  useEffect(() => {
    load().catch((err) => toast({ title: "Error", description: err.message || "Could not load supplier payments", variant: "destructive" }));
  }, []);

  const summary = useMemo(() => items.reduce((acc, item) => {
    const amount = Number(item.sourcePrice || 0) * Math.max(1, Number(item.totalStockReceived || item.stockQuantity || 1));
    const status = normalizedPaymentStatus(item);
    acc.total += amount;
    if (status === "paid") acc.paid += amount;
    else acc.pending += amount;
    return acc;
  }, { total: 0, paid: 0, pending: 0 }), [items]);

  const markPayment = async (item: any, paymentStatus: "paid" | "pay_later") => {
    if (!canUpdatePayments) return;
    setSavingId(item.id);
    try {
      await adminApi.markSourcingPayment(item.id, { paymentStatus });
      toast({
        title: paymentStatus === "paid" ? "Supplier payment recorded" : "Supplier payment moved to pending",
        description: paymentStatus === "paid" ? "A supplier/product acquisition cost is created if one was not already recorded." : undefined,
      });
      await load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not update source payment", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Source Payments</h2>
        <p className="text-muted-foreground">View supplier/product acquisition payment records and the admin who entered each product.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Total acquisition cost</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatPrice(summary.total)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatPrice(summary.paid)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Pending/pay later</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatPrice(summary.pending)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Product source payments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Supplier/source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data entrant</TableHead>
                <TableHead className="text-right">Source price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const entrant = dataEntrantDisplay(item);
                const status = normalizedPaymentStatus(item);
                const busy = savingId === item.id;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Received: {Number(item.totalStockReceived || item.stockQuantity || 0)} unit(s)</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.sourceName || item.sourcedFrom || "—"}</TableCell>
                    <TableCell><Badge variant={statusBadgeVariant(status)}>{status === "paid" ? "Paid" : "Pending / pay later"}</Badge></TableCell>
                    <TableCell>
                      <div>
                        <p>{entrant.primary}</p>
                        {entrant.secondary ? <p className="text-xs text-muted-foreground">{entrant.secondary}</p> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p>{formatPrice(Number(item.sourcePrice || 0))}</p>
                        <p className="text-xs text-muted-foreground">Total: {formatPrice(Number(item.sourcePrice || 0) * Math.max(1, Number(item.totalStockReceived || item.stockQuantity || 1)))}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {canUpdatePayments ? (
                          status === "paid"
                            ? <Button size="sm" variant="outline" disabled={busy} onClick={() => markPayment(item, "pay_later")}>{busy ? "Saving..." : "Mark pending"}</Button>
                            : <Button size="sm" disabled={busy} onClick={() => markPayment(item, "paid")}>{busy ? "Saving..." : "Mark paid"}</Button>
                        ) : null}
                        <Button asChild size="sm" variant="outline"><Link to={`/admin/sourcing-payments/${item.id}`}>View details</Link></Button>
                        <Button asChild size="sm" variant="outline"><Link to={`/admin/products/${item.id}`}>View product</Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No source payment records found.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
