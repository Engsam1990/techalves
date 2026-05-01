import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Eye, Star, StarOff, Search, Gem, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission } from "@/lib/adminPermissions";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const canCreate = hasAdminPermission(user, "products:create");
  const canEdit = hasAdminPermission(user, "products:edit") ||
    hasAdminPermission(user, "products:edit_basic") ||
    hasAdminPermission(user, "products:edit_serials") ||
    hasAdminPermission(user, "products:edit_pricing_stock") ||
    hasAdminPermission(user, "products:edit_sources") ||
    hasAdminPermission(user, "products:edit_images");
  const canToggleFeatured = hasAdminPermission(user, "products:edit") || hasAdminPermission(user, "products:toggle_featured");
  const canTogglePremium = hasAdminPermission(user, "products:edit") || hasAdminPermission(user, "products:toggle_premium");
  const canViewInventory = hasAdminPermission(user, "inventory:view");

  const allowedStockFilters = new Set(["all", "in_stock", "sold_out"]);
  const allowedFeaturedFilters = new Set(["all", "featured", "not_featured"]);

  const fetchProducts = () => {
    setLoading(true);
    adminApi
      .getProducts()
      .then((rows) => setProducts((Array.isArray(rows) ? rows : []).filter((item) => item.salesChannel !== "pos_only" && item.isCatalogVisible !== false)))
      .catch(() => toast({ title: "Error", description: "Failed to load products", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const nextSearch = searchParams.get("q") || "";
    const nextCategory = searchParams.get("category") || "all";
    const nextBrand = searchParams.get("brand") || "all";
    const nextStock = searchParams.get("stock") || "all";
    const nextFeatured = searchParams.get("featured") || "all";

    setSearch(nextSearch);
    setCategoryFilter(nextCategory);
    setBrandFilter(nextBrand);
    setStockFilter(allowedStockFilters.has(nextStock) ? nextStock : "all");
    setFeaturedFilter(allowedFeaturedFilters.has(nextFeatured) ? nextFeatured : "all");
  }, [searchParams]);

  const handleToggleFeatured = async (id: string) => {
    if (!canToggleFeatured) return;
    try {
      const updated = await adminApi.toggleFeatured(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast({ title: updated.featured ? "Marked as featured" : "Removed from featured" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update featured status", variant: "destructive" });
    }
  };

  const handleTogglePremium = async (id: string) => {
    if (!canTogglePremium) return;
    try {
      const updated = await adminApi.togglePremium(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast({ title: updated.premium ? "Marked as premium" : "Removed from premium" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update premium status", variant: "destructive" });
    }
  };

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((p) => String(p.categoryName || p.category || "")).filter(Boolean))).sort(),
    [products]
  );

  const brandOptions = useMemo(
    () => Array.from(new Set(products.map((p) => String(p.brand || "")).filter(Boolean))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !needle || [p.name, p.brand, p.categoryName, p.category, p.barcode]
        .some((value) => String(value || "").toLowerCase().includes(needle));
      const matchesCategory = categoryFilter === "all" || String(p.categoryName || p.category) === categoryFilter;
      const matchesBrand = brandFilter === "all" || String(p.brand) === brandFilter;
      const matchesStock = stockFilter === "all" || (stockFilter === "in_stock" ? Boolean(p.inStock) : !p.inStock);
      const matchesFeatured = featuredFilter === "all" || (featuredFilter === "featured" ? Boolean(p.featured) : !p.featured);
      return matchesSearch && matchesCategory && matchesBrand && matchesStock && matchesFeatured;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter, featuredFilter]);

  const updateUrlFilters = (next: { q?: string; category?: string; brand?: string; stock?: string; featured?: string }) => {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.category && next.category !== "all") params.set("category", next.category);
    if (next.brand && next.brand !== "all") params.set("brand", next.brand);
    if (next.stock && next.stock !== "all") params.set("stock", next.stock);
    if (next.featured && next.featured !== "all") params.set("featured", next.featured);
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setBrandFilter("all");
    setStockFilter("all");
    setFeaturedFilter("all");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold text-foreground">Products</h2>
        <div className="flex flex-wrap justify-end gap-3">
          {canViewInventory ? (
            <Button variant="outline" onClick={() => navigate("/admin/inventory")}>
              <Layers className="mr-2 h-4 w-4" /> Inventory Insights
            </Button>
          ) : null}
          {canCreate ? (
            <Button onClick={() => navigate("/admin/products/new")}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              updateUrlFilters({ q: value, category: categoryFilter, brand: brandFilter, stock: stockFilter, featured: featuredFilter });
            }}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); updateUrlFilters({ q: search, category: value, brand: brandFilter, stock: stockFilter, featured: featuredFilter }); }}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={(value) => { setBrandFilter(value); updateUrlFilters({ q: search, category: categoryFilter, brand: value, stock: stockFilter, featured: featuredFilter }); }}>
          <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brandOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={(value) => { setStockFilter(value); updateUrlFilters({ q: search, category: categoryFilter, brand: brandFilter, stock: value, featured: featuredFilter }); }}>
          <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="sold_out">Sold out</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-3">
          <Select value={featuredFilter} onValueChange={(value) => { setFeaturedFilter(value); updateUrlFilters({ q: search, category: categoryFilter, brand: brandFilter, stock: stockFilter, featured: value }); }}>
            <SelectTrigger><SelectValue placeholder="Featured" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              <SelectItem value="featured">Featured only</SelectItem>
              <SelectItem value="not_featured">Non-featured</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={resetFilters}>Clear</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock Qty</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />}
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                        {p.barcode ? <p className="text-xs text-muted-foreground">Barcode: {p.barcode}</p> : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{p.categoryName || p.category}</TableCell>
                  <TableCell className="font-medium">{formatPrice(p.price)}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.stockQuantity}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.inStock ? <Badge variant="default" className="bg-green-600 text-xs hover:bg-green-700">In Stock</Badge> : <Badge variant="destructive" className="text-xs">Sold Out</Badge>}
                      {p.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                      {p.premium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="View details" onClick={() => navigate(`/admin/products/${p.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canToggleFeatured ? (
                        <Button variant="ghost" size="icon" title={p.featured ? "Remove featured" : "Mark featured"} onClick={() => handleToggleFeatured(p.id)}>
                          {p.featured ? <StarOff className="h-4 w-4 text-secondary" /> : <Star className="h-4 w-4" />}
                        </Button>
                      ) : null}
                      {canTogglePremium ? (
                        <Button variant="ghost" size="icon" title={p.premium ? "Remove premium" : "Mark as premium"} onClick={() => handleTogglePremium(p.id)}>
                          <Gem className={`h-4 w-4 ${p.premium ? "text-amber-500" : ""}`} />
                        </Button>
                      ) : null}
                      
                      {canEdit ? (
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4" /> 
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No products found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
