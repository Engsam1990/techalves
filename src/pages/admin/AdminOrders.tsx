import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/data/products";
import { AlertTriangle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function getOrderIssues(order: any) {
  return Array.isArray(order?.issues) ? order.issues.filter(Boolean) : [];
}

function issueSummary(issues: any[]) {
  if (!issues.length) return "";
  const titles = issues.slice(0, 2).map((issue) => issue.title || issue.message || "Order issue");
  const remaining = issues.length - titles.length;
  return remaining > 0 ? `${titles.join(", ")} +${remaining} more` : titles.join(", ");
}

function dataEntrantDisplay(record: any) {
  const adminName = String(record?.dataEntrantName || record?.createdByName || "").trim();
  const adminEmail = String(record?.dataEntrantEmail || record?.createdByEmail || "").trim();
  const customerName = String(record?.customer?.fullName || record?.deliveryName || "").trim();
  const customerEmail = String(record?.customer?.email || record?.deliveryEmail || "").trim();

  if (adminName || adminEmail) {
    return {
      primary: adminName || adminEmail,
      secondary: adminName && adminEmail && adminName !== adminEmail ? adminEmail : "",
      type: "admin",
    };
  }

  if (customerEmail || customerName) {
    return {
      primary: customerEmail || customerName,
      secondary: customerEmail && customerName && customerEmail !== customerName ? customerName : "Customer order",
      type: "customer",
    };
  }

  return { primary: "Unknown entrant", secondary: "", type: "unknown" };
}

const AdminOrders = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "all",
    paymentStatus: searchParams.get("paymentStatus") || "all",
    paymentMethod: searchParams.get("paymentMethod") || "all",
    financeIssue: searchParams.get("financeIssue") || "all",
    start: searchParams.get("start") || "",
    end: searchParams.get("end") || "",
  }));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        q: filters.q || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        paymentStatus: filters.paymentStatus !== "all" ? filters.paymentStatus : undefined,
        paymentMethod: filters.paymentMethod !== "all" ? filters.paymentMethod : undefined,
        financeIssue: filters.financeIssue !== "all" ? filters.financeIssue : undefined,
        start: filters.start || undefined,
        end: filters.end || undefined,
      });
      setOrders(res.data || []);
      const nextParams = new URLSearchParams();
      if (filters.q) nextParams.set("q", filters.q);
      if (filters.status !== "all") nextParams.set("status", filters.status);
      if (filters.paymentStatus !== "all") nextParams.set("paymentStatus", filters.paymentStatus);
      if (filters.paymentMethod !== "all") nextParams.set("paymentMethod", filters.paymentMethod);
      if (filters.financeIssue !== "all") nextParams.set("financeIssue", filters.financeIssue);
      if (filters.start) nextParams.set("start", filters.start);
      if (filters.end) nextParams.set("end", filters.end);
      setSearchParams(nextParams, { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Orders</h2>
        <p className="text-muted-foreground">Review, confirm, and track customer orders.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search order, customer, phone, email" value={filters.q} onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))} />
          </div>
          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.paymentStatus} onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}>
              <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          <Select value={filters.paymentMethod} onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMethod: value }))}>
            <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="cash_on_delivery">Cash on delivery</SelectItem>
              <SelectItem value="mpesa">M-Pesa</SelectItem>
              <SelectItem value="bank_transfer">Bank transfer</SelectItem>
              <SelectItem value="cash">Cash / POS</SelectItem>
              <SelectItem value="card">Card / POS</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.financeIssue} onValueChange={(value) => setFilters((prev) => ({ ...prev, financeIssue: value }))}>
            <SelectTrigger><SelectValue placeholder="Finance Issue" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All finance issues</SelectItem>
              <SelectItem value="open">All open issues</SelectItem>
              <SelectItem value="pending_payments">Pending payments</SelectItem>
              <SelectItem value="partial_payments">Partial payments</SelectItem>
              <SelectItem value="returned_items">Returned items</SelectItem>
              <SelectItem value="fulfillment_backlog">Fulfilment backlog</SelectItem>
              <SelectItem value="failed_payments">Failed payments</SelectItem>
              <SelectItem value="missing_references">Missing references</SelectItem>
              <SelectItem value="paid_not_completed">Paid not completed</SelectItem>
              <SelectItem value="refunded_orders">Refunded orders</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid gap-2 sm:grid-cols-2 md:col-span-2">
            <Input type="date" value={filters.start} onChange={(e) => setFilters((prev) => ({ ...prev, start: e.target.value }))} aria-label="Start date" />
            <Input type="date" value={filters.end} onChange={(e) => setFilters((prev) => ({ ...prev, end: e.target.value }))} aria-label="End date" />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button onClick={fetchOrders}>Apply</Button>
            <Button variant="outline" onClick={() => {
              setFilters({ q: "", status: "all", paymentStatus: "all", paymentMethod: "all", financeIssue: "all", start: "", end: "" });
              setSearchParams({}, { replace: true });
            }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Data entrant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const orderIssues = getOrderIssues(order);
                  return (
                  <TableRow key={order.id} className={orderIssues.length ? "bg-amber-50/70 hover:bg-amber-50" : undefined}>
                    <TableCell className="font-medium">
                      <div className="space-y-2">
                        <p>#{order.id.slice(0, 8).toUpperCase()}</p>
                        {orderIssues.length ? (
                          <div className="inline-flex max-w-[260px] items-start gap-1 rounded-md border border-amber-200 bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{issueSummary(orderIssues)}</span>
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{order.deliveryName}</p>
                        <p className="text-xs text-muted-foreground">{order.deliveryPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">{order.paymentStatus}</Badge>
                        <p className="text-xs text-muted-foreground capitalize">{order.paymentMethod.replace(/_/g, " ")}</p>
                        {order.paymentSummary ? (
                          <p className="text-xs text-muted-foreground">
                            Paid {formatPrice(Number(order.paymentSummary.netPaidAmount || 0))} • Bal {formatPrice(Number(order.paymentSummary.balanceAmount || 0))}
                          </p>
                        ) : null}
                        {order.transactionReference ? <p className="text-xs text-muted-foreground">Ref: {order.transactionReference}</p> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const entrant = dataEntrantDisplay(order);
                        return (
                          <div>
                            <p>{entrant.primary}</p>
                            {entrant.secondary ? <p className="text-xs text-muted-foreground">{entrant.secondary}</p> : null}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/orders/${order.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminOrders;
