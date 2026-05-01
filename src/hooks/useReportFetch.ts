/**
 * Custom hook for managing report fetching with time range selection
 */

import { useEffect, useState } from "react";
import { format } from "date-fns";

export type TimeRange = "7" | "30" | "60" | "90" | "custom";

export const timeRangeLabels: Record<Exclude<TimeRange, "custom">, string> = {
  "7": "Last 7 days",
  "30": "Last 30 days",
  "60": "Last 60 days",
  "90": "Last 90 days",
};

/**
 * Get human-readable date range label
 */
export function getDateRangeLabel(timeRange: TimeRange, startDate?: Date, endDate?: Date): string {
  if (timeRange === "custom") {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`;
    }
    return "Select date range";
  }
  return timeRangeLabels[timeRange];
}

interface UseReportFetchOptions<T> {
  apiMethod: (params: { days?: number; start?: string; end?: string }) => Promise<T>;
  timeRange: TimeRange;
  startDate?: Date;
  endDate?: Date;
  onError?: (error: Error) => void;
}

interface UseReportFetchResult<T> {
  report: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching reports with time range and custom date support
 *
 * @example
 * const { report, loading, error } = useReportFetch({
 *   apiMethod: adminApi.getInventoryReport,
 *   timeRange,
 *   startDate,
 *   endDate,
 * });
 */
export function useReportFetch<T>({
  apiMethod,
  timeRange,
  startDate,
  endDate,
  onError,
}: UseReportFetchOptions<T>): UseReportFetchResult<T> {
  const [report, setReport] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = async () => {
    // Don't fetch if custom range is incomplete
    if (timeRange === "custom" && (!startDate || !endDate)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params =
        timeRange === "custom" && startDate && endDate
          ? {
              start: format(startDate, "yyyy-MM-dd"),
              end: format(endDate, "yyyy-MM-dd"),
            }
          : { days: Number(timeRange) || 30 };

      const response = await apiMethod(params);
      setReport(response);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || "Failed to fetch report");
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [timeRange, startDate, endDate]);

  return { report, loading, error, refetch: fetchReport };
}
