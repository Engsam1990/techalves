/**
 * Utility functions for formatting values in admin dashboards
 */

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Format status strings for display (e.g., "out_of_stock" → "Out Of Stock")
 */
export function formatStatusLabel(value: string): string {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format numbers using compact notation (e.g., 1234 → "1.2K")
 */
export function formatCompactValue(value: number): string {
  return compactNumberFormatter.format(Number(value || 0));
}

/**
 * Format percentage values (removes trailing .0)
 */
export function formatPercent(value: number): string {
  return `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}%`;
}

/**
 * Format date for reports (e.g., "Mar 23, 2026" or "N/A")
 */
export function formatReportDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Map inventory status to badge variant for UI display
 */
export function statusBadgeVariant(status: string): BadgeVariant {
  if (status === "out_of_stock") return "destructive";
  if (status === "low_stock") return "secondary";
  if (status === "overstock") return "outline";
  return "default";
}
