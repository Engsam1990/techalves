import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Textarea } from "@/components/ui/textarea";
import { stripHtml } from "@/lib/seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission } from "@/lib/adminPermissions";
import { toast } from "sonner";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function valuesToLines(values: any[]) {
  return (values || []).map((item) => item.value).join("\n");
}

function linesToValues(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((value, index) => ({ value, sortOrder: index, isActive: true }));
}

const emptyCategoryForm = { id: "", slug: "", name: "", description: "", imageUrl: "", icon: "", sortOrder: 0, isActive: true };
const emptySubcategoryForm = { id: "", categoryId: "", slug: "", name: "", description: "", sortOrder: 0, isActive: true };
const emptyBrandForm = { id: "", slug: "", name: "", description: "", logoUrl: "", websiteUrl: "", isActive: true };
const emptySpecificationForm = { id: "", subcategoryId: "", name: "", sortOrder: 0, isActive: true, valuesText: "" };

const AdminCategories = () => {
  const { user } = useAuth();
  const canManageCatalog = hasAdminPermission(user, "catalog:manage");
  const [tab, setTab] = useState("categories");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any>({ subcategories: [], groupedSubcategories: [], brands: [], specifications: [], groupedSpecifications: [] });
  const [categoryForm, setCategoryForm] = useState<any>(emptyCategoryForm);
  const [subcategoryForm, setSubcategoryForm] = useState<any>(emptySubcategoryForm);
  const [brandForm, setBrandForm] = useState<any>(emptyBrandForm);
  const [specificationForm, setSpecificationForm] = useState<any>(emptySpecificationForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryRows, catalogData] = await Promise.all([adminApi.getCategories(), adminApi.getCatalog()]);
      setCategories(Array.isArray(categoryRows) ? categoryRows : []);
      setCatalog(catalogData || { subcategories: [], groupedSubcategories: [], brands: [], specifications: [], groupedSpecifications: [] });
    } catch (err: any) {
      toast.error(err.message || "Could not load catalog data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const isEditingCategory = useMemo(() => Boolean(categoryForm.id), [categoryForm.id]);
  const isEditingSubcategory = useMemo(() => Boolean(subcategoryForm.id), [subcategoryForm.id]);
  const isEditingBrand = useMemo(() => Boolean(brandForm.id), [brandForm.id]);
  const isEditingSpecification = useMemo(() => Boolean(specificationForm.id), [specificationForm.id]);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    setSaving(true);
    try {
      const payload = { ...categoryForm, slug: categoryForm.slug || slugify(categoryForm.name), sortOrder: Number(categoryForm.sortOrder || 0) };
      if (isEditingCategory) {
        await adminApi.updateCategory(categoryForm.id, payload);
        toast.success("Category updated");
      } else {
        await adminApi.createCategory(payload);
        toast.success("Category created");
      }
      setCategoryForm(emptyCategoryForm);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    setSaving(true);
    try {
      const payload = { ...subcategoryForm, slug: subcategoryForm.slug || slugify(subcategoryForm.name), sortOrder: Number(subcategoryForm.sortOrder || 0) };
      if (isEditingSubcategory) {
        await adminApi.updateSubcategory(subcategoryForm.id, payload);
        toast.success("Subcategory updated");
      } else {
        await adminApi.createSubcategory(payload);
        toast.success("Subcategory created");
      }
      setSubcategoryForm(emptySubcategoryForm);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not save subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    setSaving(true);
    try {
      const payload = { ...brandForm, slug: brandForm.slug || slugify(brandForm.name) };
      if (isEditingBrand) {
        await adminApi.updateBrand(brandForm.id, payload);
        toast.success("Brand updated");
      } else {
        await adminApi.createBrand(payload);
        toast.success("Brand created");
      }
      setBrandForm(emptyBrandForm);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not save brand");
    } finally {
      setSaving(false);
    }
  };

  const handleSpecificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCatalog) return;
    setSaving(true);
    try {
      const values = linesToValues(specificationForm.valuesText);
      if (!values.length) throw new Error("Add at least one dropdown value");
      const payload = {
        subcategoryId: specificationForm.subcategoryId,
        name: specificationForm.name,
        sortOrder: Number(specificationForm.sortOrder || 0),
        isActive: specificationForm.isActive,
        values,
      };
      if (isEditingSpecification) {
        await adminApi.updateSpecification(specificationForm.id, payload);
        toast.success("Specification updated");
      } else {
        await adminApi.createSpecification(payload);
        toast.success("Specification created");
      }
      setSpecificationForm(emptySpecificationForm);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not save specification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (kind: "category" | "subcategory" | "brand" | "specification", id: string) => {
    if (!canManageCatalog) return;
    if (!window.confirm(`Delete this ${kind}?`)) return;
    try {
      if (kind === "category") await adminApi.deleteCategory(id);
      if (kind === "subcategory") await adminApi.deleteSubcategory(id);
      if (kind === "brand") await adminApi.deleteBrand(id);
      if (kind === "specification") await adminApi.deleteSpecification(id);
      toast.success(`${kind[0].toUpperCase()}${kind.slice(1)} deleted`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || `Could not delete ${kind}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Catalog</h2>
        <p className="text-muted-foreground">Manage categories, subcategories, brands, and specification dropdowns from one page.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className={canManageCatalog ? "grid gap-6 lg:grid-cols-[380px_1fr]" : "space-y-6"}>
          {canManageCatalog ? <Card>
            <CardHeader><CardTitle>{isEditingCategory ? "Edit category" : "New category"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCategorySubmit}>
                <div className="space-y-2"><Label>Name</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm((p: any) => ({ ...p, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={categoryForm.slug} onChange={(e) => setCategoryForm((p: any) => ({ ...p, slug: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Description</Label><RichTextEditor value={categoryForm.description} onChange={(value) => setCategoryForm((p: any) => ({ ...p, description: value }))} placeholder="Write a formatted category summary." minHeight={180} /></div>
                <ImageUploadField label="Category photo" value={categoryForm.imageUrl} onChange={(value) => setCategoryForm((p: any) => ({ ...p, imageUrl: value }))} helperText="Upload the image used in the category banner and listing cards." />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Icon</Label><Input value={categoryForm.icon} onChange={(e) => setCategoryForm((p: any) => ({ ...p, icon: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Sort Order</Label><Input type="number" min={0} value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((p: any) => ({ ...p, sortOrder: Number(e.target.value) }))} /></div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3"><span>Active</span><Switch checked={categoryForm.isActive} onCheckedChange={(checked) => setCategoryForm((p: any) => ({ ...p, isActive: checked }))} /></div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : isEditingCategory ? "Update" : "Create"}</Button>
                  {isEditingCategory && <Button type="button" variant="outline" onClick={() => setCategoryForm(emptyCategoryForm)}>Cancel</Button>}
                </div>
              </form>
            </CardContent>
          </Card> : null}

          <Card>
            <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                <div className="border rounded-lg overflow-hidden bg-card">
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Products</TableHead><TableHead>Status</TableHead>{canManageCatalog ? <TableHead className="text-right">Actions</TableHead> : null}</TableRow></TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell><div><p className="font-medium">{category.name}</p>{category.description && <p className="text-xs text-muted-foreground line-clamp-1">{stripHtml(category.description)}</p>}</div></TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell>{category.productCount}</TableCell>
                          <TableCell>{category.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                          {canManageCatalog ? <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setCategoryForm({ ...category })}>Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete("category", category.id)}>Delete</Button>
                          </TableCell> : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className={canManageCatalog ? "grid gap-6 lg:grid-cols-[380px_1fr]" : "space-y-6"}>
          {canManageCatalog ? <Card>
            <CardHeader><CardTitle>{isEditingSubcategory ? "Edit subcategory" : "New subcategory"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubcategorySubmit}>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={subcategoryForm.categoryId} onValueChange={(value) => setSubcategoryForm((p: any) => ({ ...p, categoryId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Name</Label><Input value={subcategoryForm.name} onChange={(e) => setSubcategoryForm((p: any) => ({ ...p, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={subcategoryForm.slug} onChange={(e) => setSubcategoryForm((p: any) => ({ ...p, slug: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Description</Label><RichTextEditor value={subcategoryForm.description} onChange={(value) => setSubcategoryForm((p: any) => ({ ...p, description: value }))} placeholder="Write a formatted subcategory summary." minHeight={180} /></div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" min={0} value={subcategoryForm.sortOrder} onChange={(e) => setSubcategoryForm((p: any) => ({ ...p, sortOrder: Number(e.target.value) }))} /></div>
                <div className="flex items-center justify-between rounded-lg border p-3"><span>Active</span><Switch checked={subcategoryForm.isActive} onCheckedChange={(checked) => setSubcategoryForm((p: any) => ({ ...p, isActive: checked }))} /></div>
                <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving..." : isEditingSubcategory ? "Update" : "Create"}</Button>{isEditingSubcategory && <Button type="button" variant="outline" onClick={() => setSubcategoryForm(emptySubcategoryForm)}>Cancel</Button>}</div>
              </form>
            </CardContent>
          </Card> : null}

          <Card>
            <CardHeader><CardTitle>Subcategories</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                <div className="space-y-4">
                  {(catalog.groupedSubcategories || []).map((group: any) => (
                    <div key={group.categoryId} className="space-y-2">
                      <h3 className="font-semibold">{group.categoryName}</h3>
                      <div className="border rounded-lg overflow-hidden bg-card">
                        <Table>
                          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Products</TableHead><TableHead>Status</TableHead>{canManageCatalog ? <TableHead className="text-right">Actions</TableHead> : null}</TableRow></TableHeader>
                          <TableBody>
                            {(group.items || []).map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.slug}</TableCell>
                                <TableCell>{item.productCount}</TableCell>
                                <TableCell>{item.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                                {canManageCatalog ? <TableCell className="text-right space-x-2"><Button variant="outline" size="sm" onClick={() => setSubcategoryForm({ ...item })}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDelete("subcategory", item.id)}>Delete</Button></TableCell> : null}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className={canManageCatalog ? "grid gap-6 lg:grid-cols-[380px_1fr]" : "space-y-6"}>
          {canManageCatalog ? <Card>
            <CardHeader><CardTitle>{isEditingBrand ? "Edit brand" : "New brand"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleBrandSubmit}>
                <div className="space-y-2"><Label>Name</Label><Input value={brandForm.name} onChange={(e) => setBrandForm((p: any) => ({ ...p, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={brandForm.slug} onChange={(e) => setBrandForm((p: any) => ({ ...p, slug: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Description</Label><RichTextEditor value={brandForm.description} onChange={(value) => setBrandForm((p: any) => ({ ...p, description: value }))} placeholder="Write a formatted brand summary." minHeight={180} /></div>
                <ImageUploadField label="Brand logo" value={brandForm.logoUrl} onChange={(value) => setBrandForm((p: any) => ({ ...p, logoUrl: value }))} helperText="Upload the brand image or logo shown in the admin catalog." />
                <div className="space-y-2"><Label>Website URL</Label><Input value={brandForm.websiteUrl} onChange={(e) => setBrandForm((p: any) => ({ ...p, websiteUrl: e.target.value }))} /></div>
                <div className="flex items-center justify-between rounded-lg border p-3"><span>Active</span><Switch checked={brandForm.isActive} onCheckedChange={(checked) => setBrandForm((p: any) => ({ ...p, isActive: checked }))} /></div>
                <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving..." : isEditingBrand ? "Update" : "Create"}</Button>{isEditingBrand && <Button type="button" variant="outline" onClick={() => setBrandForm(emptyBrandForm)}>Cancel</Button>}</div>
              </form>
            </CardContent>
          </Card> : null}

          <Card>
            <CardHeader><CardTitle>Brands</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                <div className="border rounded-lg overflow-hidden bg-card">
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Products</TableHead><TableHead>Status</TableHead>{canManageCatalog ? <TableHead className="text-right">Actions</TableHead> : null}</TableRow></TableHeader>
                    <TableBody>
                      {(catalog.brands || []).map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.slug}</TableCell>
                          <TableCell>{item.productCount}</TableCell>
                          <TableCell>{item.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                          {canManageCatalog ? <TableCell className="text-right space-x-2"><Button variant="outline" size="sm" onClick={() => setBrandForm({ ...item })}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDelete("brand", item.id)}>Delete</Button></TableCell> : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className={canManageCatalog ? "grid gap-6 lg:grid-cols-[380px_1fr]" : "space-y-6"}>
          {canManageCatalog ? <Card>
            <CardHeader><CardTitle>{isEditingSpecification ? "Edit specification dropdown" : "New specification dropdown"}</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSpecificationSubmit}>
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select value={specificationForm.subcategoryId} onValueChange={(value) => setSpecificationForm((p: any) => ({ ...p, subcategoryId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                    <SelectContent>
                      {(catalog.subcategories || []).map((item: any) => <SelectItem key={item.id} value={item.id}>{item.categoryName ? `${item.categoryName} — ${item.name}` : item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Name</Label><Input value={specificationForm.name} onChange={(e) => setSpecificationForm((p: any) => ({ ...p, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" min={0} value={specificationForm.sortOrder} onChange={(e) => setSpecificationForm((p: any) => ({ ...p, sortOrder: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>Dropdown values</Label><Textarea rows={8} placeholder="One value per line" value={specificationForm.valuesText} onChange={(e) => setSpecificationForm((p: any) => ({ ...p, valuesText: e.target.value }))} /></div>
                <div className="flex items-center justify-between rounded-lg border p-3"><span>Active</span><Switch checked={specificationForm.isActive} onCheckedChange={(checked) => setSpecificationForm((p: any) => ({ ...p, isActive: checked }))} /></div>
                <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving..." : isEditingSpecification ? "Update" : "Create"}</Button>{isEditingSpecification && <Button type="button" variant="outline" onClick={() => setSpecificationForm(emptySpecificationForm)}>Cancel</Button>}</div>
              </form>
            </CardContent>
          </Card> : null}

          <Card>
            <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                <div className="space-y-4">
                  {(catalog.groupedSpecifications || []).map((group: any) => (
                    <div key={group.categoryId} className="space-y-3">
                      <h3 className="font-semibold">{group.categoryName}</h3>
                      {(group.subcategories || []).map((subcategory: any) => (
                        <div key={subcategory.subcategoryId} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">{subcategory.subcategoryName}</h4>
                          <div className="border rounded-lg overflow-hidden bg-card">
                            <Table>
                              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Values</TableHead><TableHead>Products</TableHead><TableHead>Status</TableHead>{canManageCatalog ? <TableHead className="text-right">Actions</TableHead> : null}</TableRow></TableHeader>
                              <TableBody>
                                {(subcategory.items || []).map((item: any) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="max-w-[340px] truncate">{(item.values || []).map((value: any) => value.value).join(", ")}</TableCell>
                                    <TableCell>{item.productCount}</TableCell>
                                    <TableCell>{item.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                                    {canManageCatalog ? <TableCell className="text-right space-x-2">
                                      <Button variant="outline" size="sm" onClick={() => setSpecificationForm({ id: item.id, subcategoryId: item.subcategoryId, name: item.name, sortOrder: item.sortOrder, isActive: item.isActive, valuesText: valuesToLines(item.values) })}>Edit</Button>
                                      <Button variant="destructive" size="sm" onClick={() => handleDelete("specification", item.id)}>Delete</Button>
                                    </TableCell> : null}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCategories;
