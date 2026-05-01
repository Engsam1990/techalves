import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, ExternalLink, Package, ReceiptText } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

function stockTone(product: any) {
  if (!product?.inStock || Number(product?.stockQuantity || 0) <= 0) return "destructive" as const;
  return "default" as const;
}

function receivedUnits(product: any) {
  return Number(product?.totalStockReceived ?? product?.stockQuantity ?? 0);
}

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([adminApi.getProduct(id), adminApi.getExpenses()])
      .then(([productData, expenseRows]) => {
        setProduct(productData);
        setExpenses(Array.isArray(expenseRows) ? expenseRows : []);
      })
      .catch((err: any) => {
        toast({ title: "Error", description: err.message || "Could not load product details", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const sourcePayments = useMemo(() => {
    if (!product?.id) return [];
    return expenses.filter((expense) => {
      const category = String(expense.categorySlug || expense.category || "").toLowerCase();
      return expense.productId === product.id && category === "supplier";
    });
  }, [expenses, product?.id]);

  if (loading) return <Skeleton className="h-[520px] w-full rounded-xl" />;

  if (!product) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Product not found.</CardContent>
        </Card>
      </div>
    );
  }

  const publicUrl = product.slug ? `/product/${product.slug}` : null;
  const totalReceivedUnits = receivedUnits(product);
  const canEditProduct = hasAdminPermission(user, "products:edit") ||
    hasAdminPermission(user, "products:edit_basic") ||
    hasAdminPermission(user, "products:edit_serials") ||
    hasAdminPermission(user, "products:edit_pricing_stock") ||
    hasAdminPermission(user, "products:edit_sources") ||
    hasAdminPermission(user, "products:edit_images");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
          </Button>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Product details</h2>
            <p className="text-muted-foreground">View product, stock, supplier/source, and payment records without opening the editor.</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {publicUrl ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to={publicUrl} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" /> Public page
              </Link>
            </Button>
          ) : null}
          {canEditProduct ? (
            <Button asChild className="w-full sm:w-auto">
              <Link to={`/admin/products/${product.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit product
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={stockTone(product)}>{product.inStock ? "In stock" : "Sold out"}</Badge>
                  {product.featured ? <Badge variant="secondary">Featured</Badge> : null}
                  {product.premium ? <Badge variant="outline">Premium</Badge> : null}
                  {product.salesChannel === "pos_only" ? <Badge variant="outline">POS only</Badge> : null}
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-semibold">{formatPrice(Number(product.price || 0))}</p>
                {product.originalPrice ? <p className="text-sm text-muted-foreground line-through">{formatPrice(Number(product.originalPrice || 0))}</p> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.isArray(product.images) && product.images.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {product.images.map((image: string, index: number) => (
                  <img key={`${image}-${index}`} src={image} alt={`${product.name} ${index + 1}`} className="h-44 w-full rounded-lg border object-cover" />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No product images uploaded.</div>
            )}

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label="Category" value={product.categoryName || product.category} />
              <Info label="Subcategory" value={product.subcategory} />
              <Info label="Brand" value={product.brand} />
              <Info label="Condition" value={product.condition} />
              <Info label="Barcode" value={product.barcode} />
              <Info label="Warranty" value={product.warranty || product.warrantyText} />
              <Info label="Available stock" value={`${Number(product.stockQuantity || 0)} unit(s)`} />
              <Info label="Total received units" value={`${totalReceivedUnits} unit(s)`} />
              <Info label="Entry date" value={formatDate(product.entryDate || product.createdAt)} />
              <Info label="Data entrant" value={product.dataEntrant} className="md:col-span-2 xl:col-span-3" />
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              {product.description ? (
                <article className="prose max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-sm text-muted-foreground">No description recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5" /> Supplier / source</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Info label="Supplier/source" value={product.sourceName || product.sourcedFrom} />
              <Info label="Source date" value={formatDate(product.sourceDate)} />
              <Info label="Sourced by" value={product.sourcedBy || product.dataEntrant} />
              <Info label="Unit source price" value={product.sourcePrice ? formatPrice(Number(product.sourcePrice || 0)) : "—"} />
              <Info label="Total source value" value={product.sourcePrice ? formatPrice(Number(product.sourcePrice || 0) * totalReceivedUnits) : "—"} />
              <Info label="Source payment status" value={product.sourcePaymentStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ReceiptText className="h-5 w-5" /> Source payment records</CardTitle></CardHeader>
            <CardContent>
              {sourcePayments.length ? (
                <div className="space-y-3">
                  {sourcePayments.map((expense) => (
                    <div key={expense.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">{formatDate(expense.expenseDate || expense.date)}</p>
                          <p className="text-muted-foreground">{expense.sourceName || product.sourceName || "Supplier/source"}</p>
                        </div>
                        <p className="font-semibold sm:text-right">{formatPrice(Number(expense.amount || 0))}</p>
                      </div>
                      <p className="mt-2 text-muted-foreground">{expense.description || expense.details || "—"}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Total received units: {totalReceivedUnits}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Recorded by {expense.dataEntrantName || expense.dataEntrant || expense.dataEntrantEmail || "—"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No supplier/source payment expense has been recorded for this product yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Specifications</CardTitle></CardHeader>
        <CardContent>
          {product.specs && Object.keys(product.specs).length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="min-w-40">Specification</TableHead><TableHead className="min-w-48">Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <TableRow key={key}><TableCell>{key}</TableCell><TableCell className="break-words">{valueOrDash(value)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No specifications recorded.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Serial numbers</CardTitle></CardHeader>
        <CardContent>
          {Array.isArray(product.serialNumbers) && product.serialNumbers.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="min-w-44">Serial number</TableHead><TableHead>Status</TableHead><TableHead className="min-w-32">Sold at</TableHead></TableRow></TableHeader>
                <TableBody>
                  {product.serialNumbers.map((serial: any) => (
                    <TableRow key={serial.id || serial.serialNumber}>
                      <TableCell className="break-words">{serial.serialNumber}</TableCell>
                      <TableCell><Badge variant={serial.status === "sold" ? "secondary" : "outline"}>{serial.status || "available"}</Badge></TableCell>
                      <TableCell>{formatDate(serial.soldAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No serial numbers recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value, className = "" }: { label: string; value: unknown; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{valueOrDash(value)}</p>
    </div>
  );
}
