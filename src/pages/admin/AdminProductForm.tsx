import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, GripVertical, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission, type AdminPermission } from "@/lib/adminPermissions";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const defaultForm = {
  name: "",
  slug: "",
  categoryId: "",
  subcategory: "",
  brand: "",
  barcode: "",
  price: 0,
  originalPrice: 0,
  condition: "new",
  description: "",
  warrantyText: "",
  stockQuantity: 0,
  restockAmount: 0,
  featured: false,
  premium: false,
  images: [] as string[],
  specs: {} as Record<string, string>,
  serialNumbersText: "",
  sourceId: "",
  sourcedFrom: "",
  sourcedBy: "",
  sourceDate: "",
  sourcePrice: 0,
  sourcePaymentStatus: "pending",
  sourcingPaymentStatus: "pay_later",
};

type ProductFormState = typeof defaultForm;
type ProductSection = "basic" | "serial_numbers" | "pricing_stock" | "sources_supplier" | "images";

const PRODUCT_DRAFT_PREFIX = "techalves:admin-product-form:draft:";

const productSectionPermissions: Record<ProductSection, AdminPermission> = {
  basic: "products:edit_basic",
  serial_numbers: "products:edit_serials",
  pricing_stock: "products:edit_pricing_stock",
  sources_supplier: "products:edit_sources",
  images: "products:edit_images",
};

const warrantyOptions = [
  "No warranty",
  "7 days warranty",
  "14 days warranty",
  "30 days warranty",
  "3 months warranty",
  "6 months warranty",
  "1 year warranty",
  "2 years warranty",
];

const requiredMark = <span className="ml-1 text-destructive">*</span>;

function parseSerialNumbers(text: string) {
  return Array.from(new Set(text.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)));
}

function buildFormFromProduct(p: any): ProductFormState {
  const currentStock = Number(p.stockQuantity || 0);
  return {
    ...defaultForm,
    name: p.name || "",
    slug: p.slug || "",
    categoryId: p.categoryId || "",
    subcategory: p.subcategoryId || "",
    brand: p.brandId || "",
    restockAmount: 0,
    barcode: p.barcode || "",
    price: Number(p.price || 0),
    originalPrice: Number(p.originalPrice || 0),
    condition: p.condition || "new",
    description: p.description || "",
    warrantyText: p.warranty || p.warrantyText || "",
    stockQuantity: currentStock,
    featured: Boolean(p.featured),
    premium: Boolean(p.premium),
    images: Array.isArray(p.images) ? p.images : [],
    specs: p.specSelections || {},
    serialNumbersText: (Array.isArray(p.serialNumbers) ? p.serialNumbers : []).map((item: any) => item.serialNumber).join("\n"),
    sourceId: p.sourceId || "",
    sourcedFrom: p.sourcedFrom || "",
    sourcedBy: p.sourcedBy || "",
    sourceDate: p.sourceDate || "",
    sourcePrice: Number(p.sourcePrice || 0),
    sourcePaymentStatus: p.sourcePaymentStatus || (p.sourcingPaymentStatus === "paid" ? "paid" : "pending"),
    sourcingPaymentStatus: p.sourcingPaymentStatus || "pay_later",
  };
}

function cleanDraftForm(value: any): ProductFormState | null {
  if (!value || typeof value !== "object") return null;
  const source = value.form && typeof value.form === "object" ? value.form : value;
  return {
    ...defaultForm,
    ...source,
    price: Number(source.price || 0),
    originalPrice: Number(source.originalPrice || 0),
    stockQuantity: Number(source.stockQuantity || 0),
    restockAmount: Number(source.restockAmount || 0),
    sourcePrice: Number(source.sourcePrice || 0),
    featured: Boolean(source.featured),
    premium: Boolean(source.premium),
    images: Array.isArray(source.images) ? source.images.map(String).filter(Boolean) : [],
    specs: source.specs && typeof source.specs === "object" && !Array.isArray(source.specs) ? source.specs : {},
    serialNumbersText: String(source.serialNumbersText || ""),
  };
}

