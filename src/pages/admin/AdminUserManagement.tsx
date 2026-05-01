import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ADMIN_PERMISSION_DEFINITIONS,
  STANDARD_ADMIN_DEFAULT_PERMISSIONS,
  groupPermissionDefinitions,
  type AdminPermission,
} from "@/lib/adminPermissions";

const permissionGroups = groupPermissionDefinitions(ADMIN_PERMISSION_DEFINITIONS);

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "admin" as "admin" | "super_admin",
  isActive: true,
  permissions: STANDARD_ADMIN_DEFAULT_PERMISSIONS,
};

const emptyResetForm = {
  newPassword: "",
  confirmPassword: "",
};

function normalizePermissions(values?: string[] | null): AdminPermission[] {
  const valid = new Set(ADMIN_PERMISSION_DEFINITIONS.map((item) => item.key));
  return Array.from(new Set((values || []).filter((item) => valid.has(item as AdminPermission)))) as AdminPermission[];
}

function PermissionChecklist({
  role,
  value,
  onChange,
}: {
  role: "admin" | "super_admin";
  value: AdminPermission[];
  onChange: (next: AdminPermission[]) => void;
}) {
  const isSuperAdmin = role === "super_admin";
  const selected = new Set(isSuperAdmin ? ADMIN_PERMISSION_DEFINITIONS.map((item) => item.key) : value);

  const toggle = (permission: AdminPermission, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(permission);
    else next.delete(permission);
    onChange(normalizePermissions(Array.from(next)));
  };

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Super admins always receive all permissions. Switch the role to Admin to customize exact access.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(permissionGroups).map(([group, permissions]) => (
          <div key={group} className="rounded-lg border bg-card p-3">
            <p className="mb-3 text-sm font-semibold text-foreground">{group}</p>
            <div className="space-y-3">
              {permissions.map((permission) => (
                <label key={permission.key} className="flex cursor-pointer gap-3 rounded-md p-2 hover:bg-muted/60">
                  <Checkbox
                    checked={selected.has(permission.key)}
                    disabled={isSuperAdmin}
                    onCheckedChange={(checked) => toggle(permission.key, Boolean(checked))}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-medium leading-none">{permission.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">{permission.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AdminUserManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState<any[]>([]);
  const [promotionCandidates, setPromotionCandidates] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<any | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<AdminPermission[]>([]);
  const [resetForm, setResetForm] = useState(emptyResetForm);
  const [resetting, setResetting] = useState(false);

  const loadData = async (query?: string) => {
    setLoading(true);
    try {
      const [userResponse, activityResponse] = await Promise.all([
        adminApi.getAdminUsers({ q: query || undefined }),
        adminApi.getAdminActivityLogs({ limit: 20 }),
      ]);
      setAdmins(Array.isArray(userResponse?.admins) ? userResponse.admins : []);
      setPromotionCandidates(Array.isArray(userResponse?.promotionCandidates) ? userResponse.promotionCandidates : []);
      setActivityLogs(Array.isArray(activityResponse?.logs) ? activityResponse.logs : []);
    } catch (error: any) {
      toast.error(error.message || "Could not load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "super_admin") loadData();
  }, [user?.role]);

  const totals = useMemo(
    () => ({
      total: admins.length,
      active: admins.filter((item) => item.isActive).length,
      superAdmins: admins.filter((item) => item.role === "super_admin").length,
    }),
    [admins]
  );

  if (user?.role !== "super_admin") return <Navigate to="/admin/dashboard" replace />;

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.createAdminUser({ ...form, permissions: form.role === "super_admin" ? [] : form.permissions });
      toast.success("Admin user created successfully");
      setForm(emptyForm);
      await loadData(search);
    } catch (error: any) {
      toast.error(error.message || "Could not create admin user");
    } finally {
      setSaving(false);
    }
  };

  const handlePromote = async (customerId: string, role: "admin" | "super_admin" = "admin") => {
    setPromotingId(customerId);
    try {
      await adminApi.promoteCustomerToAdmin({
        customerId,
        role,
        permissions: role === "super_admin" ? [] : STANDARD_ADMIN_DEFAULT_PERMISSIONS,
      });
      toast.success(role === "super_admin" ? "User promoted to super admin" : "User promoted to admin");
      await loadData(search);
    } catch (error: any) {
      toast.error(error.message || "Could not promote user");
    } finally {
      setPromotingId(null);
    }
  };

  const handleAdminUpdate = async (adminId: string, patch: any) => {
    setUpdatingId(adminId);
    try {
      await adminApi.updateAdminUser(adminId, patch);
      toast.success("Admin user updated");
      await loadData(search);
    } catch (error: any) {
      toast.error(error.message || "Could not update admin user");
    } finally {
      setUpdatingId(null);
    }
  };

  const openPermissionDialog = (admin: any) => {
    setPermissionTarget(admin);
    setPermissionDraft(normalizePermissions(admin.permissions || STANDARD_ADMIN_DEFAULT_PERMISSIONS));
  };

  const savePermissions = async () => {
    if (!permissionTarget) return;
    await handleAdminUpdate(permissionTarget.id, {
      permissions: permissionTarget.role === "super_admin" ? [] : permissionDraft,
    });
    setPermissionTarget(null);
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetTarget) return;
    if (resetForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (resetForm.newPassword !== resetForm.confirmPassword) return toast.error("Passwords do not match");

    setResetting(true);
    try {
      await adminApi.resetAdminUserPassword(resetTarget.id, { newPassword: resetForm.newPassword });
      toast.success(`Password reset for ${resetTarget.name}`);
      setResetTarget(null);
      setResetForm(emptyResetForm);
      await loadData(search);
    } catch (error: any) {
      toast.error(error.message || "Could not reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await adminApi.deleteAdminUser(deleteTarget.id);
      toast.success("Admin user deleted");
      setDeleteTarget(null);
      await loadData(search);
    } catch (error: any) {
      toast.error(error.message || "Could not delete admin user");
    } finally {
      setDeletingId(null);
    }
  };

  const describeActivity = (log: any) => {
    switch (log.action) {
      case "admin_created":
        return "created a new admin account";
      case "customer_promoted":
        return "promoted a customer to admin";
      case "admin_updated":
        return "updated admin access";
      case "password_reset":
        return "reset an admin password";
      case "admin_deleted":
        return "deleted an admin account";
      default:
        return log.action?.replace(/_/g, " ") || "updated admin access";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Admin Users & Permissions</h2>
          <p className="text-sm text-muted-foreground">Create staff accounts and control exactly which admin panels and actions they can use.</p>
        </div>
        <Button variant="outline" onClick={() => loadData(search)}>Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Admin Accounts</CardTitle></CardHeader><CardContent><p className="text-2xl font-display font-bold">{totals.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Admins</CardTitle></CardHeader><CardContent><p className="text-2xl font-display font-bold">{totals.active}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Super Admins</CardTitle></CardHeader><CardContent><p className="text-2xl font-display font-bold">{totals.superAdmins}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Promotion Candidates</CardTitle></CardHeader><CardContent><p className="text-2xl font-display font-bold">{promotionCandidates.length}</p></CardContent></Card>
      </div>
 <Card>
        <CardHeader>
          <CardTitle className="font-display">Current Admin Team</CardTitle>
          <CardDescription>Role changes, active status, permission assignment, password resets, and cleanup are all audited.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table>
                <TableHeader><TableRow><TableHead>Admin</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Permissions</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {admins.map((admin) => {
                    const isSelf = admin.id === user?.id;
                    const permissionCount = Array.isArray(admin.permissions) ? admin.permissions.length : 0;
                    return (
                      <TableRow key={admin.id}>
                        <TableCell><div><p className="font-medium">{admin.name}</p><p className="text-xs text-muted-foreground">{admin.email}</p></div></TableCell>
                        <TableCell><Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>{admin.role === "super_admin" ? "Super admin" : "Admin"}</Badge></TableCell>
                        <TableCell><Badge variant={admin.isActive ? "outline" : "destructive"}>{admin.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell><span className="text-sm text-muted-foreground">{admin.role === "super_admin" ? "All permissions" : `${permissionCount} selected`}</span></TableCell>
                        <TableCell>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {admin.role === "super_admin" ? <Button variant="outline" size="xs" disabled={updatingId === admin.id} onClick={() => handleAdminUpdate(admin.id, { role: "admin", permissions: STANDARD_ADMIN_DEFAULT_PERMISSIONS })}>Make Admin</Button> : <Button variant="outline" size="xs" disabled={updatingId === admin.id} onClick={() => handleAdminUpdate(admin.id, { role: "super_admin" })}>Make Super</Button>}
                            <Button variant="outline" size="xs" disabled={admin.role === "super_admin"} onClick={() => openPermissionDialog(admin)}>Edit Access</Button>
                            <Button variant={admin.isActive ? "destructive" : "default"} size="xs" disabled={updatingId === admin.id} onClick={() => handleAdminUpdate(admin.id, { isActive: !admin.isActive })}>{admin.isActive ? "Disable" : "Activate"}</Button>
                            <Button variant="outline" size="xs" onClick={() => { setResetTarget(admin); setResetForm(emptyResetForm); }}>Reset Password</Button>
                            <Button variant="destructive" size="xs" disabled={isSelf || deletingId === admin.id} onClick={() => setDeleteTarget(admin)}>Delete</Button>
                          </div>
                          {isSelf && <p className="mt-2 text-xs text-muted-foreground">Self-delete is blocked here.</p>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Create Admin Account</CardTitle>
            <CardDescription>New standard admins only receive the permissions selected below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateAdmin}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="admin-name">Full name</Label><Input id="admin-name" value={form.name} onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" value={form.email} onChange={(e) => setForm((prev: any) => ({ ...prev, email: e.target.value }))} required /></div>
                <div className="space-y-2"><Label htmlFor="admin-password">Password</Label><Input id="admin-password" type="password" minLength={6} value={form.password} onChange={(e) => setForm((prev: any) => ({ ...prev, password: e.target.value }))} required /></div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(value) => setForm((prev: any) => ({ ...prev, role: value as "admin" | "super_admin" }))}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="super_admin">Super admin</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Active account</p><p className="text-xs text-muted-foreground">Inactive admins cannot sign in.</p></div>
                <Switch checked={Boolean(form.isActive)} onCheckedChange={(checked) => setForm((prev: any) => ({ ...prev, isActive: checked }))} />
              </div>
              <PermissionChecklist role={form.role} value={form.permissions} onChange={(permissions) => setForm((prev: any) => ({ ...prev, permissions }))} />
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Admin"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Promote Existing Users</CardTitle>
            <CardDescription>Promoted customers keep their current password. Standard promotions receive default admin permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3"><Input placeholder="Search admins or customers..." value={search} onChange={(e) => setSearch(e.target.value)} /><Button onClick={() => loadData(search)}>Search</Button></div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div>
            ) : promotionCandidates.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No eligible customer users found for the current search.</div>
            ) : (
              <div className="space-y-3">
                {promotionCandidates.slice(0, 12).map((candidate) => (
                  <div key={candidate.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div><p className="font-medium text-foreground">{candidate.fullName}</p><p className="text-xs text-muted-foreground">{candidate.email}{candidate.phone ? ` • ${candidate.phone}` : ""}</p></div>
                      <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={promotingId === candidate.id} onClick={() => handlePromote(candidate.id, "admin")}>Promote to Admin</Button><Button disabled={promotingId === candidate.id} onClick={() => handlePromote(candidate.id, "super_admin")}>Make Super Admin</Button></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

     

      <Card>
        <CardHeader><CardTitle className="font-display">Admin Access Activity</CardTitle><CardDescription>Recent super admin actions for promotions, permission changes, password resets, and deletions.</CardDescription></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div> : activityLogs.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No admin activity recorded yet.</div> : (
            <div className="space-y-3">
              {activityLogs.map((log) => <div key={log.id} className="rounded-lg border p-4 text-sm"><p><span className="font-medium">{log.actorEmail || "System"}</span> {describeActivity(log)} {log.targetEmail ? <span className="text-muted-foreground">for {log.targetEmail}</span> : null}</p><p className="mt-1 text-xs text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}{log?.details?.after?.role ? ` • New role: ${String(log.details.after.role).replace("_", " ")}` : ""}{Array.isArray(log?.details?.after?.permissions) ? ` • ${log.details.after.permissions.length} permissions` : ""}</p></div>)}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(permissionTarget)} onOpenChange={(open) => !open && setPermissionTarget(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>Edit admin access</DialogTitle><DialogDescription>{permissionTarget ? `Choose what ${permissionTarget.name} can view and change in the admin panel.` : "Choose admin permissions."}</DialogDescription></DialogHeader>
          {permissionTarget && <PermissionChecklist role={permissionTarget.role} value={permissionDraft} onChange={setPermissionDraft} />}
          <DialogFooter><Button variant="outline" onClick={() => setPermissionTarget(null)}>Cancel</Button><Button onClick={savePermissions} disabled={Boolean(updatingId)}>Save permissions</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resetTarget)} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset admin password</DialogTitle><DialogDescription>{resetTarget ? `Set a new password for ${resetTarget.name}.` : "Set a new password."}</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-2"><Label>New password</Label><Input type="password" minLength={6} value={resetForm.newPassword} onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Confirm password</Label><Input type="password" minLength={6} value={resetForm.confirmPassword} onChange={(e) => setResetForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} required /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button><Button type="submit" disabled={resetting}>{resetting ? "Resetting..." : "Reset Password"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete admin account?</AlertDialogTitle><AlertDialogDescription>This removes the admin login for {deleteTarget?.email}. The last active super admin cannot be deleted.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAdmin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deletingId ? "Deleting..." : "Delete Admin"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserManagement;
