import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";

const emptyForm = {
  slug: "",
  title: "",
  excerpt: "",
  contentHtml: "",
  imageUrl: "",
  author: "",
  category: "",
  readTime: "",
  publishedAt: new Date().toISOString().slice(0, 16),
  isPublished: true,
};

const AdminBlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = useMemo(() => Boolean(id && id !== "new"), [id]);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing || !id) return;
    adminApi
      .getBlogPost(id)
      .then((post) =>
        setForm({
          ...emptyForm,
          ...post,
          imageUrl: post.imageUrl || "",
          excerpt: post.excerpt || "",
          contentHtml: post.contentHtml || "",
          author: post.author || "",
          category: post.category || "",
          readTime: post.readTime || "",
          publishedAt: new Date(post.publishedAt).toISOString().slice(0, 16),
        })
      )
      .catch((err) => toast.error(err.message || "Could not load post"))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug || "",
        title: form.title || "",
        excerpt: form.excerpt || "",
        contentHtml: form.contentHtml || "",
        imageUrl: form.imageUrl || "",
        author: form.author || "",
        category: form.category || "",
        readTime: form.readTime || "",
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
        isPublished: Boolean(form.isPublished),
      };
      if (isEditing && id) {
        await adminApi.updateBlogPost(id, payload);
        toast.success("Blog post updated");
      } else {
        await adminApi.createBlogPost(payload);
        toast.success("Blog post created");
      }
      navigate("/admin/blog");
    } catch (err: any) {
      toast.error(err.message || "Could not save blog post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading post...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">{isEditing ? "Edit blog post" : "New blog post"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-4 lg:col-span-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((prev: any) => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((prev: any) => ({ ...prev, slug: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Read time</Label>
                <Input value={form.readTime} onChange={(e) => setForm((prev: any) => ({ ...prev, readTime: e.target.value }))} placeholder="5 min read" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm((prev: any) => ({ ...prev, author: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((prev: any) => ({ ...prev, category: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Published at</Label>
                <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((prev: any) => ({ ...prev, publishedAt: e.target.value }))} required />
              </div>
            </div>

            <ImageUploadField
              label="Cover photo"
              value={form.imageUrl}
              onChange={(value) => setForm((prev: any) => ({ ...prev, imageUrl: value }))}
              helperText="Uploaded photos are saved to the server and used in the blog listing and article page."
            />

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <RichTextEditor
                value={form.excerpt}
                onChange={(value) => setForm((prev: any) => ({ ...prev, excerpt: value }))}
                placeholder="Write a short formatted summary for the blog card and SEO description."
                minHeight={160}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                value={form.contentHtml}
                onChange={(value) => setForm((prev: any) => ({ ...prev, contentHtml: value }))}
                placeholder="Write the full blog content with headings, bullet points, quotes and links."
                minHeight={340}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 max-w-sm">
              <div>
                <p className="font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Unpublished posts stay hidden from the public blog.</p>
              </div>
              <Switch checked={form.isPublished} onCheckedChange={(checked) => setForm((prev: any) => ({ ...prev, isPublished: checked }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : isEditing ? "Update post" : "Create post"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/blog")}>Back</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminBlogForm;