function readDraft(key: string, base: ProductFormState) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { form: base, restored: false };
    const parsed = JSON.parse(raw);
    const draft = cleanDraftForm(parsed);
    if (!draft) return { form: base, restored: false };
    return { form: { ...base, ...draft }, restored: true };
  } catch {
    return { form: base, restored: false };
  }
}

const AdminProductForm = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [sectionSaving, setSectionSaving] = useState<ProductSection | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [existingStockQuantity, setExistingStockQuantity] = useState(0);
  const [existingTotalStockReceived, setExistingTotalStockReceived] = useState(0);
  const [serialScanInput, setSerialScanInput] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<{ categories: any[]; subcategories: any[]; brands: any[]; specifications: any[] }>({
    categories: [],
    subcategories: [],
    brands: [],
    specifications: [],
  });
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const draftReadyRef = useRef(false);
  const draftKey = `${PRODUCT_DRAFT_PREFIX}${isNew ? "new" : id}`;

  const canCreate = hasAdminPermission(user, "products:create");
  const canEditAll = hasAdminPermission(user, "products:edit");
  const canSaveSection = (section: ProductSection) => isNew ? canCreate : canEditAll || hasAdminPermission(user, productSectionPermissions[section]);
  const canBasic = canSaveSection("basic");
  const canSerials = canSaveSection("serial_numbers");
  const canPricing = canSaveSection("pricing_stock");
  const canSources = canSaveSection("sources_supplier");
  const canUpdateSourcePayments = hasAdminPermission(user, "sourcing_payments:update");
  const canImages = canSaveSection("images");
  const canUploadImages = hasAdminPermission(user, "uploads:manage");

  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      const [data, sourceRows] = await Promise.all([adminApi.getCatalog(), adminApi.getSources({ active: "1" })]);
      setSources(Array.isArray(sourceRows) ? sourceRows : []);
      setCatalog({
        categories: Array.isArray(data?.categories) ? data.categories : [],
        subcategories: Array.isArray(data?.subcategories) ? data.subcategories : [],
        brands: Array.isArray(data?.brands) ? data.brands : [],
        specifications: Array.isArray(data?.specifications) ? data.specifications : [],
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not load catalog", variant: "destructive" });
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    draftReadyRef.current = false;
    setDraftRestored(false);
    if (isNew) {
      const restored = readDraft(draftKey, defaultForm);
      setForm(restored.form);
      setDraftRestored(restored.restored);
      draftReadyRef.current = true;
      return;
    }
    if (!id) return;
    setLoading(true);
    adminApi.getProduct(id)
      .then((p) => {
        const currentStock = Number(p.stockQuantity || 0);
        const totalStockReceived = Number(p.totalStockReceived ?? currentStock ?? 0);
        setExistingStockQuantity(currentStock);
        setExistingTotalStockReceived(totalStockReceived);
        const restored = readDraft(draftKey, buildFormFromProduct(p));
        setForm(restored.form);
        setDraftRestored(restored.restored);
        draftReadyRef.current = true;
      })
      .catch((err: any) => toast({ title: "Error", description: err.message || "Could not load product", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id, isNew, draftKey, toast]);

  useEffect(() => {
    if (!draftReadyRef.current) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ form, updatedAt: new Date().toISOString() }));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [draftKey, form]);

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    setDraftRestored(false);
  };

  const categories = catalog.categories || [];
  const availableBrands = useMemo(() => (catalog.brands || []).filter((item) => item.isActive !== false), [catalog.brands]);
  const availableSubcategories = useMemo(() => (catalog.subcategories || []).filter((item) => item.categoryId === form.categoryId && item.isActive !== false), [catalog.subcategories, form.categoryId]);
  const availableSpecifications = useMemo(() => (catalog.specifications || []).filter((item) => item.subcategoryId === form.subcategory && item.isActive !== false), [catalog.specifications, form.subcategory]);
  const warrantyChoices = useMemo(() => {
    const values = [...warrantyOptions];
    if (form.warrantyText && !values.includes(form.warrantyText)) values.unshift(form.warrantyText);
    return values;
  }, [form.warrantyText]);
  const serialNumbers = useMemo(() => parseSerialNumbers(form.serialNumbersText), [form.serialNumbersText]);

  const handleCategoryChange = (value: string) => canBasic && setForm((current) => ({ ...current, categoryId: value, subcategory: "", specs: {} }));
  const handleSubcategoryChange = (value: string) => canBasic && setForm((current) => ({ ...current, subcategory: value, specs: {} }));
  const handleSpecChange = (specificationId: string, optionId: string) => canBasic && setForm((current) => ({ ...current, specs: { ...current.specs, [specificationId]: optionId } }));

  const appendScannedSerial = (rawValue: string) => {
    if (!canSerials) return;
    const value = rawValue.trim();
    if (!value) return;
    setForm((current) => {
      const currentSerials = parseSerialNumbers(current.serialNumbersText);
      if (currentSerials.includes(value)) return current;
      return { ...current, serialNumbersText: [...currentSerials, value].join("\n") };
    });
  };

  const handleSerialScanKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!canSerials) return;
    if (event.key === "Enter") {
      event.preventDefault(); appendScannedSerial(serialScanInput); setSerialScanInput(""); return;
    }
    if (event.key === "Tab") {
      const value = serialScanInput.trim(); if (!value) return;
      event.preventDefault(); appendScannedSerial(value); setSerialScanInput("");
    }
  };

  const removeSerialNumber = (serialToRemove: string) => {
    if (!canSerials) return;
    setForm((current) => ({ ...current, serialNumbersText: parseSerialNumbers(current.serialNumbersText).filter((serial) => serial !== serialToRemove).join("\n") }));
  };
  const removeImage = (index: number) => canImages && setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  const moveImage = (index: number, direction: -1 | 1) => {
    if (!canImages) return;
    setForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.images.length) return current;
      const nextImages = [...current.images];
      [nextImages[index], nextImages[nextIndex]] = [nextImages[nextIndex], nextImages[index]];
      return { ...current, images: nextImages };
    });
  };
  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (!canImages || fromIndex === toIndex) return;
    setForm((current) => {
      const nextImages = [...current.images];
      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);
      return { ...current, images: nextImages };
    });
  };
  const handleImageDrop = (dropIndex: number) => {
    if (draggedImageIndex === null) return;
    reorderImages(draggedImageIndex, dropIndex);
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  const validateFullForm = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!form.categoryId) return "Category is required";
    if (!form.brand) return "Brand is required";
    if (!form.sourceId) return "Supplier/source is required";
    if (Number(form.sourcePrice || 0) <= 0) return "Source price is required";
    if (!form.sourcePaymentStatus) return "Source payment status is required";
    if (!form.description.trim()) return "Description is required";
    return null;
  };
  const validateSection = (section: ProductSection) => {
    if (section === "basic") {
      if (!form.name.trim()) return "Product name is required";
      if (!form.slug.trim()) return "Slug is required";
      if (!form.categoryId) return "Category is required";
      if (!form.brand) return "Brand is required";
      if (!form.description.trim()) return "Description is required";
    }
    if (section === "sources_supplier") {
      if (!form.sourceId) return "Supplier/source is required";
      if (Number(form.sourcePrice || 0) <= 0) return "Source price is required";
      if (!form.sourcePaymentStatus) return "Source payment status is required";
    }
    return null;
  };

  const filteredSpecs = () => Object.fromEntries(Object.entries(form.specs || {}).filter(([, value]) => Boolean(String(value || "").trim())));
  const buildCreatePayload = () => ({ ...form, slug: form.slug || slugify(form.name), barcode: form.barcode.trim() || null, originalPrice: form.originalPrice || undefined, subcategory: form.subcategory || undefined, warrantyText: form.warrantyText || undefined, stockQuantity: Number(form.stockQuantity) || 0, premium: Boolean(form.premium), images: form.images.filter(Boolean), specs: filteredSpecs(), sourceId: form.sourceId || null, sourcedBy: undefined, sourcePaymentStatus: canUpdateSourcePayments ? (form.sourcePaymentStatus || "pending") : "pending", sourcingPaymentStatus: canUpdateSourcePayments && form.sourcePaymentStatus === "paid" ? "paid" : "pay_later", serialNumbers: parseSerialNumbers(form.serialNumbersText) });
  const buildSectionPayload = (section: ProductSection) => {
    if (section === "basic") return { name: form.name, slug: form.slug || slugify(form.name), categoryId: form.categoryId, subcategory: form.subcategory || undefined, brand: form.brand, barcode: form.barcode.trim() || null, condition: form.condition, description: form.description, specs: filteredSpecs() };
    if (section === "serial_numbers") return { serialNumbers: parseSerialNumbers(form.serialNumbersText) };
    if (section === "pricing_stock") return { price: Number(form.price) || 0, originalPrice: Number(form.originalPrice || 0) || undefined, stockQuantity: existingStockQuantity + Math.max(0, Number(form.restockAmount || 0)), warrantyText: form.warrantyText || undefined, featured: Boolean(form.featured), premium: Boolean(form.premium) };
    if (section === "sources_supplier") return {
      sourceId: form.sourceId || null,
      sourcedBy: undefined,
      sourceDate: form.sourceDate || null,
      sourcePrice: Number(form.sourcePrice || 0),
      ...(canUpdateSourcePayments ? {
        sourcePaymentStatus: form.sourcePaymentStatus || "pending",
        sourcingPaymentStatus: form.sourcePaymentStatus === "paid" ? "paid" : "pay_later",
      } : {}),
    };
    return { images: form.images.filter(Boolean) };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isNew) return;
    if (!canCreate) { toast({ title: "Permission required", description: "You cannot create products.", variant: "destructive" }); return; }
    const validationError = validateFullForm();
    if (validationError) { toast({ title: "Validation error", description: validationError, variant: "destructive" }); return; }
    setSaving(true);
    try {
      const created = await adminApi.createProduct(buildCreatePayload());
      clearDraft(); toast({ title: "Product created" }); navigate(created?.id ? `/admin/products/${created.id}` : "/admin/products");
    } catch (err: any) { toast({ title: "Error", description: err.message || "Could not save product", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveSection = async (section: ProductSection, label: string) => {
    if (isNew || !id) return;
    if (!canSaveSection(section)) { toast({ title: "Permission required", description: `You cannot save ${label}.`, variant: "destructive" }); return; }
    const validationError = validateSection(section);
    if (validationError) { toast({ title: "Validation error", description: validationError, variant: "destructive" }); return; }
    setSectionSaving(section);
    try {
      const updated = await adminApi.updateProduct(id, buildSectionPayload(section));
      if (section === "pricing_stock") {
        const nextStock = Number(updated?.stockQuantity || 0);
        const nextTotalReceived = Number(updated?.totalStockReceived ?? nextStock);
        setExistingStockQuantity(nextStock); setExistingTotalStockReceived(nextTotalReceived);
        setForm((current) => ({ ...current, stockQuantity: nextStock, restockAmount: 0 }));
      }
      toast({ title: `${label} saved` });
    } catch (err: any) { toast({ title: "Error", description: err.message || `Could not save ${label}`, variant: "destructive" }); }
    finally { setSectionSaving(null); }
  };

  const SectionSave = ({ section, label }: { section: ProductSection; label: string }) => {
    if (isNew) return null;
    const allowed = canSaveSection(section);
    return <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4"><p className={`flex items-center gap-2 text-sm ${allowed ? "text-muted-foreground" : "text-amber-700"}`}>{allowed ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}{allowed ? "You can save this section independently." : "You do not have permission to edit this section."}</p><Button type="button" onClick={() => handleSaveSection(section, label)} disabled={!allowed || sectionSaving === section}><Save className="mr-2 h-4 w-4" />{sectionSaving === section ? "Saving..." : `Save ${label}`}</Button></div>;
  };

  if (loading || catalogLoading) return <Skeleton className="h-[500px] w-full rounded-xl" />;
  if (isNew && !canCreate) return <div className="space-y-4"><Button variant="outline" onClick={() => navigate("/admin/products")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to products</Button><Card className="border-amber-200 bg-amber-50/60"><CardHeader><CardTitle className="flex items-center gap-2 text-amber-900"><AlertCircle className="h-5 w-5" /> Permission required</CardTitle><CardDescription className="text-amber-800">Your account cannot create products.</CardDescription></CardHeader></Card></div>;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(isNew ? "/admin/products" : `/admin/products/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" /> {isNew ? "Back to products" : "Back to product details"}</Button>
      <div><h2 className="text-2xl font-display font-bold">{isNew ? "Add Product" : "Edit Product"}</h2><p className="text-muted-foreground">{isNew ? "Your add-product form is saved locally as you type, so you can leave and finish later." : "Each product section saves independently and is protected by its own permission."}</p></div>
      {draftRestored ? <Card className="border-amber-200 bg-amber-50/60"><CardContent className="flex flex-col gap-3 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> A locally saved draft was restored on this page.</p><Button type="button" variant="outline" size="sm" onClick={clearDraft}>Discard saved draft</Button></CardContent></Card> : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic information + Specifications</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Name{requiredMark}</Label><Input disabled={!canBasic} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} required /></div>
            <div className="space-y-2"><Label>Slug{requiredMark}</Label><Input disabled={!canBasic} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Category{requiredMark}</Label><Select value={form.categoryId} onValueChange={handleCategoryChange} disabled={!canBasic}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Subcategory</Label><Select value={form.subcategory} onValueChange={handleSubcategoryChange} disabled={!canBasic || !form.categoryId || !availableSubcategories.length}><SelectTrigger><SelectValue placeholder={form.categoryId ? "Select subcategory" : "Choose category first"} /></SelectTrigger><SelectContent>{availableSubcategories.map((subcategory) => <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Brand{requiredMark}</Label><Select value={form.brand} onValueChange={(value) => canBasic && setForm((f) => ({ ...f, brand: value }))} disabled={!canBasic}><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent>{availableBrands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Barcode</Label><Input disabled={!canBasic} value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} placeholder="Scan or type barcode" /></div>
            <div className="space-y-2"><Label>Condition{requiredMark}</Label><Select value={form.condition} onValueChange={(value) => canBasic && setForm((f) => ({ ...f, condition: value }))} disabled={!canBasic}><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="refurbished">Refurbished</SelectItem><SelectItem value="ex-uk">Ex-UK</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 md:col-span-2"><Label>Description{requiredMark}</Label><RichTextEditor value={form.description} onChange={(value) => setForm((f) => ({ ...f, description: value }))} placeholder="Write the product description with paragraphs, bullet points, specs and links." minHeight={260} disabled={!canBasic} /></div>
            <div className="space-y-4 md:col-span-2"><h3 className="font-medium">Specifications</h3>{!form.subcategory ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Choose a subcategory first. The specification names and values will then load as dropdowns.</div> : availableSpecifications.length ? <div className="grid gap-4 md:grid-cols-2">{availableSpecifications.map((specification) => { const options = (specification.values || []).filter((item: any) => item.isActive !== false); return <div key={specification.id} className="space-y-2"><Label>{specification.name}</Label><Select value={form.specs[specification.id] || ""} onValueChange={(value) => handleSpecChange(specification.id, value)} disabled={!canBasic}><SelectTrigger><SelectValue placeholder={`Select ${specification.name}`} /></SelectTrigger><SelectContent>{options.map((option: any) => <SelectItem key={option.id} value={option.id}>{option.value}</SelectItem>)}</SelectContent></Select></div>; })}</div> : <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No specification dropdowns are configured for this subcategory yet. Add them in Categories.</div>}</div>
          </CardContent><SectionSave section="basic" label="basic information + specifications" />
        </Card>

        <Card><CardHeader><CardTitle className="text-lg">Serial numbers</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Scan serial number</Label><Input disabled={!canSerials} value={serialScanInput} onChange={(e) => setSerialScanInput(e.target.value)} onKeyDown={handleSerialScanKeyDown} placeholder="Scan or type one serial number, then press Enter" /><p className="text-xs text-muted-foreground">Scanned serials are added below and mirrored into the textarea for manual editing.</p></div><div className="flex flex-wrap gap-2">{serialNumbers.length ? serialNumbers.map((serial) => <div key={serial} className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-sm"><span className="max-w-[220px] truncate">{serial}</span><Button type="button" variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => removeSerialNumber(serial)} disabled={!canSerials} aria-label={`Remove serial ${serial}`}><X className="h-3 w-3" /></Button></div>) : <p className="text-sm text-muted-foreground">No serials scanned yet.</p>}</div><div className="space-y-2"><Label>Product unit serial numbers</Label><Textarea disabled={!canSerials} value={form.serialNumbersText} onChange={(e) => setForm((f) => ({ ...f, serialNumbersText: e.target.value }))} placeholder={"Enter one serial number per line\nExample:\nSN-001\nSN-002\nSN-003"} rows={8} /></div><p className="text-sm text-muted-foreground">Add one serial number per physical item. For a quantity of 100, paste 100 lines here; sold serial numbers stay locked for reports.</p></CardContent><SectionSave section="serial_numbers" label="serial numbers" /></Card>

        <Card><CardHeader><CardTitle className="text-lg">Pricing & stock</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{!isNew ? <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2 lg:col-span-4"><p className="font-medium">Current stock summary</p><div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2"><p>Available stock: {existingStockQuantity} unit(s)</p><p>Total received: {existingTotalStockReceived} unit(s)</p></div><p className="mt-1 text-xs text-muted-foreground">Available stock is what can still be sold. Total received counts every positive stock addition.</p></div> : null}<div className="space-y-2"><Label>Price{requiredMark}</Label><Input disabled={!canPricing} type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} required /></div><div className="space-y-2"><Label>Original Price</Label><Input disabled={!canPricing} type="number" min={0} value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) }))} /></div><div className="space-y-2"><Label>{isNew ? "Initial Stock Quantity" : "Restock Amount"}{requiredMark}</Label>{isNew ? <><Input disabled={!canPricing} type="number" min={0} step={1} value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))} required /><p className="text-xs text-muted-foreground">This becomes the starting inventory for the product.</p></> : <><Input disabled={!canPricing} type="number" min={0} step={1} value={form.restockAmount} onChange={(e) => setForm((f) => ({ ...f, restockAmount: Number(e.target.value) }))} placeholder="Units to add to current stock" /><p className="text-xs text-muted-foreground">Current available stock is {existingStockQuantity} unit(s). Saving adds this amount on top.</p></>}</div><div className="space-y-2"><Label>Warranty</Label><Select value={form.warrantyText || "__none__"} onValueChange={(value) => canPricing && setForm((f) => ({ ...f, warrantyText: value === "__none__" ? "" : value }))} disabled={!canPricing}><SelectTrigger><SelectValue placeholder="Select warranty" /></SelectTrigger><SelectContent><SelectItem value="__none__">Not specified</SelectItem>{warrantyChoices.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div><div className="rounded-lg border p-4 md:col-span-2 lg:col-span-2"><div className="flex items-center justify-between gap-4"><div><p className="font-medium">Featured product</p><p className="text-sm text-muted-foreground">Hot Deals sections use featured products.</p></div><Switch disabled={!canPricing} checked={form.featured} onCheckedChange={(checked) => setForm((f) => ({ ...f, featured: checked }))} /></div></div><div className="rounded-lg border p-4 md:col-span-2 lg:col-span-2"><div className="flex items-center justify-between gap-4"><div><p className="font-medium">Premium product</p><p className="text-sm text-muted-foreground">Hero carousel slides use premium products.</p></div><Switch disabled={!canPricing} checked={Boolean(form.premium)} onCheckedChange={(checked) => setForm((f) => ({ ...f, premium: checked }))} /></div></div></CardContent><SectionSave section="pricing_stock" label="pricing & stock" /></Card>

        <Card><CardHeader><CardTitle className="text-lg">Sources / supplier</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><div className="space-y-2"><Label>Supplier / source{requiredMark}</Label><Select value={form.sourceId || "__none__"} onValueChange={(value) => canSources && setForm((f) => ({ ...f, sourceId: value === "__none__" ? "" : value }))} disabled={!canSources}><SelectTrigger><SelectValue placeholder="Select supplier/source" /></SelectTrigger><SelectContent><SelectItem value="__none__">Not selected</SelectItem>{sources.filter((source) => source.isActive !== false).map((source) => <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Manage this list from Admin → Suppliers / Sources.</p></div><div className="space-y-2"><Label>Sourced by</Label><Input value={form.sourcedBy || "Auto-filled from logged-in data entrant"} readOnly className="bg-muted" /><p className="text-xs text-muted-foreground">This is saved automatically from the admin account entering the product.</p></div><div className="space-y-2"><Label>Date</Label><Input disabled={!canSources} type="date" value={form.sourceDate} onChange={(e) => setForm((f) => ({ ...f, sourceDate: e.target.value }))} /></div><div className="space-y-2"><Label>Source price{requiredMark}</Label><Input disabled={!canSources} type="number" min={1} value={form.sourcePrice} onChange={(e) => setForm((f) => ({ ...f, sourcePrice: Number(e.target.value) }))} /></div><div className="space-y-2"><Label>Source payment status{requiredMark}</Label><Select value={form.sourcePaymentStatus} onValueChange={(value) => canUpdateSourcePayments && setForm((f) => ({ ...f, sourcePaymentStatus: value, sourcingPaymentStatus: value === "paid" ? "paid" : "pay_later" }))} disabled={!canUpdateSourcePayments}><SelectTrigger><SelectValue placeholder="Select source payment status" /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="waived">Waived</SelectItem></SelectContent></Select>{!canUpdateSourcePayments ? <p className="text-xs text-amber-700">Changing source payment status requires Source Payments update permission.</p> : null}</div></CardContent><SectionSave section="sources_supplier" label="sources / supplier" /></Card>

        <Card><CardHeader><CardTitle className="text-lg">Product images</CardTitle></CardHeader><CardContent className="space-y-4"><ImageUploadField label="Add product photo(s)" multiple disabled={!canImages || !canUploadImages} onMultipleChange={(values) => setForm((current) => ({ ...current, images: [...current.images, ...values] }))} helperText={canUploadImages ? "You can select multiple photos at once. Uploaded photos are added to the gallery in the same order." : "Image uploads require the Upload files permission."} /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{form.images.map((image, index) => { const isDragTarget = dragOverImageIndex === index; const isDragged = draggedImageIndex === index; return <div key={`${image}-${index}`} draggable={canImages} onDragStart={() => canImages && setDraggedImageIndex(index)} onDragEnter={() => canImages && setDragOverImageIndex(index)} onDragOver={(event) => event.preventDefault()} onDragEnd={() => { setDraggedImageIndex(null); setDragOverImageIndex(null); }} onDrop={() => handleImageDrop(index)} className={`flex items-center gap-3 rounded-md border p-3 transition-all ${isDragTarget ? "border-primary bg-primary/5" : ""} ${isDragged ? "opacity-70" : ""}`}><button type="button" className="flex items-center gap-1 self-stretch pr-1 text-muted-foreground cursor-grab active:cursor-grabbing" title="Drag to reorder" disabled={!canImages}><GripVertical className="h-4 w-4" /></button><img src={image} alt={`Product image ${index + 1}`} className="h-14 w-14 rounded object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Photo {index + 1}</p><p className="truncate text-xs text-muted-foreground">Drag to change gallery order.</p></div><div className="flex items-center gap-1"><Button type="button" variant="outline" size="icon" onClick={() => moveImage(index, -1)} disabled={!canImages || index === 0} title="Move up"><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" onClick={() => moveImage(index, 1)} disabled={!canImages || index === form.images.length - 1} title="Move down"><ArrowDown className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)} disabled={!canImages} title="Remove photo"><X className="h-4 w-4" /></Button></div></div>; })}</div>{!form.images.length ? <p className="text-sm text-muted-foreground">No photos added yet.</p> : <p className="text-xs text-muted-foreground">Drag and drop photos to rearrange the gallery order, or use the arrows for fine control.</p>}</CardContent><SectionSave section="images" label="product images" /></Card>

        <div className="flex gap-3">{isNew ? <Button type="submit" disabled={saving || !canCreate}>{saving ? "Creating..." : "Create product"}</Button> : null}<Button type="button" variant="outline" onClick={() => navigate(isNew ? "/admin/products" : `/admin/products/${id}`)}>Cancel</Button></div>
      </form>
    </div>
  );
};

export default AdminProductForm;
