import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, Play, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/api/adminApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type MigrationRow = {
  id: string;
  filename: string;
  size: number;
  modifiedAt: string;
  status: "pending" | "applied";
  appliedAt?: string | null;
};

type MigrationResponse = {
  migrations: MigrationRow[];
  pendingCount: number;
  appliedCount?: number;
};

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function AdminDatabaseMigrations() {
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [data, setData] = useState<MigrationResponse>({ migrations: [], pendingCount: 0, appliedCount: 0 });

  const pending = useMemo(() => data.migrations.filter((item) => item.status === "pending"), [data.migrations]);

  const loadMigrations = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getDatabaseMigrations();
      setData({
        migrations: Array.isArray(result?.migrations) ? result.migrations : [],
        pendingCount: Number(result?.pendingCount || 0),
        appliedCount: Number(result?.appliedCount || 0),
      });
    } catch (error: any) {
      toast.error(error.message || "Could not load migrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMigrations();
  }, []);

  const runMigrations = async (id?: string) => {
    const label = id ? "this migration" : "all pending migrations";
    if (!window.confirm(`Run ${label}? Make sure you have a database backup before continuing.`)) return;

    setRunningId(id || "__all__");
    try {
      const result = await adminApi.runDatabaseMigrations(id);
      setData({
        migrations: Array.isArray(result?.migrations) ? result.migrations : [],
        pendingCount: Number(result?.pendingCount || 0),
        appliedCount: Array.isArray(result?.migrations) ? result.migrations.filter((item: MigrationRow) => item.status === "applied").length : 0,
      });
      toast.success(result?.ran?.length ? `Ran ${result.ran.length} migration(s)` : "No pending migrations");
    } catch (error: any) {
      toast.error(error.message || "Could not run migrations");
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Database migrations</h1>
            <Badge variant={pending.length ? "destructive" : "secondary"}>
              {pending.length ? `${pending.length} pending` : "Up to date"}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Review SQL files in <code>database/manual-migrations</code>, then run pending migrations from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadMigrations} disabled={loading || Boolean(runningId)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => runMigrations()} disabled={!pending.length || Boolean(runningId)}>
            <Play className="mr-2 h-4 w-4" />
            {runningId === "__all__" ? "Running..." : "Run pending"}
          </Button>
        </div>
      </div>

      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Backup before running migrations</AlertTitle>
        <AlertDescription>
          This runs SQL directly against the configured MySQL database and records completed files in <code className="rounded bg-background/70 px-1 py-0.5">schema_migrations</code>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Migration files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.migrations.map((migration) => (
                    <TableRow key={migration.id}>
                      <TableCell className="font-medium">{migration.filename}</TableCell>
                      <TableCell>
                        <Badge variant={migration.status === "pending" ? "destructive" : "secondary"}>
                          {migration.status === "pending" ? "Pending" : "Applied"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(Number(migration.size || 0))}</TableCell>
                      <TableCell>{formatDate(migration.modifiedAt)}</TableCell>
                      <TableCell>{formatDate(migration.appliedAt)}</TableCell>
                      <TableCell className="text-right">
                        {migration.status === "pending" ? (
                          <Button size="sm" onClick={() => runMigrations(migration.id)} disabled={Boolean(runningId)}>
                            <Play className="mr-2 h-4 w-4" />
                            {runningId === migration.id ? "Running..." : "Run"}
                          </Button>
                        ) : (
                          <span className="inline-flex items-center justify-end gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            Done
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data.migrations.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No migration files found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
