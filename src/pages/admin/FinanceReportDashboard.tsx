import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
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
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatPrice } from "@/data/products";
import { toast } from "sonner";
import { formatStatusLabel } from "@/utils/formatters";
import { downloadFinanceWorkbook } from "@/lib/exportFinanceReportXml";

type TimeRange = "1" | "7" | "14" | "30" | "60" | "90" | "custom";

interface FinanceSummary {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalExpenses: number;
  supplierExpenses?: number;
  operatingExpenses?: number;
  costOfGoodsSold?: number;
  grossProfit?: number;
  netProfit?: number;
  sourcingCost: number;
  paidSourcingCost: number;
  unpaidSourcingCost: number;
  estimatedGrossProfit: number;
  sourceProducts: number;
  totalOrders: number;
  activeOrders: number;
  paidOrders: number;
  pendingOrders: number;
  pendingStatusOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  completedOrders: number;
  backlogOrders: number;
  cancelledOrders: number;
  failedPayments: number;
  refundedOrders: number;
  averageOrderValue: number;
  collectionRate: number;
}

interface TimelinePoint {
  date: string;
  revenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  orders: number;
  paidOrders: number;
  pendingOrders: number;
}

interface BreakdownItem {
  status: string;
  count: number;
  value: number;
}

interface TopProduct {
  id: string;
  name: string;
  slug?: string | null;
  revenue: number;
  quantity: number;
  orders: number;
}

interface IssueOrder {
  id: string;
  deliveryName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionReference?: string | null;
  isWalkInCustomer?: boolean;
  createdAt: string;
}

interface PendingIssue {
  key: string;
  title: string;
  description: string;
  severity: "warning" | "info" | "destructive";
  count: number;
  amount: number;
  orders: IssueOrder[];
}

interface FinanceReport {
  period: {
    start: string;
    end: string;
    days: number;
    isCustom: boolean;
  };
  summary: FinanceSummary;
  timeline: TimelinePoint[];
  paymentBreakdown: BreakdownItem[];
  orderBreakdown: BreakdownItem[];
  topProducts: TopProduct[];
  pendingIssues: PendingIssue[];
  expenses: Array<{ id: string; details: string; category: string; amount: number; date?: string | null; orderId?: string | null; orderCustomer?: string | null; dataEntrant?: string | null; dataEntrantName?: string | null; dataEntrantEmail?: string | null; entryDate?: string | null; }>;
  sourcedProducts: Array<{ id: string; name: string; brand?: string | null; sourcedFrom?: string | null; sourcedBy?: string | null; sourceDate?: string | null; sourcePrice: number; paymentStatus: string; paidAt?: string | null; paidBy?: string | null; stockQuantity: number; totalStockReceived: number; dataEntrant?: string | null; dataEntrantName?: string | null; dataEntrantEmail?: string | null; entryDate?: string | null; }>;
  orderDetails: Array<{
    id: string;
    createdAt: string;
    dataEntrant?: string | null;
    dataEntrantName?: string | null;
    dataEntrantEmail?: string | null;
    entryDate?: string | null;
    deliveryName: string;
    deliveryPhone: string;
    deliveryEmail: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    transactionReference?: string | null;
    isWalkInCustomer?: boolean;
    discountAmount?: number;
    otherCharges?: number;
    totalAmount: number;
      items: Array<{
        id: string;
        productName: string;
        brand?: string | null;
        barcode?: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        totalSellingPrice?: number;
        sourcePrice?: number;
        sourceCost?: number;
        sourceName?: string | null;
        vatAmount?: number;
        grossProfit?: number;
        sourcedFrom?: string | null;
        sourcedBy?: string | null;
        sourceDate?: string | null;
        sourcePaymentStatus?: string;
        serialNumbers: string[];
      }>;
  }>;
}

const COLORS = ["#1d4ed8", "#059669", "#d97706", "#dc2626", "#0f766e", "#7c3aed"];

