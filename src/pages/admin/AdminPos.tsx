import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { formatPrice } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, ScanLine, ShoppingCart, Trash2 } from "lucide-react";
import { PosReceiptPrinter } from "@/components/admin/PosReceiptPrinter";
import { InstantSaleProductDialog } from "@/components/admin/InstantSaleProductDialog";

type PosPaymentStatus = "paid" | "pending";
type PosPaymentMethod = "cash" | "mpesa" | "card" | "bank_transfer" | "other";

interface PosProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  barcode?: string | null;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  images?: string[];
  availableSerialNumbers?: string[];
  sourcePrice?: number;
  sourcedFrom?: string | null;
  sourcedBy?: string | null;
  sourceDate?: string | null;
  sourcingPaymentStatus?: string;
  sourceId?: string | null;
  sourcePaymentStatus?: string;
  instantProduct?: any;
}

interface PosLineItem {
  product: PosProduct;
  quantity: number;
  serialNumbers: string[];
}

interface PosOrderSummary {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionReference?: string | null;
  discountAmount?: number;
  otherCharges?: number;
  subtotalAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount: number;
}

const paymentMethodOptions: Array<{ value: PosPaymentMethod; label: string }> = [
  { value: "cash", label: "Cash" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
];

const methodsRequiringTransactionReference = new Set<PosPaymentMethod>(["mpesa", "card", "bank_transfer"]);

const defaultSaleForm = {
  paymentStatus: "paid" as PosPaymentStatus,
  paymentMethod: "cash" as PosPaymentMethod,
  transactionReference: "",
  discountAmount: 0,
  otherCharges: 0,
  customerName: "",
  customerPhone: "",
  note: "",
  vatEnabled: false,
  vatRate: 16,
};

function getMatchScore(product: PosProduct, needle: string) {
  const name = String(product.name || "").toLowerCase();
  const brand = String(product.brand || "").toLowerCase();
  const barcode = String(product.barcode || "").toLowerCase();
  const slug = String(product.slug || "").toLowerCase();
  const id = String(product.id || "").toLowerCase();

  if (!needle) return 0;
  if (barcode && barcode === needle) return 120;
  if (slug === needle || id === needle || name === needle) return 100;
  if (barcode.startsWith(needle)) return 80;
  if (name.startsWith(needle)) return 60;
  if (brand.startsWith(needle)) return 40;
  if ([name, brand, barcode, slug, id].some((value) => value.includes(needle))) return 20;
  return 0;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function paymentNeedsTransactionReference(paymentMethod: PosPaymentMethod, paymentStatus: PosPaymentStatus) {
  return methodsRequiringTransactionReference.has(paymentMethod) && paymentStatus === "paid";
}

function getPaymentMethodLabel(value: PosPaymentMethod) {
  return paymentMethodOptions.find((option) => option.value === value)?.label || value;
}

function serialValue(serial: unknown) {
  if (serial && typeof serial === "object" && "serialNumber" in serial) {
    return String((serial as { serialNumber?: string }).serialNumber || "");
  }
  return String(serial || "");
}

function productSerials(product: PosProduct) {
  return Array.from(new Set((product.availableSerialNumbers || []).map(serialValue).map((value) => value.trim()).filter(Boolean)));
}

function normalizeSerialSelections(serialNumbers: string[], quantity: number, requiresSerialSelection: boolean) {
  if (!requiresSerialSelection) {
    return [];
  }

  return Array.from(new Set(serialNumbers.map((serial) => serial.trim()).filter(Boolean))).slice(0, quantity);
}

function hasCompleteSerialSelections(product: PosProduct, quantity: number, serialNumbers: string[]) {
  if (!productSerials(product).length) {
    return true;
  }

  const trimmedSerials = Array.from(new Set(serialNumbers.map((serial) => serial.trim()).filter(Boolean)));
  return trimmedSerials.length > 0 && trimmedSerials.length === quantity;
}

function formatSerialPreview(serialNumbers: string[], maxDisplay = 2) {
  const uniqueSerials = Array.from(new Set(serialNumbers.map((serial) => serial.trim()).filter(Boolean)));

  if (!uniqueSerials.length) {
    return "Select serials";
  }

  if (uniqueSerials.length <= maxDisplay) {
    return uniqueSerials.join(", ");
  }

  return `${uniqueSerials.slice(0, maxDisplay).join(", ")} +${uniqueSerials.length - maxDisplay} more`;
}

const AdminPos = () => {
  const { toast } = useToast();
  const scanInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PosLineItem[]>([]);
  const [saleForm, setSaleForm] = useState(defaultSaleForm);
  const [lastSale, setLastSale] = useState<PosOrderSummary | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showInstantSaleModal, setShowInstantSaleModal] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: Array<{ product: PosProduct; quantity: number; serialNumbers: string[] }>;
    orderSummary: PosOrderSummary | null;
    saleForm: typeof defaultSaleForm;
    totalAmount: number;
  } | null>(null);
  const [serialSearchQueries, setSerialSearchQueries] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const result = await adminApi.getProducts();
        if (active) {
          setProducts(Array.isArray(result) ? result : []);
        }
      } catch (error: unknown) {
        if (active) {
          toast({ title: "Error", description: getErrorMessage(error, "Could not load products for POS"), variant: "destructive" });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!loading) {
      scanInputRef.current?.focus();
    }
  }, [loading]);

  const exactMatch = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return null;

    const exactBarcodeMatches = products.filter((product) => String(product.barcode || "").trim().toLowerCase() === needle);
    if (exactBarcodeMatches.length === 1) return exactBarcodeMatches[0];

    const exactNameMatches = products.filter((product) => String(product.name || "").trim().toLowerCase() === needle);
    if (exactNameMatches.length === 1) return exactNameMatches[0];

    return null;
  }, [products, query]);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    return [...products]
      .map((product) => ({
        product,
        score: getMatchScore(product, needle),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, 8)
      .map((item) => item.product);
  }, [products, query]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const appliedDiscountAmount = useMemo(
    () => Math.min(Math.max(Number(saleForm.discountAmount || 0), 0), totalAmount),
    [saleForm.discountAmount, totalAmount]
  );
  const appliedOtherCharges = useMemo(() => Math.max(0, Number(saleForm.otherCharges || 0)), [saleForm.otherCharges]);
  const taxableSubtotal = useMemo(
    () => Math.max(0, totalAmount - appliedDiscountAmount + appliedOtherCharges),
    [appliedDiscountAmount, appliedOtherCharges, totalAmount]
  );
  const vatAmount = useMemo(
    () => saleForm.vatEnabled ? Math.round(taxableSubtotal * (Number(saleForm.vatRate || 16) / 100)) : 0,
    [saleForm.vatEnabled, saleForm.vatRate, taxableSubtotal]
  );
  const netTotalAmount = useMemo(
    () => taxableSubtotal + vatAmount,
    [taxableSubtotal, vatAmount]
  );
  const serialTrackedLineItems = useMemo(() => items.filter((item) => productSerials(item.product).length > 0).length, [items]);
  const showTransactionReference = useMemo(() => methodsRequiringTransactionReference.has(saleForm.paymentMethod), [saleForm.paymentMethod]);
  const transactionReferenceRequired = useMemo(
    () => paymentNeedsTransactionReference(saleForm.paymentMethod, saleForm.paymentStatus),
    [saleForm.paymentMethod, saleForm.paymentStatus]
  );

  const focusScanner = () => {
    scanInputRef.current?.focus();
    scanInputRef.current?.select();
  };

  const addProductToSale = (product: PosProduct) => {
    const serialsAvailable = productSerials(product).length > 0;
    if (!serialsAvailable && (!product.inStock || Number(product.stockQuantity || 0) <= 0)) {
      toast({ title: "Out of stock", description: `${product.name} is not available right now`, variant: "destructive" });
      focusScanner();
      return;
    }

    let hitStockLimit = false;
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) {
        return [
          ...current,
          {
            product,
            quantity: productSerials(product).length > 0 ? 0 : 1,
            serialNumbers: normalizeSerialSelections([], productSerials(product).length > 0 ? 0 : 1, productSerials(product).length > 0),
          },
        ];
      }

      if (productSerials(product).length > 0) {
        return current;
      }

      const nextQuantity = existing.quantity + 1;
      if (nextQuantity > Number(product.stockQuantity || 0)) {
        hitStockLimit = true;
        return current;
      }

      return current.map((item) => {
        if (item.product.id !== product.id) return item;
        const nextSerialNumbers = normalizeSerialSelections(item.serialNumbers, nextQuantity, productSerials(item.product).length > 0);
        return { ...item, quantity: nextQuantity, serialNumbers: nextSerialNumbers };
      });
    });

    if (hitStockLimit) {
      toast({
        title: "Stock limit reached",
        description: `Only ${product.stockQuantity} unit(s) available for ${product.name}`,
        variant: "destructive",
      });
      focusScanner();
      return;
    }

    setQuery("");
    focusScanner();
  };

  const addInstantProductToSale = (product: PosProduct, quantity: number, serialNumbers: string[] = []) => {
    const uniqueSerials = Array.from(new Set(serialNumbers.map((serial) => serial.trim()).filter(Boolean)));
    const safeQuantity = uniqueSerials.length ? uniqueSerials.length : Math.max(1, Number(quantity || 1));
    const nextProduct: PosProduct = {
      ...product,
      stockQuantity: Math.max(Number(product.stockQuantity || 0), safeQuantity),
      inStock: true,
      availableSerialNumbers: uniqueSerials.length ? uniqueSerials : product.availableSerialNumbers || [],
    };

    setProducts((current) => [nextProduct, ...current.filter((item) => item.id !== nextProduct.id)]);
    setItems((current) => [
      ...current.filter((item) => item.product.id !== nextProduct.id),
      { product: nextProduct, quantity: safeQuantity, serialNumbers: uniqueSerials },
    ]);
    setQuery("");
    focusScanner();
  };

  const handleScanSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const resolvedProduct = exactMatch || (suggestions.length === 1 ? suggestions[0] : null);
    if (!resolvedProduct) {
      toast({
        title: suggestions.length > 1 ? "Multiple products found" : "Product not found",
        description: suggestions.length > 1 ? "Select the correct product from the results below." : "Scan the barcode or type the exact product name.",
        variant: "destructive",
      });
      focusScanner();
      return;
    }

    addProductToSale(resolvedProduct);
  };

  const changeQuantity = (productId: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      setItems((current) => current.filter((item) => item.product.id !== productId));
      focusScanner();
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.product.id !== productId) return item;
        const clamped = Math.min(nextQuantity, Number(item.product.stockQuantity || 0));
        return {
          ...item,
          quantity: clamped,
          serialNumbers: normalizeSerialSelections(item.serialNumbers, clamped, productSerials(item.product).length > 0),
        };
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
    focusScanner();
  };

  const updateItemSerial = (productId: string, serialNumber: string, checked: boolean) => {
    setItems((current) =>
      current.map((item) => {
        if (item.product.id !== productId) return item;
        const serialLimit = productSerials(item.product).length;
        const currentSerials = normalizeSerialSelections(item.serialNumbers, serialLimit, serialLimit > 0);

        if (checked) {
          if (currentSerials.includes(serialNumber) || currentSerials.length >= serialLimit) {
            return item;
          }

          const nextSerialNumbers = [...currentSerials, serialNumber];
          return { ...item, serialNumbers: nextSerialNumbers, quantity: nextSerialNumbers.length };
        }

        const nextSerialNumbers = currentSerials.filter((serial) => serial !== serialNumber);
        return { ...item, serialNumbers: nextSerialNumbers, quantity: nextSerialNumbers.length };
      })
    );
  };

  const handleCheckout = async () => {
    if (totalItems <= 0) {
      toast({ title: "No products selected", description: "Scan or add at least one product before recording a sale.", variant: "destructive" });
      focusScanner();
      return;
    }
    if (transactionReferenceRequired && !saleForm.transactionReference.trim()) {
      toast({
        title: "Transaction reference required",
        description: "Enter the payment transaction reference for paid M-Pesa, card, or bank transfer sales.",
        variant: "destructive",
      });
      return;
    }
    const itemMissingSerials = items.find((item) => !hasCompleteSerialSelections(item.product, item.quantity, item.serialNumbers));
    if (itemMissingSerials) {
      toast({
        title: "Serial numbers required",
        description: `Select a serial number for each unit of ${itemMissingSerials.product.name} before checkout.`,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const response = await adminApi.createPosSale({
        items: items.map((item) => item.product.instantProduct
          ? { quantity: item.quantity, serialNumbers: item.serialNumbers.map((serial) => serial.trim()).filter(Boolean), instantProduct: item.product.instantProduct }
          : { productId: item.product.id, quantity: item.quantity, serialNumbers: item.serialNumbers.map((serial) => serial.trim()).filter(Boolean) }
        ),
        paymentStatus: saleForm.paymentStatus,
        paymentMethod: saleForm.paymentMethod,
        transactionReference: showTransactionReference ? saleForm.transactionReference.trim() || undefined : undefined,
        discountAmount: appliedDiscountAmount,
        otherCharges: appliedOtherCharges,
        customerName: saleForm.customerName.trim() || undefined,
        customerPhone: saleForm.customerPhone.trim() || undefined,
        note: saleForm.note.trim() || undefined,
        vatEnabled: Boolean(saleForm.vatEnabled),
        vatRate: Number(saleForm.vatRate || 16),
      });

      const soldQuantities = new Map(items.map((item) => [item.product.id, item.quantity]));
      const soldSerials = new Map(items.map((item) => [item.product.id, new Set(item.serialNumbers)]));
      setProducts((current) =>
        current.map((product) => {
          const sold = soldQuantities.get(product.id);
          if (!sold) return product;
          const nextStock = Math.max(0, Number(product.stockQuantity || 0) - sold);
          const serialsForProduct = soldSerials.get(product.id) || new Set<string>();
          const availableSerialNumbers = (product.availableSerialNumbers || [])
            .map((serial) => serialValue(serial))
            .filter((serial): serial is string => Boolean(serial))
            .filter((serial) => !serialsForProduct.has(serial));

          return {
            ...product,
            stockQuantity: nextStock,
            inStock: nextStock > 0,
            availableSerialNumbers,
          };
        })
      );

      // Show receipt modal before clearing form
      setReceiptData({
        items: items.map(({ product, quantity, serialNumbers }) => ({ product, quantity, serialNumbers })),
        orderSummary: response.order || null,
        saleForm,
        totalAmount,
      });
      setShowReceiptModal(true);

      setItems([]);
      setQuery("");
      setSaleForm((current) => ({
        ...current,
        transactionReference: "",
        discountAmount: 0,
        otherCharges: 0,
        customerName: "",
        customerPhone: "",
        note: "",
        vatEnabled: current.vatEnabled,
        vatRate: current.vatRate,
      }));
      setLastSale(response.order || null);
      toast({ title: "Sale recorded", description: response.message || "POS sale saved successfully" });
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error, "Could not record POS sale"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-[560px] w-full rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">POS</h2>
        <p className="text-muted-foreground">Scan a barcode or search by product name, then record the sale and update stock immediately.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ScanLine className="h-5 w-5" />
                Scan Or Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleScanSubmit}>
                <Input
                  ref={scanInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    const resolvedProduct = exactMatch || (suggestions.length === 1 ? suggestions[0] : null);
                    if (resolvedProduct) {
                      event.preventDefault();
                      addProductToSale(resolvedProduct);
                    }
                  }}
                  placeholder="Scan barcode or type product name"
                  className="md:flex-1"
                />
                <div className="flex gap-2 md:w-auto">
                  <Button type="submit" className="flex-1 md:flex-none">Add to sale</Button>
                  <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={() => setShowInstantSaleModal(true)}>
                    Add instant sale
                  </Button>
                </div>
              </form>

              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Scanner tip: most barcode scanners type the code and press Enter automatically, so this field is ready for scan-and-add.
              </div>

              {query.trim() ? (
                <div className="space-y-3">
                  {exactMatch ? (
                    <button
                      key={exactMatch.id}
                      type="button"
                      onClick={() => addProductToSale(exactMatch)}
                      className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div>
                        {exactMatch.images?.[0] ? (
                          <img src={exactMatch.images[0]} alt={exactMatch.name} className="h-16 w-16 rounded-lg border object-cover" />
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{exactMatch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exactMatch.brand}
                          {exactMatch.barcode ? ` • ${exactMatch.barcode}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(exactMatch.price)}</p>
                        <p className="text-xs text-muted-foreground">{exactMatch.stockQuantity} in stock</p>
                      </div>
                    </button>
                  ) : suggestions.length ? (
                    <>
                      {suggestions.length > 1 ? (
                        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                          Multiple products match this search. Select the correct one below.
                        </div>
                      ) : null}
                      <div className="space-y-2">
                        {suggestions.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProductToSale(product)}
                            className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                          >
                            <div>
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="h-16 w-16 rounded-lg border object-cover" />
                              ) : null}
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.brand}
                                {product.barcode ? ` • ${product.barcode}` : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(product.price)}</p>
                              <p className="text-xs text-muted-foreground">{product.stockQuantity} in stock</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      No matching products found for this barcode or product name.
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Current Sale
                <span className="ml-auto text-sm font-normal text-destructive">* Items required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length ? (
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const availableSerialNumbers = productSerials(item.product);
                    const selectedSerialCount = item.serialNumbers.filter(Boolean).length;
                    const hasSerialTracking = availableSerialNumbers.length > 0;
                    const serialSearchQuery = String(serialSearchQueries[item.product.id] || "").trim().toLowerCase();
                    const filteredSerialNumbers = serialSearchQuery
                      ? availableSerialNumbers.filter((serial) => serial.toLowerCase().includes(serialSearchQuery))
                      : availableSerialNumbers;

                    return (
                      <div
                        key={item.product.id}
                        className="overflow-hidden rounded-lg border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start gap-2.5">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-12 w-12 shrink-0 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-center text-[9px] leading-tight text-muted-foreground">
                              No image
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold leading-4">{item.product.name}</p>
                                <p className="truncate text-[11px] leading-4 text-muted-foreground">
                                  {item.product.brand}
                                  {item.product.barcode ? ` • ${item.product.barcode}` : ""}
                                </p>
                                {!hasSerialTracking && (
                                  <>
                                <span className="rounded-full bg-muted mx-1 px-2 py-0.5 text-[10px] leading-none text-muted-foreground">
                                  Std
                                </span>
                                <span className="rounded-full bg-muted mx-1 px-2 py-0.5 text-[10px] leading-none text-muted-foreground">
                                  Stock {item.product.stockQuantity}
                                </span>
                                </>
                                )}
                              </div>

                              <div className="text-right">
                                {!hasSerialTracking && (
                                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">

                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-7 w-7 rounded-full p-0"
                                        onClick={() => changeQuantity(item.product.id, item.quantity - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <div className="min-w-6 text-center text-xs font-semibold">{item.quantity}</div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-7 w-7 rounded-full p-0"
                                        onClick={() => changeQuantity(item.product.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.product.stockQuantity}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                <p className="text-xs font-semibold leading-4">
                                  {formatPrice(item.product.price)} * {`${item.quantity} pcs`}
                                </p>
                                <p className="max-w-[140px] text-[14px] leading-4 text-muted-foreground">
                                  {formatPrice(item.product.price * item.quantity)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {hasSerialTracking && (
                                <>
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground">
                                Serial
                              </span>
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground">
                                Stock {item.product.stockQuantity}
                              </span>
                              </>
                              )}
                              {hasSerialTracking && item.serialNumbers.length ? (
                                <span className="max-w-[180px] truncate rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground">
                                  {item.serialNumbers.join(", ")}
                                </span>
                              ) : null}
                            </div>

                            {hasSerialTracking && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button type="button" variant="outline" className="h-7 w-full justify-between px-2 text-[11px]">
                                    <span>Serials</span>
                                    <span className="max-w-[180px] truncate text-[10px] text-muted-foreground">
                                      {item.serialNumbers.length ? item.serialNumbers.join(", ") : "Select serials"}
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-80">
                                  <div className="space-y-2 p-2">
                                    <DropdownMenuLabel className="px-0">Choose serial numbers</DropdownMenuLabel>
                                    <Input
                                      value={serialSearchQueries[item.product.id] || ""}
                                      onChange={(event) =>
                                        setSerialSearchQueries((current) => ({
                                          ...current,
                                          [item.product.id]: event.target.value,
                                        }))
                                      }
                                      placeholder="Search serial numbers"
                                      className="h-8"
                                    />
                                    <DropdownMenuSeparator />
                                    <div className="max-h-56 space-y-1 overflow-y-auto">
                                      {filteredSerialNumbers.length ? (
                                        filteredSerialNumbers.map((serial) => {
                                          const checked = item.serialNumbers.includes(serial);
                                          const disabled = !checked && selectedSerialCount >= availableSerialNumbers.length;

                                          return (
                                            <DropdownMenuItem
                                              key={`${item.product.id}-serial-${serial}`}
                                              disabled={disabled}
                                              onSelect={(event) => {
                                                event.preventDefault();
                                                updateItemSerial(item.product.id, serial, !checked);
                                              }}
                                              className="flex cursor-pointer items-center justify-between"
                                            >
                                              <span>{serial}</span>
                                              {checked ? <span className="text-xs text-primary">Selected</span> : null}
                                            </DropdownMenuItem>
                                          );
                                        })
                                      ) : (
                                        <div className="px-2 py-2 text-sm text-muted-foreground">No matching serials found</div>
                                      )}
                                    </div>
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeItem(item.product.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">No products in this sale yet</p>
                    <p>Scan a barcode or search above to add items to the current sale.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Payment And Checkout</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label>
                    Payment status
                    <span className="ml-1 text-destructive">*</span>
                  </Label>
                  <Select
                    value={saleForm.paymentStatus}
                    onValueChange={(value: PosPaymentStatus) => setSaleForm((current) => ({ ...current, paymentStatus: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Payment method
                    <span className="ml-1 text-destructive">*</span>
                  </Label>
                  <Select
                    value={saleForm.paymentMethod}
                    onValueChange={(value: PosPaymentMethod) =>
                      setSaleForm((current) => ({
                        ...current,
                        paymentMethod: value,
                        transactionReference: methodsRequiringTransactionReference.has(value) ? current.transactionReference : "",
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showTransactionReference ? (
                <div className="space-y-2">
                  <Label>
                    Transaction reference
                    {transactionReferenceRequired ? <span className="ml-1 text-destructive">*</span> : null}
                  </Label>
                  <Input
                    value={saleForm.transactionReference}
                    onChange={(event) => setSaleForm((current) => ({ ...current, transactionReference: event.target.value }))}
                    placeholder="Enter M-Pesa, card, or bank reference"
                  />
                  <p className="text-xs text-muted-foreground">
                    {transactionReferenceRequired
                      ? "Required because this sale is marked as paid."
                      : "Optional while the payment is still pending."}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Customer name</Label>
                <Input
                  value={saleForm.customerName}
                  onChange={(event) => setSaleForm((current) => ({ ...current, customerName: event.target.value }))}
                  placeholder="Optional walk-in customer name"
                />
              </div>

              <div className="space-y-2">
                <Label>Customer phone</Label>
                <Input
                  value={saleForm.customerPhone}
                  onChange={(event) => setSaleForm((current) => ({ ...current, customerPhone: event.target.value }))}
                  placeholder="Optional phone number"
                />
              </div>

              <div className="space-y-2">
                <Label>Sale note</Label>
                <Textarea
                  value={saleForm.note}
                  onChange={(event) => setSaleForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Optional internal note for this POS sale"
                  rows={4}
                />
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{paymentMethodOptions.find((option) => option.value === saleForm.paymentMethod)?.label}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={saleForm.discountAmount}
                      onChange={(event) =>
                        setSaleForm((current) => ({
                          ...current,
                          discountAmount: Number(event.target.value) || 0,
                        }))
                      }
                      className="h-8 w-28 text-right"
                      placeholder="0.00"
                    />
                    <span className="min-w-20 text-right">{appliedDiscountAmount > 0 ? `-${formatPrice(appliedDiscountAmount)}` : "No"}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Other charges</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={saleForm.otherCharges}
                      onChange={(event) =>
                        setSaleForm((current) => ({
                          ...current,
                          otherCharges: Number(event.target.value) || 0,
                        }))
                      }
                      className="h-8 w-28 text-right"
                      placeholder="0.00"
                    />
                    <span className="min-w-20 text-right">{appliedOtherCharges > 0 ? `+${formatPrice(appliedOtherCharges)}` : "No"}</span>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Label htmlFor="pos-vat" className="flex cursor-pointer items-center gap-2 font-normal">
                      <Checkbox
                        id="pos-vat"
                        checked={Boolean(saleForm.vatEnabled)}
                        onCheckedChange={(checked) => setSaleForm((current) => ({ ...current, vatEnabled: Boolean(checked), vatRate: current.vatRate || 16 }))}
                      />
                      Add VAT
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={saleForm.vatRate}
                        onChange={(event) => setSaleForm((current) => ({ ...current, vatRate: Number(event.target.value) || 0 }))}
                        disabled={!saleForm.vatEnabled}
                        className="h-8 w-20 text-right"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">VAT amount</span>
                    <span>{vatAmount > 0 ? formatPrice(vatAmount) : "No"}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-lg font-display font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(netTotalAmount)}</span>
                </div>
              </div>

              <Button variant="highlight" className="w-full" onClick={handleCheckout} disabled={!items.length || saving}>
                {saving ? "Recording sale..." : "Record sale and update inventory"}
              </Button>

              <div className="text-xs text-muted-foreground">
                Recording a POS sale deducts inventory immediately. If you later cancel the order from Orders, stock can be restored there.
              </div>
            </CardContent>
          </Card>

          {lastSale ? (
            <Card>
              <CardHeader><CardTitle className="text-lg">Last Sale</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Order:</span> #{String(lastSale.id).slice(0, 8).toUpperCase()}</p>
                <p><span className="font-medium">Status:</span> {lastSale.status}</p>
                <p><span className="font-medium">Payment:</span> {String(lastSale.paymentMethod || "").replace(/_/g, " ")} ({lastSale.paymentStatus})</p>
                <p><span className="font-medium">Discount:</span> {Number(lastSale.discountAmount || 0) > 0 ? `-${formatPrice(Number(lastSale.discountAmount || 0))}` : "No"}</p>
                <p><span className="font-medium">Other charges:</span> {Number(lastSale.otherCharges || 0) > 0 ? `+${formatPrice(Number(lastSale.otherCharges || 0))}` : "No"}</p>
                {lastSale.transactionReference ? <p><span className="font-medium">Reference:</span> {lastSale.transactionReference}</p> : null}
                <p><span className="font-medium">Total:</span> {formatPrice(Number(lastSale.totalAmount || 0))}</p>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/orders/${lastSale.id}`}>Open order</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <InstantSaleProductDialog
        open={showInstantSaleModal}
        onOpenChange={setShowInstantSaleModal}
        onCreated={addInstantProductToSale}
      />

      {showReceiptModal && receiptData && (
        <PosReceiptPrinter
          items={receiptData.items}
          orderSummary={receiptData.orderSummary}
          saleForm={receiptData.saleForm}
          totalAmount={receiptData.totalAmount}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptData(null);
            focusScanner();
          }}
        />
      )}
    </div>
  );
};

export default AdminPos;
