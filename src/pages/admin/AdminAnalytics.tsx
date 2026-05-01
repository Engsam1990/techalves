import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointerClick, MessageSquare, GitCompare } from "lucide-react";

const AdminAnalytics = () => {
  const [productStats, setProductStats] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getProductAnalytics(Number(days)),
      adminApi.getTimeline(Number(days)),
    ])
      .then(([products, tl]) => {
        setProductStats(products);
        setTimeline(tl);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  const totalViews = productStats.reduce((s, p) => s + (p.views || 0), 0);
  const totalClicks = productStats.reduce((s, p) => s + (p.clicks || 0), 0);
  const totalInquiries = productStats.reduce((s, p) => s + (p.inquiries || 0), 0);
  const totalComparisons = productStats.reduce((s, p) => s + (p.comparisons || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">Product Analytics</h2>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Views", value: totalViews, icon: Eye, color: "text-primary" },
          { label: "Clicks", value: totalClicks, icon: MousePointerClick, color: "text-blue-500" },
          { label: "Inquiries", value: totalInquiries, icon: MessageSquare, color: "text-green-600" },
          { label: "Comparisons", value: totalComparisons, icon: GitCompare, color: "text-secondary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-2xl font-bold font-display text-foreground">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Daily Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32 overflow-x-auto">
              {timeline.map((d) => {
                const max = Math.max(...timeline.map((t) => t.views || 1));
                const height = Math.max(8, ((d.views || 0) / max) * 100);
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1 min-w-[24px]">
                    <div className="bg-primary rounded-t" style={{ height: `${height}%`, width: 16 }} title={`${d.date}: ${d.views} views`} />
                    <span className="text-[9px] text-muted-foreground rotate-45 origin-left">{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-product table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Per-Product Performance</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-center">Inquiries</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Comparisons</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productStats
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.image && <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />}
                          <div>
                            <p className="font-medium text-foreground text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{p.views || 0}</TableCell>
                      <TableCell className="text-center font-medium">{p.clicks || 0}</TableCell>
                      <TableCell className="text-center font-medium">{p.inquiries || 0}</TableCell>
                      <TableCell className="text-center font-medium hidden sm:table-cell">{p.comparisons || 0}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex gap-1">
                          {p.inStock ? (
                            <Badge variant="default" className="bg-green-600 text-xs">Stock</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Sold</Badge>
                          )}
                          {p.featured && <Badge variant="secondary" className="text-xs">★</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