const timeRangeLabels: Record<Exclude<TimeRange, "custom">, string> = {
  "1": "Today",
  "7": "Last 7 days",
  "14": "Last 14 days",
  "30": "Last 30 days",
  "60": "Last 60 days",
  "90": "Last 90 days",
};

function badgeVariantForIssue(issue: PendingIssue): "destructive" | "secondary" | "outline" {
  if (issue.severity === "destructive") return "destructive";
  if (issue.severity === "warning") return "secondary";
  return "outline";
}

function calculateRevenueGrowth(timeline: TimelinePoint[]) {
  if (timeline.length < 2) return 0;
  const first = Number(timeline[0]?.revenue || 0);
  const last = Number(timeline[timeline.length - 1]?.revenue || 0);
  if (first <= 0) return 0;
  return Number((((last - first) / first) * 100).toFixed(1));
}

function sourcedProductUnits(product: { totalStockReceived?: number; stockQuantity?: number }) {
  return Math.max(1, Number(product.totalStockReceived ?? product.stockQuantity ?? 1));
}

function sourcedProductTotalCost(product: { sourcePrice?: number; totalStockReceived?: number; stockQuantity?: number }) {
  return Number(product.sourcePrice || 0) * sourcedProductUnits(product);
}

function personName(record: { dataEntrantName?: string | null; dataEntrant?: string | null; dataEntrantEmail?: string | null }) {
  const name = String(record.dataEntrantName || "").trim();
  if (name && name !== record.dataEntrantEmail) return name;
  return "";
}

const FinanceReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [report, setReport] = useState<FinanceReport | null>(null);

  const fetchReport = async () => {
    if (timeRange === "custom" && (!startDate || !endDate)) return;

    setLoading(true);
    try {
      const params =
        timeRange === "custom" && startDate && endDate
          ? {
              start: format(startDate, "yyyy-MM-dd"),
              end: format(endDate, "yyyy-MM-dd"),
            }
          : { days: Number(timeRange) || 30 };

      const data = await adminApi.getFinanceReport(params);
      setReport(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load finance report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeRange === "custom" && (!startDate || !endDate)) return;
    fetchReport();
  }, [timeRange, startDate, endDate]);

  const summary = report?.summary;
  const timeline = report?.timeline || [];
  const paymentBreakdown = report?.paymentBreakdown || [];
  const orderBreakdown = report?.orderBreakdown || [];
  const topProducts = report?.topProducts || [];
  const pendingIssues = report?.pendingIssues || [];
  const orderDetails = report?.orderDetails || [];
  const expenses = report?.expenses || [];
  const sourcedProducts = report?.sourcedProducts || [];
  const revenueGrowth = calculateRevenueGrowth(timeline);
  const paidShare = summary?.totalRevenue ? Number((((summary.paidRevenue || 0) / summary.totalRevenue) * 100).toFixed(1)) : 0;
  const paymentSuccessRate = summary?.activeOrders ? Number((((summary.paidOrders || 0) / summary.activeOrders) * 100).toFixed(1)) : 0;
  const totalIssueCount = pendingIssues.reduce((sum, issue) => sum + issue.count, 0);
  const totalIssueAmount = pendingIssues.reduce((sum, issue) => sum + issue.amount, 0);

  const getDateRangeLabel = () => {
    if (timeRange === "custom") {
      if (startDate && endDate) {
        return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`;
      }
      return "Select date range";
    }
    return timeRangeLabels[timeRange];
  };

  const getOrderDateParams = () => {
    const params: Record<string, string> = {};
    if (report?.period?.start) params.start = report.period.start.slice(0, 10);
    if (report?.period?.end) params.end = report.period.end.slice(0, 10);
    return params;
  };

  const buildOrdersLink = (filters: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries({ ...getOrderDateParams(), ...filters }).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  };

  const getIssueOrdersLink = (issueKey: string) => buildOrdersLink({ financeIssue: issueKey });
  const clickableCardClass = "block h-full rounded-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const clickableInnerCardClass = "h-full border-primary/10 transition-colors hover:border-primary/50 hover:bg-muted/30";

  const exportReport = () => {
    if (!report) return;

    const revenueRows = orderDetails.flatMap((order) =>
      (order.items || []).map((item) => {
        const sourcePrice = Number(item.sourcePrice ?? 0);
        const totalSourcePrice = Number(item.sourceCost ?? sourcePrice * Number(item.quantity || 0));
        const totalSellingPrice = Number(item.totalSellingPrice ?? item.totalPrice ?? 0);
        return {
          orderDate: order.createdAt,
          customerName: order.deliveryName,
          customerEmail: order.deliveryEmail,
          productName: item.productName,
          brand: item.brand,
          quantity: item.quantity,
          sourceName: item.sourcedFrom || item.sourceName || "",
          sourcePrice,
          sellingPrice: Number(item.unitPrice || 0),
          totalSourcePrice,
          totalSellingPrice,
          vatAmount: Number(item.vatAmount || 0),
          grossProfit: Number(item.grossProfit ?? totalSellingPrice - totalSourcePrice),
          customerPaymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          transactionReference: order.transactionReference || "",
          dataEntrantName: personName(order),
          dataEntrantEmail: order.dataEntrantEmail || "",
        };
      })
    );

    const supplierPayments = sourcedProducts.map((product) => ({
      sourceDate: product.sourceDate || product.entryDate || null,
      sourceName: product.sourcedFrom || "",
      productName: product.name,
      unitsReceived: sourcedProductUnits(product),
      unitSourcePrice: Number(product.sourcePrice || 0),
      totalAcquisitionCost: sourcedProductTotalCost(product),
      paymentStatus: product.paymentStatus || "pending",
      paidAt: product.paidAt || null,
      paidBy: product.paidBy || "",
      dataEntrantName: personName(product),
      dataEntrantEmail: product.dataEntrantEmail || "",
    }));

    downloadFinanceWorkbook({
      period: report.period,
      summary: {
        totalRevenue: summary?.totalRevenue || 0,
        paidRevenue: summary?.paidRevenue || 0,
        pendingRevenue: summary?.pendingRevenue || 0,
        totalExpenses: summary?.totalExpenses || 0,
        supplierPayments: summary?.paidSourcingCost || 0,
        vatAmount: orderDetails.reduce((sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + Number(item.vatAmount || 0), 0), 0),
        grossProfit: summary?.estimatedGrossProfit || 0,
      },
      revenue: revenueRows,
      expenses: expenses.map((expense) => ({
        expenseDate: expense.date || null,
        categoryName: expense.category || "",
        productName: (expense as any).productName || "",
        sourceName: (expense as any).sourceName || expense.orderCustomer || "",
        amount: expense.amount,
        paymentStatus: "paid",
        paymentMethod: "cash",
        reference: "",
        description: expense.details,
        orderCustomer: expense.orderCustomer || "",
        dataEntrantName: personName(expense),
        dataEntrantEmail: expense.dataEntrantEmail || "",
      })),
      supplierPayments,
    });

    toast.success("Finance report exported");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Finance Report Dashboard
          </h2>
          <p className="mt-1 text-muted-foreground">
            Real revenue, order health, and pending finance issues for {getDateRangeLabel().toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={(value) => {
              const nextRange = value as TimeRange;
              setTimeRange(nextRange);
              if (nextRange !== "custom") {
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
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
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

          <Button variant="outline" onClick={exportReport} disabled={!report || loading}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {timeRange === "custom" && (!startDate || !endDate) ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Select both a start date and an end date to load the custom finance report.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to={buildOrdersLink()} className={clickableCardClass} aria-label="Open finance orders for total revenue">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{formatPrice(summary?.totalRevenue || 0)}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>{revenueGrowth}% revenue movement across the period</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to={buildOrdersLink({ paymentStatus: "paid" })} className={clickableCardClass} aria-label="Open paid finance orders">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{formatPrice(summary?.paidRevenue || 0)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{paidShare}% of non-cancelled order value has been collected.</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to={buildOrdersLink({ paymentStatus: "pending" })} className={clickableCardClass} aria-label="Open pending-payment finance orders">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Revenue</CardTitle>
              <ArrowDownLeft className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{formatPrice(summary?.pendingRevenue || 0)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{summary?.pendingOrders || 0} orders still need payment attention.</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to={buildOrdersLink()} className={clickableCardClass} aria-label="Open active orders used for average order value">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{formatPrice(summary?.averageOrderValue || 0)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{summary?.activeOrders || 0} active orders in this report window.</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/expenses" className={clickableCardClass} aria-label="Open expenses">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle></CardHeader>
            <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <><p className="text-2xl font-display font-bold">{formatPrice(summary?.totalExpenses || 0)}</p><p className="mt-2 text-xs text-muted-foreground">{expenses.length} expense record(s) in this period.</p></>}</CardContent>
          </Card>
        </Link>
        <Link to="/admin/sourcing-payments?status=all" className={clickableCardClass} aria-label="Open sourced stock details">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sourced Stock Cost</CardTitle></CardHeader>
            <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <><p className="text-2xl font-display font-bold">{formatPrice(summary?.sourcingCost || 0)}</p><p className="mt-2 text-xs text-muted-foreground">Unit cost × received units for sourced products.</p></>}</CardContent>
          </Card>
        </Link>
        <Link to="/admin/sourcing-payments" className={clickableCardClass} aria-label="Open supplier/source details">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Supplier Balance</CardTitle></CardHeader>
            <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <><p className="text-2xl font-display font-bold">{formatPrice(summary?.unpaidSourcingCost || 0)}</p><p className="mt-2 text-xs text-muted-foreground">Pay-later sourced products only.</p></>}</CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle></CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <><p className="text-2xl font-display font-bold">{formatPrice(summary?.grossProfit ?? summary?.estimatedGrossProfit ?? 0)}</p><p className="mt-2 text-xs text-muted-foreground">Paid revenue minus sold-item COGS. Net after operating expenses: {formatPrice(summary?.netProfit ?? 0)}.</p></>}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Revenue Trend</CardTitle>
          <CardDescription>Daily order value and order volume for the selected report window.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-80 w-full" /> : timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => format(new Date(`${value}T00:00:00Z`), "MMM d")} />
                <YAxis yAxisId="value" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                <YAxis yAxisId="count" orientation="right" allowDecimals={false} />
                <Tooltip
                  labelFormatter={(value) => format(new Date(`${String(value)}T00:00:00Z`), "MMM dd, yyyy")}
                  formatter={(value, name) => {
                    if (name === "Orders") return [value, name];
                    return [formatPrice(Number(value || 0)), name];
                  }}
                />
                <Legend />
                <Line yAxisId="value" type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} name="Revenue" dot={false} />
                <Line yAxisId="count" type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} name="Orders" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              No finance data is available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Order Status Distribution</CardTitle>
            <CardDescription>How orders are currently split across fulfilment states.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-80 w-full" /> : orderBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={orderBreakdown.map((item) => ({ ...item, name: formatStatusLabel(item.status) }))}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {orderBreakdown.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, _name, item) => [value, item?.payload?.name || "Orders"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-80 items-center justify-center text-muted-foreground">
                No order status data is available.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Payment Status Breakdown</CardTitle>
            <CardDescription>Order value and count split by payment state.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-80 w-full" /> : paymentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={paymentBreakdown.map((item) => ({ ...item, label: formatStatusLabel(item.status) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="value" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                  <YAxis yAxisId="count" orientation="right" allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Order Value") return [formatPrice(Number(value || 0)), name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="value" dataKey="value" fill="#1d4ed8" name="Order Value" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="count" dataKey="count" fill="#059669" name="Order Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-80 items-center justify-center text-muted-foreground">
                No payment data is available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to={buildOrdersLink()} className={clickableCardClass} aria-label="Open all orders for order health">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Order Health</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{summary?.totalOrders || 0}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-green-700">Paid: {summary?.paidOrders || 0}</p>
                    <p className="text-amber-700">Backlog: {summary?.backlogOrders || 0}</p>
                    <p className="text-red-700">Cancelled: {summary?.cancelledOrders || 0}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to={buildOrdersLink({ paymentStatus: "paid" })} className={clickableCardClass} aria-label="Open paid orders from payment success rate">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payment Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{paymentSuccessRate}%</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {summary?.paidOrders || 0} of {summary?.activeOrders || 0} active orders are paid.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to={buildOrdersLink({ financeIssue: "open" })} className={clickableCardClass} aria-label="Open orders with finance issues">
          <Card className={clickableInnerCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Issue Exposure</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <p className="text-2xl font-display font-bold">{formatPrice(totalIssueAmount)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{totalIssueCount} flagged issue instances need review.</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="font-display">Pending Issues Analysis</CardTitle>
            <CardDescription>Actionable orders that need finance or fulfilment follow-up right now.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={buildOrdersLink({ financeIssue: "open" })}>Open Orders</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : pendingIssues.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pendingIssues.map((issue) => (
                  <Link key={issue.key} to={getIssueOrdersLink(issue.key)} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="h-full rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{issue.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                        <Badge variant={badgeVariantForIssue(issue)}>{issue.count}</Badge>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">{formatPrice(issue.amount)}</span>
                        <span className="text-muted-foreground">at risk / in review</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="space-y-4">
                {pendingIssues.map((issue) => (
                  <div key={issue.key} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{issue.title}</p>
                          <Badge variant={badgeVariantForIssue(issue)}>{issue.count} flagged</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                      </div>
                      <p className="font-display text-lg font-bold text-foreground">{formatPrice(issue.amount)}</p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {issue.orders.map((order) => (
                        <Link
                          key={`${issue.key}-${order.id}`}
                          to={`/admin/orders/${order.id}`}
                          className="block rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                {order.isWalkInCustomer ? <Badge variant="outline">Walk-in</Badge> : null}
                              </div>
                              <p className="text-sm text-muted-foreground">{order.deliveryName}</p>
                              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-sm sm:text-right">
                              <p className="font-semibold text-foreground">{formatPrice(order.totalAmount)}</p>
                              <p className="text-muted-foreground">
                                {formatStatusLabel(order.status)} / {formatStatusLabel(order.paymentStatus)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatStatusLabel(order.paymentMethod)}
                                {order.transactionReference ? ` ref ${order.transactionReference}` : ""}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No pending finance issues were found for this period. Payments, references, and fulfilment states are all clear.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display">Top Products by Revenue</CardTitle>
            <CardDescription>Best-performing products in the selected report window.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">View Products</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <Link key={product.id} to={`/admin/products/${product.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <div className="flex flex-1 items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantity} units across {product.orders} orders</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {formatPrice(product.revenue)}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No product revenue data is available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-display">Sourced Products</CardTitle>
              <CardDescription>Source cost, supplier, and payment status captured in this period.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/admin/sourcing-payments?status=all">Open details</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourcedProducts.length ? sourcedProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sourcedFrom || "No source"} • {product.sourcedBy || "No buyer"} • {product.sourceDate || "No date"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(sourcedProductTotalCost(product))}</p>
                  <p className="text-xs text-muted-foreground">{sourcedProductUnits(product)} × {formatPrice(product.sourcePrice || 0)}</p>
                  <Badge variant={product.paymentStatus === "paid" ? "default" : "secondary"}>{formatStatusLabel(product.paymentStatus)}</Badge>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No sourced products in this period.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-display">Expenses</CardTitle>
              <CardDescription>Expense records included in the exported finance report.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/admin/expenses">Open expenses</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.length ? expenses.slice(0, 8).map((expense) => (
              <div key={expense.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div>
                  <p className="font-medium">{expense.details}</p>
                  <p className="text-xs text-muted-foreground">{formatStatusLabel(expense.category)} • {expense.date || "No date"}{expense.orderId ? ` • Order #${String(expense.orderId).slice(0, 8).toUpperCase()}` : ""}</p>
                </div>
                <p className="font-semibold">{formatPrice(expense.amount || 0)}</p>
              </div>
            )) : <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No expenses in this period.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceReportDashboard;
