/**
 * Utility functions for CSV export operations
 */

/**
 * Escape CSV values to handle special characters (quotes, commas, newlines)
 */
export function escapeCsvValue(value: string | number | null | undefined): string {
  const normalized = String(value ?? "");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const element = document.createElement("a");
  element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Builder class for constructing inventory CSV reports
 */
export class InventoryCsvBuilder {
  private csv: string[] = [];

  constructor(title: string = "Inventory Dashboard Report") {
    this.csv.push(title);
  }

  addGenerationInfo(): this {
    this.csv.push(`${escapeCsvValue("Generated")},${escapeCsvValue(new Date().toLocaleString())}`);
    return this;
  }

  addPeriod(start: string, end: string): this {
    this.csv.push(`${escapeCsvValue("Start")},${escapeCsvValue(start)}`);
    this.csv.push(`${escapeCsvValue("End")},${escapeCsvValue(end)}`);
    this.csv.push("");
    return this;
  }

  addSummary(items: Array<[label: string, value: string | number]>): this {
    this.csv.push("Summary,Value");
    items.forEach(([label, value]) => {
      this.csv.push(`${escapeCsvValue(label)},${escapeCsvValue(value)}`);
    });
    this.csv.push("");
    return this;
  }

  addCategoryBreakdown(categories: Array<{ categoryName: string; skuCount: number; units: number; value: number; lowStockCount: number; outOfStockCount: number }>): this {
    this.csv.push("Category,SKUs,Units,Value,Low Stock,Out Of Stock");
    categories.forEach((item) => {
      this.csv.push(
        [item.categoryName, item.skuCount, item.units, Number(item.value || 0).toFixed(2), item.lowStockCount, item.outOfStockCount]
          .map(escapeCsvValue)
          .join(",")
      );
    });
    this.csv.push("");
    return this;
  }

  addMovements(
    movements: Array<{
      productName: string;
      typeLabel: string;
      quantityChange: number;
      quantityBefore: number;
      quantityAfter: number;
      createdAt: string;
    }>
  ): this {
    this.csv.push("Recent Movements,Type,Change,Before,After,When");
    movements.forEach((item) => {
      this.csv.push(
        [item.productName, item.typeLabel, item.quantityChange, item.quantityBefore, item.quantityAfter, item.createdAt]
          .map(escapeCsvValue)
          .join(",")
      );
    });
    return this;
  }

  build(): string {
    return this.csv.join("\n");
  }
}
