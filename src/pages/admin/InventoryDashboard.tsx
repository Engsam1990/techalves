import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock3,
  Download,
  Layers,
  Package,
  ScanLine,
  ShieldAlert,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProductRestockDialog from "@/components/admin/ProductRestockDialog";
import { useReportFetch, getDateRangeLabel, type TimeRange } from "@/hooks/useReportFetch";
import { formatStatusLabel, formatCompactValue, formatPercent, formatReportDate, statusBadgeVariant } from "@/utils/formatters";
import { downloadCSV, InventoryCsvBuilder } from "@/utils/csv";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission, type AdminPermission } from "@/lib/adminPermissions";

interface InventorySummary {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  overstockProducts: number;
  dormantProducts: number;
  missingBarcodeProducts: number;
  totalUnits: number;
  totalStockReceived: number;
  inventoryValue: number;
  averageUnitsPerSku: number;
  averageValuePerSku: number;
  movementCount: number;
  inboundUnits: number;
  outboundUnits: number;
  adjustmentUnits: number;
  netUnits: number;
}

interface StatusBreakdownItem {
  status: string;
  count: number;
  units: number;
  value: number;
}

interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  skuCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  units: number;
  value: number;
}

interface MovementTimelineItem {
  date: string;
  inboundUnits: number;
  outboundUnits: number;
  adjustmentUnits: number;
  netUnits: number;
  movementCount: number;
}

interface ProductIssueItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  barcode?: string | null;
  categoryName: string;
  stockQuantity: number;
  price: number;
  inventoryValue: number;
  status: string;
  lastMovementAt?: string | null;
  lastMovementType?: string | null;
  daysSinceLastMovement?: number | null;
  movementInPeriod: {
    inboundUnits: number;
    outboundUnits: number;
    adjustmentUnits: number;
    netUnits: number;
    movementCount: number;
  };
}

interface RecentMovementItem {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string | null;
  brand?: string | null;
  categoryName: string;
  type: string;
  typeLabel: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  note?: string | null;
  orderId?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  createdAt: string;
}

type RestockProduct = {
  id: string;
  name: string;
  price: number;
  stockQuantity?: number;
  totalStockReceived?: number;
  images?: string[];
  serialNumbers?: Array<{ serialNumber?: string } | string>;
};

interface InventoryReport {
  period: {
    start: string;
    end: string;
    days: number;
  };
  thresholds: {
    lowStock: number;
    overstock: number;
    dormantDays: number;
  };
  summary: InventorySummary;
  stockStatusBreakdown: StatusBreakdownItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  movementTimeline: MovementTimelineItem[];
  topOutgoing: ProductIssueItem[];
  topIncoming: ProductIssueItem[];
  recentMovements: RecentMovementItem[];
  issues: {
    lowStockProducts: ProductIssueItem[];
    outOfStockProducts: ProductIssueItem[];
    overstockProducts: ProductIssueItem[];
    dormantProducts: ProductIssueItem[];
    missingBarcodeProducts: ProductIssueItem[];
  };
}

const INVENTORY_SECTION_PERMISSIONS: AdminPermission[] = [
  "inventory:view_overview",
  "inventory:view_metrics",
  "inventory:view_stock_health",
  "inventory:view_categories",
  "inventory:view_movements",
  "inventory:view_product_flow",
  "inventory:view_action_lists",
];

const STOCK_HEALTH_COLORS: Record<string, string> = {
  healthy: "#16a34a",
  in_stock: "#16a34a",
  low_stock: "#d97706",
  out_of_stock: "#dc2626",
  overstock: "#2563eb",
  dormant: "#7c3aed",
  missing_barcode: "#0891b2",
};

function stockHealthColor(status: string) {
  return STOCK_HEALTH_COLORS[String(status || "").trim().toLowerCase()] || "#64748b";
}

const InventoryTooltip = Tooltip as unknown as FC<TooltipProps<number, string>>;

