import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const loadMessages = () => {
    setLoading(true);
    adminApi.getContactMessages({ q: search || undefined, status: status || undefined })
      .then(setMessages)
      .catch((err) => toast.error(err.message || "Could not load messages"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setStatus(searchParams.get("status") || "");
  }, [searchParams]);

  useEffect(() => { loadMessages(); }, [search, status]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await adminApi.updateContactMessageStatus(id, nextStatus);
      toast.success("Message status updated");
      loadMessages();
    } catch (err: any) {
      toast.error(err.message || "Could not update message");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await adminApi.deleteContactMessage(id);
      toast.success("Message deleted");
      loadMessages();
    } catch (err: any) {
      toast.error(err.message || "Could not delete message");
    }
  };

  const updateUrlFilters = (next: { q?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.status) params.set("status", next.status);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Contact messages</h2>
      <div className="flex flex-col gap-3 md:flex-row">
        <Input placeholder="Search messages..." value={search} onChange={(e) => { const value = e.target.value; setSearch(value); updateUrlFilters({ q: value, status }); }} />
        <select className="h-10 rounded-md border bg-background px-3" value={status} onChange={(e) => { const value = e.target.value; setStatus(value); updateUrlFilters({ q: search, status: value }); }}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="archived">Archived</option>
        </select>
        <Button onClick={() => loadMessages()}>Apply</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="font-display">Inbox</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.fullName}</p>
                          <p className="text-xs text-muted-foreground">{message.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.subject}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{message.message}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={message.status === "resolved" ? "default" : "secondary"}>{message.status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell>{new Date(message.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <select className="h-9 rounded-md border bg-background px-2 text-sm" value={message.status} onChange={(e) => updateStatus(message.id, e.target.value)}>
                          <option value="new">New</option>
                          <option value="in_progress">In progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                        <Button variant="destructive" size="sm" onClick={() => deleteMessage(message.id)}>Delete</Button>
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

export default AdminContactMessages;
