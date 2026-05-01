import { useEffect, useState, type FormEvent } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission } from "@/lib/adminPermissions";

const defaultForm = { name: "", contactPerson: "", phone: "", email: "", location: "", notes: "", isActive: true };

export default function AdminSources() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageSources = hasAdminPermission(user, "sources:manage");
  const [sources, setSources] = useState<any[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSources = async () => setSources(await adminApi.getSources());
  useEffect(() => { loadSources().catch((err) => toast({ title: "Error", description: err.message || "Could not load suppliers", variant: "destructive" })); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManageSources) return;
    setSaving(true);
    try {
      const payload = { ...form, type: "supplier" };
      if (editingId) await adminApi.updateSource(editingId, payload);
      else await adminApi.createSource(payload);
      toast({ title: editingId ? "Supplier updated" : "Supplier created" });
      setForm(defaultForm); setEditingId(null); await loadSources();
    } catch (err: any) { toast({ title: "Error", description: err.message || "Could not save supplier", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const edit = (source: any) => { if (!canManageSources) return; setEditingId(source.id); setForm({ name: source.name || "", contactPerson: source.contactPerson || "", phone: source.phone || "", email: source.email || "", location: source.location || "", notes: source.notes || "", isActive: source.isActive !== false }); };
  const remove = async (id: string) => { if (!canManageSources) return; await adminApi.deleteSource(id); toast({ title: "Supplier removed or deactivated" }); await loadSources(); };

  return <div className="space-y-6">
    <div><h2 className="text-2xl font-display font-bold">Suppliers</h2><p className="text-muted-foreground">Manage supplier records used in products, instant sales, and supplier expenses.</p></div>
    {canManageSources ? <Card><CardHeader><CardTitle>{editingId ? "Edit supplier" : "Add supplier"}</CardTitle></CardHeader><CardContent>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2"><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Contact person</Label><Input value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
        <div className="space-y-2 md:col-span-2 lg:col-span-3"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
        <div className="flex gap-2 md:col-span-2 lg:col-span-3"><Button disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Create"}</Button>{editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(defaultForm); }}>Cancel edit</Button> : null}</div>
      </form>
    </CardContent></Card> : null}
    <Card><CardHeader><CardTitle>Suppliers list</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Status</TableHead>{canManageSources ? <TableHead className="text-right">Actions</TableHead> : null}</TableRow></TableHeader><TableBody>{sources.map((source) => <TableRow key={source.id}><TableCell className="font-medium">{source.name}</TableCell><TableCell>{source.phone || source.email || source.contactPerson || "—"}</TableCell><TableCell><Badge variant={source.isActive === false ? "secondary" : "default"}>{source.isActive === false ? "Inactive" : "Active"}</Badge></TableCell>{canManageSources ? <TableCell className="space-x-2 text-right"><Button size="sm" variant="outline" onClick={() => edit(source)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => remove(source.id)}>Delete</Button></TableCell> : null}</TableRow>)}</TableBody></Table></CardContent></Card>
  </div>;
}
