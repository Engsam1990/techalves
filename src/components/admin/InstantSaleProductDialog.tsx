import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type SourcePaymentStatus = "pending" | "paid" | "partial" | "waived";

type Source = { id: string; name: string; isActive?: boolean };
type CatalogItem = { id: string; name: string; categoryId?: string; isActive?: boolean };
type Catalog = { categories?: CatalogItem[]; subcategories?: CatalogItem[]; brands?: CatalogItem[] };

type InstantProductPayload = {
  name: string;
  categoryId: string;
  subcategory?: string | null;
  brand: string;
  barcode?: string | null;
  condition: "new" | "refurbished" | "ex-uk";
  description?: string | null;
  warrantyText?: string | null;
  sourceId: string;
  sourcePrice: number;
  sellingPrice: number;
  sourcePaymentStatus: SourcePaymentStatus;
};

type PosProduct = {
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
  sourceId?: string | null;
  sourcePrice?: number;
  sourcePaymentStatus?: SourcePaymentStatus;
  instantProduct?: InstantProductPayload;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (product: PosProduct, quantity: number, serialNumbers?: string[]) => void;
};

type InstantFormState = {
  name: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  barcode: string;
  condition: InstantProductPayload["condition"];
  description: string;
  warrantyText: string;
  sourceId: string;
  sourcePrice: number;
  sellingPrice: number;
  sourcePaymentStatus: SourcePaymentStatus;
  quantity: number;
  serialNumbersText: string;
};

const initialForm: InstantFormState = {
  name: "",
  categoryId: "",
  subcategory: "",
  brand: "",
  barcode: "",
  condition: "new",
  description: "",
  warrantyText: "",
  sourceId: "",
  sourcePrice: 0,
  sellingPrice: 0,
  sourcePaymentStatus: "pending",
  quantity: 1,
  serialNumbersText: "",
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "instant-sale-product";
}

function parseSerialNumbers(value: string) {
  return Array.from(new Set(String(value || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)));
}

function isActive(item: { isActive?: boolean }) {
  return item.isActive !== false;
}

