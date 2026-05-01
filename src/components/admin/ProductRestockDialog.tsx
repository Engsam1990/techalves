import { useEffect, useMemo, useState, type FormEvent } from "react";
import { adminApi } from "@/api/adminApi";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission } from "@/lib/adminPermissions";
import { Package, Plus } from "lucide-react";

type RestockProduct = {
  id: string;
  name: string;
  price: number;
  stockQuantity?: number;
  totalStockReceived?: number;
  sourceId?: string | null;
  sourceName?: string | null;
  sourcePrice?: number;
  sourcingPaymentStatus?: "paid" | "pay_later";
  images?: string[];
  serialNumbers?: Array<{ serialNumber?: string } | string>;
};

type Source = {
  id: string;
  name: string;
  isActive?: boolean;
};

interface ProductRestockDialogProps {
  product: RestockProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (product: RestockProduct) => void;
}

function normalizeSerialList(values: string[]) {
  const seen = new Set<string>();
  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function parseSerialNumbers(text: string) {
  return normalizeSerialList(
    text
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function uniqueImages(images: string[]) {
  const seen = new Set<string>();
  return images
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProductRestockDialog({
  product,
  open,
  onOpenChange,
  onSaved,
}: ProductRestockDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdateSourcePayments = hasAdminPermission(user, "sourcing_payments:update");
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitSourcePrice, setUnitSourcePrice] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [sourcedBy, setSourcedBy] = useState("");
  const [sourceDate, setSourceDate] = useState(today());
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pay_later">("pay_later");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [note, setNote] = useState("");
  const [serialNumbersText, setSerialNumbersText] = useState("");
  const [queuedImages, setQueuedImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !product) {
      setSellingPrice("");
      setQuantity("");
      setUnitSourcePrice("");
      setSourceId("");
      setSourcedBy("");
      setSourceDate(today());
      setPaymentStatus("pay_later");
      setPaymentMethod("");
      setReference("");
      setReceiptUrl("");
      setNote("");
      setSerialNumbersText("");
      setQueuedImages([]);
      setSaving(false);
      return;
    }

    setSellingPrice(String(Number(product.price || 0)));
    setQuantity("");
    setUnitSourcePrice(String(Number(product.sourcePrice || 0)));
    setSourceId(product.sourceId || "");
    setSourcedBy("");
    setSourceDate(today());
    setPaymentStatus(product.sourcingPaymentStatus === "paid" ? "paid" : "pay_later");
    setPaymentMethod("");
    setReference("");
    setReceiptUrl("");
    setNote("");
    setSerialNumbersText("");
    setQueuedImages([]);
    setSaving(false);
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadingSources(true);
    adminApi.getSources({ active: "1" })
      .then((result) => {
        if (active) setSources(Array.isArray(result) ? result : []);
      })
      .catch((error: any) => {
        if (active) {
          toast({
            title: "Could not load suppliers",
            description: error.message || "The stock receiving form can still save without changing supplier.",
            variant: "destructive",
          });
        }
      })
      .finally(() => {
        if (active) setLoadingSources(false);
      });
    return () => {
      active = false;
    };
  }, [open, toast]);

  const currentStockQuantity = Number(product?.stockQuantity || 0);
  const currentTotalStockReceived = Number(product?.totalStockReceived ?? currentStockQuantity ?? 0);
  const parsedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  const parsedUnitSourcePrice = Math.max(0, Number(unitSourcePrice || 0));
  const totalAcquisitionCost = parsedQuantity * parsedUnitSourcePrice;
  const addedSerialNumbers = useMemo(() => parseSerialNumbers(serialNumbersText), [serialNumbersText]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast({ title: "Validation error", description: "Quantity must be greater than zero", variant: "destructive" });
      return;
    }

    const parsedSellingPrice = Math.round(Number(sellingPrice));
    if (!sellingPrice.trim() || !Number.isFinite(parsedSellingPrice) || parsedSellingPrice < 0) {
      toast({ title: "Validation error", description: "Selling price must be a valid number", variant: "destructive" });
      return;
    }

    if (addedSerialNumbers.length > parsedQuantity) {
      toast({ title: "Validation error", description: "Serial numbers cannot be more than received quantity", variant: "destructive" });
      return;
    }

    if (canUpdateSourcePayments && paymentStatus === "paid" && parsedUnitSourcePrice <= 0) {
      toast({
        title: "Unit acquisition cost required",
        description: "Enter the supplier unit cost before recording a paid stock receipt.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await adminApi.receiveProductStock(product.id, {
        quantity: parsedQuantity,
        unitSourcePrice: parsedUnitSourcePrice,
        sellingPrice: parsedSellingPrice,
        sourceId: sourceId || undefined,
        sourcedBy: sourcedBy.trim() || undefined,
        sourceDate: sourceDate || undefined,
        paymentStatus: canUpdateSourcePayments ? (paymentStatus === "paid" ? "paid" : "pending") : undefined,
        paymentMethod: paymentStatus === "paid" && paymentMethod ? paymentMethod : undefined,
        reference: reference.trim() || undefined,
        receiptUrl: receiptUrl.trim() || undefined,
        note: note.trim() || undefined,
        serialNumbers: addedSerialNumbers,
        images: queuedImages,
      });

      onSaved(result.product);
      toast({
        title: "Stock received",
        description: `${product.name} now has ${currentStockQuantity + parsedQuantity} available unit(s).`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not receive stock",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalQueuedPhotos = queuedImages.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[94vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Receive stock
          </DialogTitle>
          <DialogDescription>
            Record supplier receipt, acquisition cost, serials, photos, and payment status in one audited inventory transaction.
          </DialogDescription>
        </DialogHeader>

        {product ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium text-foreground">{product.name}</p>
              <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                <p>Available stock: {currentStockQuantity} unit(s)</p>
                <p>Total received: {currentTotalStockReceived} unit(s)</p>
                <p>Next available stock: {currentStockQuantity + parsedQuantity} unit(s)</p>
                <p>Current selling price: {formatPrice(Number(product.price || 0))}</p>
                <p>Current supplier: {product.sourceName || "Not set"}</p>
                <p>Receipt value: {formatPrice(totalAcquisitionCost)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="restock-selling-price">Selling price</Label>
                <Input
                  id="restock-selling-price"
                  type="number"
                  min={0}
                  step={1}
                  value={sellingPrice}
                  onChange={(event) => setSellingPrice(event.target.value)}
                  placeholder="Selling price"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-quantity">Quantity received</Label>
                <Input
                  id="restock-quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Units received"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-unit-cost">Unit acquisition cost</Label>
                <Input
                  id="restock-unit-cost"
                  type="number"
                  min={0}
                  step={1}
                  value={unitSourcePrice}
                  onChange={(event) => setUnitSourcePrice(event.target.value)}
                  placeholder="Supplier unit cost"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Supplier / source</Label>
                <Select value={sourceId || "keep-current"} onValueChange={(value) => setSourceId(value === "keep-current" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSources ? "Loading suppliers..." : "Keep current supplier"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep-current">Keep current supplier</SelectItem>
                    {sources.filter((item) => item.isActive !== false).map((source) => (
                      <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-source-date">Source date</Label>
                <Input
                  id="restock-source-date"
                  type="date"
                  value={sourceDate}
                  onChange={(event) => setSourceDate(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restock-sourced-by">Sourced by</Label>
                <Input
                  id="restock-sourced-by"
                  value={sourcedBy}
                  onChange={(event) => setSourcedBy(event.target.value)}
                  placeholder="Staff/person who sourced it"
                />
              </div>

              <div className="space-y-2">
                <Label>Supplier payment status</Label>
                <Select value={paymentStatus} onValueChange={(value) => canUpdateSourcePayments && setPaymentStatus(value as "paid" | "pay_later")} disabled={!canUpdateSourcePayments}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pay_later">Pay later / pending</SelectItem>
                    <SelectItem value="paid">Paid now</SelectItem>
                  </SelectContent>
                </Select>
                {!canUpdateSourcePayments ? (
                  <p className="text-xs text-amber-700">Changing supplier payment status requires Source Payments update permission.</p>
                ) : null}
              </div>
            </div>

            {canUpdateSourcePayments && paymentStatus === "paid" ? (
              <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Payment method</Label>
                  <Select value={paymentMethod || "not-set"} onValueChange={(value) => setPaymentMethod(value === "not-set" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-set">Not specified</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restock-reference">Payment/reference no.</Label>
                  <Input
                    id="restock-reference"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="Receipt, invoice, M-Pesa ref"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restock-receipt-url">Receipt/proof URL</Label>
                  <Input
                    id="restock-receipt-url"
                    value={receiptUrl}
                    onChange={(event) => setReceiptUrl(event.target.value)}
                    placeholder="Optional receipt/proof link"
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="restock-serials">Serial numbers</Label>
              <Textarea
                id="restock-serials"
                value={serialNumbersText}
                onChange={(event) => setSerialNumbersText(event.target.value)}
                placeholder="Add one serial number per line or separate with commas"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Existing serial numbers are preserved automatically. New serial numbers are appended and cannot exceed received quantity.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-note">Receiving note</Label>
              <Textarea
                id="restock-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional admin note for this stock receipt"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <ImageUploadField
                label="Add restock photos"
                multiple
                onMultipleChange={(values) => setQueuedImages((current) => uniqueImages([...current, ...values]))}
                helperText="Optional. Uploaded photos will be appended to the product gallery."
              />

              {totalQueuedPhotos > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {queuedImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="flex items-center gap-3 rounded-md border p-3">
                      <img src={image} alt={`Queued upload ${index + 1}`} className="h-12 w-12 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">New photo {index + 1}</p>
                        <p className="truncate text-xs text-muted-foreground">Will be appended to the gallery.</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Plus className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Receive stock"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
