import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPosts = () => {
    setLoading(true);
    adminApi.getBlogPosts()
      .then(setPosts)
      .catch((err) => toast.error(err.message || "Could not load blog posts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      await adminApi.deleteBlogPost(id);
      toast.success("Blog post deleted");
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Could not delete post");
    }
  };

  const filtered = posts.filter((post) =>
    [post.title, post.slug, post.author, post.category].filter(Boolean).some((value: string) => value.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold">Blog posts</h2>
        <Button onClick={() => navigate("/admin/blog/new")}>
          <Plus className="mr-2 h-4 w-4" /> New post
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search posts..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">All posts</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>{post.category || "—"}</TableCell>
                      <TableCell>{new Date(post.publishedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{post.isPublished ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/blog/${post.id}`)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
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

export default AdminBlog;
