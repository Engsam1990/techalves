import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission } from "@/lib/adminPermissions";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function valueOrDash(value: unknown) {
  const text = String(value ?? "").trim();
  return text || "—";
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

function dataEntrantDisplay(record: any) {
  const name = record?.dataEntrantName || record?.createdByName || "";
  const email = record?.dataEntrantEmail || record?.createdByEmail || "";
  const primary = name || email || "Unknown admin";
  const secondary = name && email && name !== email ? email : "";
  return { primary, secondary };
}

export default function AdminSourcingPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdatePayments = hasAdminPermission(user, "sourcing_payments:update");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi
      .getProduct(id)
      .then(setProduct)
      .catch((err: any) => {
        toast({ title: "Error", description: err.message || "Could not load payment details", variant: "destructive" });
        navigate("/admin/sourcing-payments");
      })
      .finally(() => setLoading(false));
  }, [id, toast, navigate]);

  const markPayment = async (paymentStatus: "paid" | "pay_later") => {
    if (!canUpdatePayments || !product) return;
    setSaving(true);
    try {
      await adminApi.markSourcingPayment(product.id, { paymentStatus });
      toast({
        title: paymentStatus === "paid" ? "Supplier payment recorded" : "Supplier payment moved to pending",
        description: paymentStatus === "paid" ? "A supplier/product acquisition cost is created if one was not already recorded." : undefined,
      });
      setProduct({ ...product, sourcingPaymentStatus: paymentStatus, sourcePaymentStatus: paymentStatus === "paid" ? "paid" : "pending" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not update source payment", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-[520px] w-full rounded-xl" />;

  if (!product) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/sourcing-payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sourcing payments
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Payment record not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = normalizedPaymentStatus(product);
  const receivedUnits = Number(product.totalStockReceived ?? product.stockQuantity ?? 0);
  const unitPrice = Number(product.sourcePrice || 0);
  const totalCost = unitPrice * Math.max(1, receivedUnits);
  const entrant = dataEntrantDisplay(product);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/sourcing-payments")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sourcing payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">Source payment details</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Product SKU/ID</p>
              <p className="font-medium">{product.id}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Product Name</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{product.categoryName || "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Barcode</p>
              <p className="font-mono text-sm">{valueOrDash(product.barcode)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Stock Received</p>
              <p className="font-medium">{receivedUnits} unit(s)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Source/Supplier</p>
              <p className="font-medium">{product.sourceName || product.sourcedFrom || "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Unit Price</p>
              <p className="font-medium">{formatPrice(unitPrice)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="font-medium">{formatPrice(totalCost)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <div className="mt-1">
                <Badge variant={statusBadgeVariant(status)}>
                  {status === "paid" ? "Paid" : "Pending / pay later"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Entry Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Data Entrant</p>
            <div className="mt-1">
              <p className="font-medium">{entrant.primary}</p>
              {entrant.secondary ? <p className="text-xs text-muted-foreground">{entrant.secondary}</p> : null}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Created Date</p>
            <p className="font-medium">{formatDate(product.createdAt)}</p>
          </div>
          {product.sourcingPaidAt ? (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Payment Recorded Date</p>
                <p className="font-medium">{formatDate(product.sourcingPaidAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Payment Recorded By</p>
                <p className="font-medium">{product.sourcingPaidByName || "—"}</p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canUpdatePayments ? (
            <>
              {status === "paid" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={saving}
                  onClick={() => markPayment("pay_later")}
                >
                  {saving ? "Saving..." : "Mark as Pending / Pay Later"}
                </Button>
              ) : (
                <Button className="w-full" disabled={saving} onClick={() => markPayment("paid")}>
                  {saving ? "Saving..." : "Mark as Paid"}
                </Button>
              )}
            </>
          ) : null}
          <Button asChild variant="outline" className="w-full">
            <Link to={`/admin/products/${product.id}`}>
              View Product Details <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