function IssueListCard({
  title,
  description,
  count,
  items,
  emptyMessage,
  actionHref,
  actionLabel,
  quickActionLabel,
  quickActionLoadingId,
  onQuickAction,
}: {
  title: string;
  description: string;
  count: number;
  items: ProductIssueItem[];
  emptyMessage: string;
  actionHref: string;
  actionLabel: string;
  quickActionLabel?: string;
  quickActionLoadingId?: string | null;
  onQuickAction?: (item: ProductIssueItem) => void;
}) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-display text-lg">{title}</CardTitle>
            <Badge variant={count > 0 ? "secondary" : "outline"}>{count}</Badge>
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between"
              >
                <Link to={`/admin/products/${item.id}`} className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.name}</p>
                       
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.brand || "Unknown brand"} | {item.categoryName}</span>
                        <Badge className="text-[9px]" variant={statusBadgeVariant(item.status)}>
                          {formatStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last movement: {item.lastMovementAt ? new Date(item.lastMovementAt).toLocaleString() : "No movement yet"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-foreground">{item.stockQuantity} units</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.inventoryValue)}</p>
                    </div>
                  </div>
                </Link>
                {onQuickAction ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={quickActionLoadingId === item.id}
                    onClick={() => onQuickAction(item)}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {quickActionLoadingId === item.id ? "Loading..." : quickActionLabel || "Restock"}
                  </Button>
                ) : null}
              </div>
            ))}
            {count > items.length ? (
              <p className="text-xs text-muted-foreground">
                Showing the top {items.length} products out of {count} currently flagged.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const InventoryDashboard = () => {
  const { user } = useAuth();
  const canViewInventorySection = (permission: AdminPermission) => hasAdminPermission(user, permission);
  const canViewAnyInventorySection = INVENTORY_SECTION_PERMISSIONS.some((permission) => hasAdminPermission(user, permission));
  const canViewOverview = canViewInventorySection("inventory:view_overview");
  const canViewMetrics = canViewInventorySection("inventory:view_metrics");
  const canViewStockHealth = canViewInventorySection("inventory:view_stock_health");
  const canViewCategories = canViewInventorySection("inventory:view_categories");
  const canViewMovements = canViewInventorySection("inventory:view_movements");
  const canViewProductFlow = canViewInventorySection("inventory:view_product_flow");
  const canViewActionLists = canViewInventorySection("inventory:view_action_lists");
  const canReceiveStock = hasAdminPermission(user, "inventory:receive_stock");
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [restockProduct, setRestockProduct] = useState<RestockProduct | null>(null);
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockingProductId, setRestockingProductId] = useState<string | null>(null);

  const { report, loading, error, refetch } = useReportFetch({
    apiMethod: adminApi.getInventoryReport,
    timeRange,
    startDate,
    endDate,
    onError: (err) => toast.error(err.message || "Failed to load inventory dashboard"),
  });

  const summary = report?.summary;
  const timeline = report?.movementTimeline || [];
  const stockStatusBreakdown = report?.stockStatusBreakdown || [];
  const categoryBreakdown = report?.categoryBreakdown || [];
  const topOutgoing = report?.topOutgoing || [];
  const topIncoming = report?.topIncoming || [];
  const recentMovements = report?.recentMovements || [];
  const issues = report?.issues;
  const stockCoverageRate = summary?.totalProducts ? (summary.inStockProducts / summary.totalProducts) * 100 : 0;
  const scanCoverageRate = summary?.inStockProducts
    ? ((summary.inStockProducts - summary.missingBarcodeProducts) / summary.inStockProducts) * 100
    : 100;
  const largestCategory = categoryBreakdown[0] || null;
  const largestCategoryShare = largestCategory && summary?.inventoryValue
    ? (largestCategory.value / summary.inventoryValue) * 100
    : 0;
  const quickRestockItems = canViewOverview || canViewActionLists ? [...(issues?.lowStockProducts || []), ...(issues?.outOfStockProducts || [])]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, 4) : [];

  const stockHealthBreakdown = stockStatusBreakdown
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label: formatStatusLabel(item.status),
    }));

  const handleOpenRestock = async (productId: string) => {
    if (!canReceiveStock) return;
    setRestockingProductId(productId);
    try {
      const product = await adminApi.getProduct(productId);
      setRestockProduct(product);
      setRestockOpen(true);
    } catch {
      toast.error("Failed to load product for restock");
    } finally {
      setRestockingProductId(null);
    }
  };

  const handleRestockSaved = async () => {
    setRestockOpen(false);
    setRestockProduct(null);
    await refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Inventory Dashboard</h2>
          <p className="mt-1 text-muted-foreground">
            Track stock health, movement flow, inventory value, and action items across {getDateRangeLabel(timeRange, startDate, endDate).toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={(value) => {
              const nextValue = value as TimeRange;
              setTimeRange(nextValue);
              if (nextValue !== "custom") {
                setStartDate(undefined);
                setEndDate(undefined);
              }
            }}
          >
            <SelectTrigger className="w-48">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === "custom" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => (endDate ? date > endDate : false)}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : null}

          {canViewAnyInventorySection ? (
            <Button
              variant="outline"
              disabled={!report || loading}
              onClick={() => {
              if (!report) return;
              const csv = new InventoryCsvBuilder()
                .addGenerationInfo()
                .addPeriod(report.period.start, report.period.end)
                  .addSummary([
                  ["Inventory Value", Number(report.summary.inventoryValue || 0).toFixed(2)],
                  ["Units On Hand", report.summary.totalUnits],
                  ["Total Stock Received", report.summary.totalStockReceived],
                  ["Total SKUs", report.summary.totalProducts],
                  ["In Stock", report.summary.inStockProducts],
                  ["Low Stock", report.summary.lowStockProducts],
                  ["Out Of Stock", report.summary.outOfStockProducts],
                  ["Overstock", report.summary.overstockProducts],
                  ["Dormant Products", report.summary.dormantProducts],
                  ["Missing Barcode Products", report.summary.missingBarcodeProducts],
                ])
                .addCategoryBreakdown(report.categoryBreakdown)
                .addMovements(report.recentMovements)
                .build();
              downloadCSV(csv, `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`);
              toast.success("Inventory report exported");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          ) : null}
        </div>
      </div>

      {timeRange === "custom" && (!startDate || !endDate) ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Select both a start date and an end date to load the custom inventory dashboard.
          </CardContent>
        </Card>
      ) : null}

      {!canViewAnyInventorySection ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            Your account can open inventory, but no inventory dashboard sections are enabled yet.
          </CardContent>
        </Card>
      ) : null}

      {canViewOverview ? <div className="grid gap-6 items-start xl:grid-cols-3">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background xl:col-span-2">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="font-display text-xl">Inventory Control Center</CardTitle>
                <CardDescription>
                  A single view of stock coverage, scan readiness, inventory concentration, and movement pressure.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {loading ? "Loading window" : `${report?.period.days || 0} day window`}
                </Badge>
                <Badge variant="outline">Low stock &lt;= {report?.thresholds.lowStock || 0}</Badge>
                <Badge variant="outline">Overstock &gt;= {report?.thresholds.overstock || 0}</Badge>
                <Badge variant="outline">Dormant &gt;= {report?.thresholds.dormantDays || 0} days</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Stock Coverage",
                  value: formatPercent(stockCoverageRate),
                  helper: `${summary?.inStockProducts || 0} of ${summary?.totalProducts || 0} SKUs available`,
                },
                {
                  label: "Scan Coverage",
                  value: formatPercent(scanCoverageRate),
                  helper: `${summary?.missingBarcodeProducts || 0} in-stock SKUs still missing barcodes`,
                },
                {
                  label: "Net Stock Change",
                  value: `${(summary?.netUnits || 0) >= 0 ? "+" : ""}${summary?.netUnits || 0}`,
                  helper: `${summary?.inboundUnits || 0} inbound vs ${summary?.outboundUnits || 0} outbound units`,
                },
                {
                  label: "Largest Category",
                  value: largestCategory ? largestCategory.categoryName : "No data",
                  helper: largestCategory
                    ? `${formatPercent(largestCategoryShare)} of inventory value`
                    : "Waiting for category data",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border bg-background/80 p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  {loading ? <Skeleton className="mt-3 h-8 w-28" /> : (
                    <>
                      <p className="mt-3 text-2xl font-display font-bold text-foreground">{item.value}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{item.helper}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Coverage Window</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading
                      ? "Preparing inventory context..."
                      : `${formatReportDate(report?.period.start)} to ${formatReportDate(report?.period.end)} with ${summary?.movementCount || 0} inventory movements logged.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to="/admin/products">
                      Open Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/products?stock=sold_out">Sold Out Queue</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/pos">Open POS</Link>
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">Quick Restock</p>
                    <p className="text-xs text-muted-foreground">Fast access to the most urgent items</p>
                  </div>
                  {canReceiveStock && quickRestockItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {quickRestockItems.map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="max-w-full justify-start"
                          disabled={restockingProductId === item.id}
                          onClick={() => handleOpenRestock(item.id)}
                          title={item.name}
                        >
                          <Package className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {restockingProductId === item.id ? "Loading..." : item.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No urgent restock items right now.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

          <div className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="font-display">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Priority Watchlist
                </span>
              </CardTitle>
              <CardDescription>Fastest ways to reduce stock risk and clean up operational gaps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Low stock products", count: summary?.lowStockProducts || 0, href: "/admin/products?stock=in_stock", tone: "text-amber-700" },
                { label: "Sold out products", count: summary?.outOfStockProducts || 0, href: "/admin/products?stock=sold_out", tone: "text-destructive" },
                { label: "Dormant products", count: summary?.dormantProducts || 0, href: "/admin/products", tone: "text-primary" },
                { label: "Missing barcodes", count: summary?.missingBarcodeProducts || 0, href: "/admin/products", tone: "text-blue-700" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">Open the filtered queue and resolve the next blockers.</p>
                  </div>
                  <div className={`text-xl font-display font-bold ${item.tone}`}>{item.count}</div>
                </Link>
              ))}
            </CardContent>
          </Card>

        </div>
      </div> : null}

      {canViewMetrics ? <div className="space-y-1">
        <h3 className="text-lg font-display font-semibold text-foreground">Core Inventory Metrics</h3>
        <p className="text-sm text-muted-foreground">Current stock position, valuation, and movement totals at a glance.</p>
      </div> : null}

      {canViewMetrics ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Inventory Value", value: formatPrice(summary?.inventoryValue || 0), icon: TrendingUp, helper: `${summary?.totalProducts || 0} SKUs tracked` },
          { label: "Units On Hand", value: String(summary?.totalUnits || 0), icon: Layers, helper: `${summary?.averageUnitsPerSku || 0} avg units per SKU` },
          { label: "Total Received", value: String(summary?.totalStockReceived || 0), icon: ArrowUpRight, helper: "All stock additions recorded" },
          { label: "In-Stock SKUs", value: String(summary?.inStockProducts || 0), icon: Package, helper: `${summary?.overstockProducts || 0} overstocked` },
          { label: "Low Stock", value: String(summary?.lowStockProducts || 0), icon: AlertTriangle, helper: `Threshold: ${report?.thresholds.lowStock || 0} units` },
          { label: "Sold Out", value: String(summary?.outOfStockProducts || 0), icon: XCircle, helper: "Requires replenishment" },
          { label: "Dormant Stock", value: String(summary?.dormantProducts || 0), icon: BarChart3, helper: `${report?.thresholds.dormantDays || 0}+ days without movement` },
        ].map(({ label, value, icon: Icon, helper }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{value}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {[
          { label: "Inbound Units", value: summary?.inboundUnits || 0, icon: ArrowUpRight, tone: "text-green-600", helper: "Restocks and returns added" },
          { label: "Outbound Units", value: summary?.outboundUnits || 0, icon: ArrowDownLeft, tone: "text-amber-600", helper: "Sales and order deductions" },
          { label: "Adjustments", value: summary?.adjustmentUnits || 0, icon: BarChart3, tone: "text-blue-600", helper: `${summary?.movementCount || 0} movements recorded` },
          { label: "Missing Barcodes", value: summary?.missingBarcodeProducts || 0, icon: ScanLine, tone: "text-destructive", helper: "In-stock products missing scan support" },
        ].map(({ label, value, icon: Icon, tone, helper }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${tone}`} />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{value}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div> : null}

      {canViewMetrics ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                Period Context
              </span>
            </CardTitle>
            <CardDescription>Useful benchmarks for the current reporting window.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Average value per SKU", value: formatPrice(summary?.averageValuePerSku || 0) },
              { label: "Average units per SKU", value: `${summary?.averageUnitsPerSku || 0} units` },
              { label: "Inventory value", value: formatPrice(summary?.inventoryValue || 0) },
              {
                label: "Top category exposure",
                value: largestCategory ? `${largestCategory.categoryName} (${formatPercent(largestCategoryShare)})` : "No category data",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {loading ? <Skeleton className="mt-2 h-5 w-24" /> : <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {canViewMovements ? <Card>
        <CardHeader>
          <CardTitle className="font-display">Movement Timeline</CardTitle>
          <CardDescription>Daily inflow, outflow, and net stock change over the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[240px] w-full" /> : timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => format(new Date(`${value}T00:00:00Z`), "MMM d")} />
                <YAxis />
                <InventoryTooltip
                  labelFormatter={(value) => format(new Date(`${String(value)}T00:00:00Z`), "MMM dd, yyyy")}
                />
                <Legend />
                <Bar dataKey="inboundUnits" fill="#16a34a" name="Inbound Units" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outboundUnits" fill="#ea580c" name="Outbound Units" radius={[4, 4, 0, 0]} />
                <Line dataKey="netUnits" stroke="#2563eb" strokeWidth={2} name="Net Units" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              No inventory movement is available for this period.
            </div>
          )}
        </CardContent>
      </Card> : null}

      {(canViewStockHealth || canViewCategories) ? <div className="grid gap-6 items-start lg:grid-cols-2">
        {canViewStockHealth ? <Card>
          <CardHeader>
            <CardTitle className="font-display">Stock Health Distribution</CardTitle>
            <CardDescription>Current SKU split across stock-health buckets.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : stockStatusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={stockHealthBreakdown}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                  >
                    {stockHealthBreakdown.map((item: { status: string; count: number; units: number; value: number; label: string }) => (
                      <Cell key={item.status} fill={stockHealthColor(item.status)} />
                    ))}
                  </Pie>
                  <Legend />
                  <InventoryTooltip formatter={(value, _name, item) => [value, item?.payload?.label || "SKUs"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                No stock status data is available.
              </div>
            )}
          </CardContent>
        </Card> : null}

        {canViewCategories ? <Card>
          <CardHeader>
            <CardTitle className="font-display">Category Inventory Value</CardTitle>
            <CardDescription>Top categories by current stock value.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryBreakdown.slice(0, 8).map((item) => ({ ...item, shortName: item.categoryName.slice(0, 14) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortName" />
                    <YAxis tickFormatter={(value) => formatCompactValue(Number(value || 0))} />
                  <InventoryTooltip formatter={(value, name) => name === "Inventory Value" ? [formatPrice(Number(value || 0)), name] : [value, name]} />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" name="Inventory Value" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="units" fill="#16a34a" name="Units On Hand" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                No category data is available.
              </div>
            )}
          </CardContent>
        </Card> : null}
      </div> : null}

      {canViewProductFlow ? <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Fastest Outflow Products</CardTitle>
            <CardDescription>Products leaving inventory fastest in this period.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
              </div>
            ) : topOutgoing.length > 0 ? (
              <div className="space-y-3">
                {topOutgoing.map((item) => (
                  <Link
                    key={item.id}
                    to={`/admin/products/${item.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand || "Unknown brand"} | {item.categoryName}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-foreground">-{item.movementInPeriod.outboundUnits} units</p>
                      <p className="text-xs text-muted-foreground">{item.stockQuantity} left</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No outbound movement recorded in this period.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Top Replenished Products</CardTitle>
            <CardDescription>Products receiving the most stock in this period.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
              </div>
            ) : topIncoming.length > 0 ? (
              <div className="space-y-3">
                {topIncoming.map((item) => (
                  <Link
                    key={item.id}
                    to={`/admin/products/${item.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand || "Unknown brand"} | {item.categoryName}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-foreground">+{item.movementInPeriod.inboundUnits} units</p>
                      <p className="text-xs text-muted-foreground">{item.stockQuantity} on hand</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No inbound movement recorded in this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div> : null}

      {canViewActionLists ? <div className="columns-1 space-y-2 [column-gap:1.5rem] xl:columns-2">
        <IssueListCard
          title="Low Stock Action List"
          description="Products approaching stock-out and likely needing replenishment soon."
          count={summary?.lowStockProducts || 0}
          items={issues?.lowStockProducts || []}
          emptyMessage="No low-stock products right now."
          actionHref="/admin/products"
          actionLabel="Open Products"
          quickActionLabel={canReceiveStock ? "Restock" : undefined}
          quickActionLoadingId={restockingProductId}
          onQuickAction={canReceiveStock ? (item) => handleOpenRestock(item.id) : undefined}
        />
        <IssueListCard
          title="Sold Out Action List"
          description="Products currently unavailable for sale."
          count={summary?.outOfStockProducts || 0}
          items={issues?.outOfStockProducts || []}
          emptyMessage="No sold-out products right now."
          actionHref="/admin/products?stock=sold_out"
          actionLabel="View Sold Out"
          quickActionLabel={canReceiveStock ? "Restock" : undefined}
          quickActionLoadingId={restockingProductId}
          onQuickAction={canReceiveStock ? (item) => handleOpenRestock(item.id) : undefined}
        />
        <IssueListCard
          title="Overstock Review List"
          description="Products holding unusually high stock and tying up inventory value."
          count={summary?.overstockProducts || 0}
          items={issues?.overstockProducts || []}
          emptyMessage="No overstock products right now."
          actionHref="/admin/products"
          actionLabel="Review Stock"
        />
        <IssueListCard
          title="Dormant Stock"
          description="In-stock products with no recorded movement beyond the dormancy threshold."
          count={summary?.dormantProducts || 0}
          items={issues?.dormantProducts || []}
          emptyMessage="No dormant stock detected."
          actionHref="/admin/products"
          actionLabel="Review Products"
        />
        <IssueListCard
          title="Missing Barcode Coverage"
          description="In-stock products that cannot be scanned cleanly in POS."
          count={summary?.missingBarcodeProducts || 0}
          items={issues?.missingBarcodeProducts || []}
          emptyMessage="All in-stock products have barcodes."
          actionHref="/admin/products"
          actionLabel="Fix Products"
        />
      </div> : null}

      {canReceiveStock ? <ProductRestockDialog
        product={restockProduct}
        open={restockOpen}
        onOpenChange={(open) => {
          setRestockOpen(open);
          if (!open) setRestockProduct(null);
        }}
        onSaved={handleRestockSaved}
      /> : null}

      {canViewMovements ? <Card>
        <CardHeader>
          <CardTitle className="font-display">Recent Inventory Movements</CardTitle>
          <CardDescription>Latest inventory ledger activity across admin updates, POS, and order processing.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
            </div>
          ) : recentMovements.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Before</TableHead>
                    <TableHead className="text-right">After</TableHead>
                    <TableHead className="hidden md:table-cell">Actor / Note</TableHead>
                    <TableHead className="hidden lg:table-cell">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <Link to={`/admin/products/${movement.productId}`} className="block">
                          <p className="font-medium text-foreground">{movement.productName}</p>
                          <p className="text-xs text-muted-foreground">{movement.brand || "Unknown brand"} | {movement.categoryName}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{movement.typeLabel}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${movement.quantityChange >= 0 ? "text-green-700" : "text-amber-700"}`}>
                        {movement.quantityChange >= 0 ? "+" : ""}{movement.quantityChange}
                      </TableCell>
                      <TableCell className="text-right">{movement.quantityBefore}</TableCell>
                      <TableCell className="text-right">{movement.quantityAfter}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm text-foreground">{movement.adminName || movement.adminEmail || "System"}</p>
                        <p className="text-xs text-muted-foreground">{movement.note || "No note"}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No inventory movements are available for this period.
            </div>
          )}
        </CardContent>
      </Card> : null}
    </div>
  );
};

export default InventoryDashboard;
