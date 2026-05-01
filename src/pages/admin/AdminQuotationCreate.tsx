import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Eye, FileText, Plus, Printer, Trash2 } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";
import logo from "@assets/logo.png";

type ProductOption = {
  id: string;
  name: string;
  brand?: string | null;
  price?: number;
  stockQuantity?: number;
};

type QuoteItem = {
  id: string;
  productId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

const today = new Date().toISOString().slice(0, 10);

function nextMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function AdminQuotationCreate() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [quoteNumber, setQuoteNumber] = useState(`Q-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", company: "", address: "" });
  const [quoteDate, setQuoteDate] = useState(today);
  const [validUntil, setValidUntil] = useState(nextMonth());
  const [vatRate, setVatRate] = useState(16);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("Prices are valid until the date shown above and subject to stock availability.");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    adminApi.getProducts()
      .then((rows) => setProducts(Array.isArray(rows) ? rows : []))
      .catch((error: any) => toast.error(error.message || "Could not load products"))
      .finally(() => setLoadingProducts(false));
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const taxable = Math.max(0, subtotal - safeDiscount);
    const vat = taxable * (Math.max(0, Number(vatRate) || 0) / 100);
    return { subtotal, discount: safeDiscount, vat, total: taxable + vat };
  }, [discount, items, vatRate]);

  const addSelectedProduct = () => {
    const product = products.find((item) => item.id === selectedProductId);
    if (!product) return;
    setItems((current) => [
      ...current,
      {
        id: makeId(),
        productId: product.id,
        name: product.name,
        description: [product.brand, product.stockQuantity !== undefined ? `${product.stockQuantity} in stock` : ""].filter(Boolean).join(" - "),
        quantity: 1,
        unitPrice: Number(product.price || 0),
      },
    ]);
    setSelectedProductId("");
  };

  const addCustomItem = () => {
    setItems((current) => [
      ...current,
      { id: makeId(), name: "Custom item", description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const updateItem = (id: string, patch: Partial<QuoteItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const printQuote = () => {
    if (!customer.name.trim()) {
      toast.error("Add the customer name before printing");
      return;
    }
    if (!items.length) {
      toast.error("Add at least one quotation item");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Create quotation</h2>
          <p className="text-muted-foreground">Prepare customer quotes with product lines, VAT, discounts, and a print-ready summary.</p>
        </div>
        <Button onClick={() => setPreviewOpen(true)} className="w-full sm:w-auto">
          <Eye className="mr-2 h-4 w-4" />
          Preview quotation
        </Button>
      </div>

      <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" /> Quote details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Quote number"><Input value={quoteNumber} onChange={(event) => setQuoteNumber(event.target.value)} /></Field>
              <Field label="Quote date"><Input type="date" value={quoteDate} onChange={(event) => setQuoteDate(event.target.value)} /></Field>
              <Field label="Valid until"><Input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Customer</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Customer name"><Input value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} /></Field>
              <Field label="Company"><Input value={customer.company} onChange={(event) => setCustomer((current) => ({ ...current, company: event.target.value }))} /></Field>
              <Field label="Email"><Input type="email" value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} /></Field>
              <Field label="Phone"><Input value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} /></Field>
              <Field label="Address" className="md:col-span-2"><Textarea value={customer.address} onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))} rows={3} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  disabled={loadingProducts}
                >
                  <option value="">{loadingProducts ? "Loading products..." : "Select product"}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} - {formatPrice(Number(product.price || 0))}</option>
                  ))}
                </select>
                <Button type="button" onClick={addSelectedProduct} disabled={!selectedProductId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add product
                </Button>
                <Button type="button" variant="outline" onClick={addCustomItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Custom
                </Button>
              </div>

              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div key={item.id} className="space-y-3 rounded-lg border p-3">
                    <Field label="Item"><Input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} /></Field>
                    <Field label="Description"><Input value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Qty"><Input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} /></Field>
                      <Field label="Unit price"><Input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(item.id, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} /></Field>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t pt-3">
                      <p className="font-semibold">{formatPrice(item.quantity * item.unitPrice)}</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {!items.length ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No quotation items yet.</div> : null}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-56">Item</TableHead>
                      <TableHead className="min-w-48">Description</TableHead>
                      <TableHead className="w-28">Qty</TableHead>
                      <TableHead className="w-36">Unit price</TableHead>
                      <TableHead className="w-32 text-right">Total</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell><Input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} /></TableCell>
                        <TableCell><Input value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} /></TableCell>
                        <TableCell><Input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} /></TableCell>
                        <TableCell><Input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(item.id, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} /></TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(item.quantity * item.unitPrice)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!items.length ? (
                      <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No quotation items yet.</TableCell></TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Discount">
                  <Input type="number" min="0" value={discount} onChange={(event) => setDiscount(Math.max(0, Number(event.target.value) || 0))} />
                </Field>
                <Field label="VAT rate (%)">
                  <Input type="number" min="0" value={vatRate} onChange={(event) => setVatRate(Math.max(0, Number(event.target.value) || 0))} />
                </Field>
              </div>
              <Field label="Notes"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="min-h-28" /></Field>
            </CardContent>
          </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl overflow-y-auto p-0 sm:w-full">
          <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <DialogTitle>Quotation preview</DialogTitle>
              <Button onClick={printQuote} size="sm" className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" />
                Print quotation
              </Button>
            </div>
          </DialogHeader>
          <div className="p-3 sm:p-6">
            <QuotePreview
              quoteNumber={quoteNumber}
              quoteDate={quoteDate}
              validUntil={validUntil}
              customer={customer}
              items={items}
              notes={notes}
              totals={totals}
              vatRate={vatRate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function QuotePreview({
  quoteNumber,
  quoteDate,
  validUntil,
  customer,
  items,
  notes,
  totals,
  vatRate,
}: {
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  customer: { name: string; email: string; phone: string; company: string; address: string };
  items: QuoteItem[];
  notes: string;
  totals: { subtotal: number; discount: number; vat: number; total: number };
  vatRate: number;
}) {
  return (
    <Card className="min-w-0 print:border-0 print:shadow-none">
      <CardContent className="space-y-6 p-5 sm:p-8 print:p-0">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <img src={logo} alt="TECHALVES" className="h-10" />
            <p className="mt-3 text-sm text-muted-foreground">TECHALVES Solutions</p>
            <p className="text-sm text-muted-foreground">Nairobi, Kenya</p>
          </div>
          <div className="sm:text-right">
            <h3 className="text-2xl font-display font-bold">Quotation</h3>
            <p className="mt-1 break-words text-sm text-muted-foreground">{quoteNumber}</p>
            <p className="text-sm text-muted-foreground">Date: {quoteDate || "-"}</p>
            <p className="text-sm text-muted-foreground">Valid until: {validUntil || "-"}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Prepared for</p>
            <p className="mt-1 break-words font-semibold">{customer.name || "Customer name"}</p>
            {customer.company ? <p className="break-words text-sm text-muted-foreground">{customer.company}</p> : null}
            {customer.email ? <p className="break-words text-sm text-muted-foreground">{customer.email}</p> : null}
            {customer.phone ? <p className="break-words text-sm text-muted-foreground">{customer.phone}</p> : null}
            {customer.address ? <p className="whitespace-pre-line text-sm text-muted-foreground">{customer.address}</p> : null}
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium">{item.name}</p>
                  {item.description ? <p className="break-words text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
                <p className="shrink-0 font-semibold">{formatPrice(item.quantity * item.unitPrice)}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.unitPrice)}</p>
            </div>
          ))}
          {!items.length ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Quotation items will appear here.</div> : null}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="break-words font-medium">{item.name}</p>
                    {item.description ? <p className="break-words text-xs text-muted-foreground">{item.description}</p> : null}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatPrice(item.quantity * item.unitPrice)}</TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Quotation items will appear here.</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="ml-auto w-full max-w-sm space-y-2 text-sm">
          <TotalRow label="Subtotal" value={totals.subtotal} />
          <TotalRow label="Discount" value={-totals.discount} />
          <TotalRow label={`VAT (${vatRate || 0}%)`} value={totals.vat} />
          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-right">{formatPrice(totals.total)}</span>
          </div>
        </div>

        {notes ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground print:bg-transparent">
            <p className="font-medium text-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-line break-words">{notes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{formatPrice(value)}</span>
    </div>
  );
}
