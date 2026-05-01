import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadSubscribers = () => {
    setLoading(true);
    adminApi.getNewsletterSubscribers({ q: search || undefined })
      .then(setSubscribers)
      .catch((err) => toast.error(err.message || "Could not load subscribers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSubscribers(); }, []);

  const removeSubscriber = async (id: string) => {
    if (!window.confirm("Remove this subscriber?")) return;
    try {
      await adminApi.deleteNewsletterSubscriber(id);
      toast.success("Subscriber removed");
      loadSubscribers();
    } catch (err: any) {
      toast.error(err.message || "Could not remove subscriber");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Newsletter subscribers</h2>
      <div className="flex gap-3">
        <Input placeholder="Search by email or source..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={loadSubscribers}>Search</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="font-display">Subscribers</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.source || "—"}</TableCell>
                      <TableCell>{new Date(subscriber.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => removeSubscriber(subscriber.id)}>Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNewsletter;
