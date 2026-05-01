type WorkbookInput = {
  period?: { start?: string; end?: string; days?: number; isCustom?: boolean };
  summary?: Record<string, any>;
  revenue?: Record<string, any>[];
  expenses?: Record<string, any>[];
  supplierPayments?: Record<string, any>[];
};

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function friendlyDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function entrantName(value: unknown, email: unknown) {
  const name = String(value ?? "").trim();
  const emailText = String(email ?? "").trim();
  if (!name || name.includes("@") || name === emailText) return "";
  return name;
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cell(value: unknown, type: "String" | "Number" = "String") {
  const normalized = value === null || value === undefined ? "" : value;
  const numeric = typeof normalized === "number" || (type === "Number" && normalized !== "" && Number.isFinite(Number(normalized)));
  return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${escapeXml(numeric ? Number(normalized) : normalized)}</Data></Cell>`;
}

function row(values: unknown[], numericColumns = new Set<number>()) {
  return `<Row>${values.map((value, index) => cell(value, numericColumns.has(index) ? "Number" : "String")).join("")}</Row>`;
}

function sheet(name: string, headers: string[], rows: unknown[][], numericColumns = new Set<number>()) {
  return `<Worksheet ss:Name="${escapeXml(name).slice(0, 31)}"><Table>${row(headers)}${rows.map((values) => row(values, numericColumns)).join("")}</Table></Worksheet>`;
}

function summaryRows(summary: Record<string, any>, period?: WorkbookInput["period"]) {
  const rows: unknown[][] = [];
  if (period) {
    rows.push(["Period Start", friendlyDate(period.start)]);
    rows.push(["Period End", friendlyDate(period.end)]);
    if (period.days) rows.push(["Days", period.days]);
  }
  Object.entries(summary || {}).forEach(([key, value]) => rows.push([humanizeKey(key), value]));
  return rows;
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadFinanceWorkbook(input: WorkbookInput) {
  const revenueHeaders = ["Order Date", "Customer Name", "Customer Email", "Product", "Brand", "Quantity", "Supplier / Source", "Source Price", "Selling Price", "Total Source Price", "Total Selling Price", "VAT", "Gross Profit", "Customer Payment Status", "Payment Method", "Reference", "Data Entrant", "Data Entrant Email"];
  const revenueRows = (input.revenue || []).map((item) => [
    friendlyDate(item.orderDate), item.customerName || "", item.customerEmail || "", item.productName, item.brand || "", item.quantity || 0, item.sourceName || "",
    item.sourcePrice || 0, item.sellingPrice || 0, item.totalSourcePrice || 0, item.totalSellingPrice || 0, item.vatAmount || 0,
    item.grossProfit || 0, item.customerPaymentStatus || "", item.paymentMethod || "", item.transactionReference || "", entrantName(item.dataEntrantName, item.dataEntrantEmail), item.dataEntrantEmail || "",
  ]);

  const expenseHeaders = ["Expense Date", "Category", "Product", "Supplier / Source", "Customer / Order", "Amount", "Payment Status", "Payment Method", "Reference", "Description", "Data Entrant", "Data Entrant Email"];
  const expenseRows = (input.expenses || []).map((item) => [
    friendlyDate(item.expenseDate), item.categoryName || "", item.productName || "", item.sourceName || "", item.orderCustomer || "", item.amount || 0,
    item.paymentStatus || "", item.paymentMethod || "", item.reference || "", item.description || "", entrantName(item.dataEntrantName, item.dataEntrantEmail), item.dataEntrantEmail || "",
  ]);

  const supplierHeaders = ["Source Date", "Supplier / Source", "Product", "Units Received", "Unit Source Price", "Total Acquisition Cost", "Payment Status", "Paid At", "Paid By", "Data Entrant", "Data Entrant Email"];
  const supplierRows = (input.supplierPayments || []).map((item) => {
    const unitsReceived = Math.max(1, Number(item.unitsReceived ?? item.quantity ?? item.totalStockReceived ?? item.stockQuantity ?? 1));
    const unitSourcePrice = Number(item.unitSourcePrice ?? item.sourcePrice ?? 0);
    const totalAcquisitionCost = Number(item.totalAcquisitionCost ?? item.amount ?? unitSourcePrice * unitsReceived);
    return [
      friendlyDate(item.sourceDate || item.expenseDate), item.sourceName || "", item.productName || "", unitsReceived, unitSourcePrice,
      totalAcquisitionCost, item.paymentStatus || "", friendlyDate(item.paidAt), item.paidBy || "", entrantName(item.dataEntrantName, item.dataEntrantEmail), item.dataEntrantEmail || "",
    ];
  });

  const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${sheet("Summary", ["Metric", "Value"], summaryRows(input.summary || {}, input.period), new Set([1]))}
${sheet("Revenue", revenueHeaders, revenueRows, new Set([5, 7, 8, 9, 10, 11, 12]))}
${sheet("Expenses", expenseHeaders, expenseRows, new Set([5]))}
${sheet("Supplier Payments", supplierHeaders, supplierRows, new Set([3, 4, 5]))}
</Workbook>`;

  const start = input.period?.start ? friendlyDate(input.period.start).replace(/\s+/g, "-").replace(/,/g, "") : "finance";
  const end = input.period?.end ? friendlyDate(input.period.end).replace(/\s+/g, "-").replace(/,/g, "") : "report";
  download(xml, `techalves-finance-report-${start}-to-${end}.xls`);
}
