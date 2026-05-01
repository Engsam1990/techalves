import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission, type AdminPermission } from "@/lib/adminPermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPermissionGate({
  permission,
  children,
}: {
  permission: AdminPermission | AdminPermission[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const allowed = Array.isArray(permission)
    ? permission.some((item) => hasAdminPermission(user, item))
    : hasAdminPermission(user, permission);

  if (allowed) return children;

  return (
    <Card className="mx-auto max-w-2xl border-amber-200 bg-amber-50/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <ShieldAlert className="h-5 w-5" />
          Permission required
        </CardTitle>
        <CardDescription className="text-amber-800">
          Your admin account is signed in, but it is not allowed to open this admin panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to="/admin/dashboard">Back to dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