export function InstantSaleProductDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [sources, setSources] = useState<Source[]>([]);
  const [catalog, setCatalog] = useState<Catalog>({});
  const [loading, setLoading] = useState(false);

  const activeSources = useMemo(() => sources.filter(isActive), [sources]);
  const categories = useMemo(() => (catalog.categories || []).filter(isActive), [catalog.categories]);
  const brands = useMemo(() => (catalog.brands || []).filter(isActive), [catalog.brands]);
  const subcategories = useMemo(
    () => (catalog.subcategories || []).filter((item) => isActive(item) && item.categoryId === form.categoryId),
    [catalog.subcategories, form.categoryId]
  );
  const selectedBrand = brands.find((item) => item.id === form.brand);

  const reset = () => setForm(initialForm);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([adminApi.getSources({ active: "1" }), adminApi.getCatalog()])
      .then(([sourceResult, catalogResult]) => {
        if (!active) return;
        setSources(Array.isArray(sourceResult) ? sourceResult : []);
        setCatalog({
          categories: Array.isArray(catalogResult?.categories) ? catalogResult.categories : [],
          subcategories: Array.isArray(catalogResult?.subcategories) ? catalogResult.subcategories : [],
          brands: Array.isArray(catalogResult?.brands) ? catalogResult.brands : [],
        });
      })
      .catch((error: any) => {
        if (!active) return;
        toast({
          title: "Could not load POS options",
          description: error.message || "Confirm suppliers, categories, subcategories, and brands are available.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, toast]);

  const submit = () => {
    const name = form.name.trim();
    const sourcePrice = Number(form.sourcePrice || 0);
    const sellingPrice = Number(form.sellingPrice || 0);
    if (!name) return toast({ title: "Product name required", description: "Enter the instant-sale product name.", variant: "destructive" });
    if (!form.categoryId) return toast({ title: "Category required", description: "Select the product category.", variant: "destructive" });
    if (!form.brand) return toast({ title: "Brand required", description: "Select the product brand.", variant: "destructive" });
    if (!form.sourceId) return toast({ title: "Supplier/source required", description: "Select the supplier/source.", variant: "destructive" });
    if (sourcePrice <= 0) return toast({ title: "Source price required", description: "Enter the supplier/source price.", variant: "destructive" });
    if (sellingPrice <= 0) return toast({ title: "Selling price required", description: "Enter the customer selling price.", variant: "destructive" });
    if (!form.sourcePaymentStatus) return toast({ title: "Source payment status required", variant: "destructive" });
    const rawQuantity = Number(form.quantity || 0);
    if (!Number.isFinite(rawQuantity) || rawQuantity < 1) return toast({ title: "Quantity required", description: "Enter at least 1 unit for the instant-sale product.", variant: "destructive" });

    const serialNumbers = parseSerialNumbers(form.serialNumbersText);
    const quantity = serialNumbers.length ? serialNumbers.length : Math.max(1, Number(form.quantity || 1));
    const payload: InstantProductPayload = {
      name,
      categoryId: form.categoryId,
      subcategory: form.subcategory || null,
      brand: form.brand,
      barcode: form.barcode.trim() || null,
      condition: form.condition,
      description: form.description.trim() || null,
      warrantyText: form.warrantyText.trim() || null,
      sourceId: form.sourceId,
      sourcePrice,
      sellingPrice,
      sourcePaymentStatus: form.sourcePaymentStatus,
    };

    const tempId = `instant-${Date.now()}`;
    onCreated({
      id: tempId,
      name,
      slug: `${slugify(name)}-${tempId.slice(-6)}`,
      brand: selectedBrand?.name || "Instant sale",
      barcode: form.barcode.trim() || null,
      price: sellingPrice,
      stockQuantity: quantity,
      inStock: true,
      images: [],
      availableSerialNumbers: serialNumbers,
      sourceId: form.sourceId,
      sourcePrice,
      sourcePaymentStatus: form.sourcePaymentStatus,
      instantProduct: payload,
    }, quantity, serialNumbers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add instant-sale product</DialogTitle>
          <DialogDescription>
            POS-only product. It is hidden from catalogue/admin product listing, and sourced by is recorded as the logged-in data entrant.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Product name <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Used Dell Latitude charger" />
          </div>
          <div className="space-y-2">
            <Label>Category <span className="text-destructive">*</span></Label>
            <select
              className={selectClassName}
              value={form.categoryId}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value, subcategory: "" }))}
              disabled={loading || !categories.length}
            >
              <option value="">{loading ? "Loading categories..." : categories.length ? "Select category" : "No categories found"}</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <select
              className={selectClassName}
              value={form.subcategory}
              onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))}
              disabled={loading || !form.categoryId || !subcategories.length}
            >
              <option value="">{form.categoryId ? (subcategories.length ? "No subcategory" : "No subcategories for category") : "Choose category first"}</option>
              {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Brand <span className="text-destructive">*</span></Label>
            <select
              className={selectClassName}
              value={form.brand}
              onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
              disabled={loading || !brands.length}
            >
              <option value="">{loading ? "Loading brands..." : brands.length ? "Select brand" : "No brands found"}</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input value={form.barcode} onChange={(event) => setForm((current) => ({ ...current, barcode: event.target.value }))} placeholder="Optional barcode" />
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <select
              className={selectClassName}
              value={form.condition}
              onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value as InstantFormState["condition"] }))}
            >
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
              <option value="ex-uk">Ex-UK</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Supplier / source <span className="text-destructive">*</span></Label>
            <select
              className={selectClassName}
              value={form.sourceId}
              onChange={(event) => setForm((current) => ({ ...current, sourceId: event.target.value }))}
              disabled={loading || !activeSources.length}
            >
              <option value="">{loading ? "Loading suppliers..." : activeSources.length ? "Select supplier/source" : "No suppliers found"}</option>
              {activeSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Source price <span className="text-destructive">*</span></Label>
            <Input type="number" min={1} value={form.sourcePrice} onChange={(event) => setForm((current) => ({ ...current, sourcePrice: Number(event.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Selling price <span className="text-destructive">*</span></Label>
            <Input type="number" min={1} value={form.sellingPrice} onChange={(event) => setForm((current) => ({ ...current, sellingPrice: Number(event.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Source payment status <span className="text-destructive">*</span></Label>
            <select
              className={selectClassName}
              value={form.sourcePaymentStatus}
              onChange={(event) => setForm((current) => ({ ...current, sourcePaymentStatus: event.target.value as SourcePaymentStatus }))}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Quantity <span className="text-destructive">*</span></Label>
            <Input required type="number" min={1} value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Math.max(1, Number(event.target.value) || 1) }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Serial numbers</Label>
            <Textarea value={form.serialNumbersText} onChange={(event) => setForm((current) => ({ ...current, serialNumbersText: event.target.value }))} placeholder="Optional. One serial number per line or comma-separated." rows={4} />
            <p className="text-xs text-muted-foreground">When serials are entered, quantity is set from the number of serials.</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Optional internal/product note" rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={submit}>Add to sale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
