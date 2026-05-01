import { useRef } from "react";
import { formatPrice } from "@/data/products";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PosLineItem {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
  };
  quantity: number;
  serialNumbers?: string[];
}

interface PosOrderSummary {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionReference?: string | null;
  discountAmount: number;
  otherCharges: number;
  vatAmount?: number;
  totalAmount: number;
}

interface PosReceiptPrinterProps {
  items: PosLineItem[];
  orderSummary: PosOrderSummary | null;
  saleForm: {
    paymentStatus: string;
    paymentMethod: string;
    transactionReference: string;
    customerName: string;
    customerPhone: string;
    note: string;
    discountAmount?: number;
    otherCharges?: number;
    vatEnabled?: boolean;
    vatRate?: number;
  };
  totalAmount: number;
  onClose: () => void;
}

export const PosReceiptPrinter = ({
  items,
  orderSummary,
  saleForm,
  totalAmount,
  onClose,
}: PosReceiptPrinterProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const subtotal = totalAmount;
  const discountAmount = Math.max(0, Number(orderSummary?.discountAmount ?? saleForm.discountAmount ?? 0));
  const otherCharges = Math.max(0, Number(orderSummary?.otherCharges ?? saleForm.otherCharges ?? 0));
  const taxableSubtotal = Math.max(0, subtotal - discountAmount + otherCharges);
  const vatAmount = Math.max(0, Number(orderSummary?.vatAmount ?? (saleForm.vatEnabled ? Math.round(taxableSubtotal * (Number(saleForm.vatRate || 16) / 100)) : 0)));
  const finalTotal = taxableSubtotal + vatAmount;
  const hasDiscount = discountAmount > 0;
  const hasOtherCharges = otherCharges > 0;
  const hasVat = vatAmount > 0;
  const discountLabel = hasDiscount ? `-${formatPrice(discountAmount)}` : "0";
  const otherChargesLabel = hasOtherCharges ? `+${formatPrice(otherCharges)}` : "0";
  const vatLabel = hasVat ? formatPrice(vatAmount) : "0";

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        printWindow.document.write(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>POS Receipt</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #fff;
                }
                .receipt {
                  max-width: 400px;
                  margin: 0 auto;
                  border: 1px solid #ddd;
                  padding: 20px;
                  background-color: #fff;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 18px;
                  font-weight: bold;
                }
                .header p {
                  margin: 5px 0;
                  font-size: 12px;
                  color: #666;
                }
                .order-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .order-info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .items-section {
                  margin-bottom: 15px;
                }
                .items-header {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  font-weight: bold;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
                  margin-bottom: 10px;
                }
                .item {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-bottom: 8px;
                }
                .item-left {
                  flex: 1;
                }
                .item-right {
                  text-align: right;
                  margin-left: 10px;
                }
                .item-name {
                  font-weight: 500;
                }
                .item-details {
                  font-size: 11px;
                  color: #666;
                }
                .totals {
                  margin: 15px 0;
                  padding: 10px 0;
                  border-top: 1px solid #ddd;
                  border-bottom: 2px solid #000;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin: 5px 0;
                }
                .total-row.grand-total {
                  font-size: 14px;
                  font-weight: bold;
                  margin-top: 10px;
                }
                .payment-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .payment-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .customer-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px dashed #ddd;
                }
                .customer-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .footer {
                  text-align: center;
                  font-size: 11px;
                  color: #666;
                  margin-top: 15px;
                }
                .divider {
                  border-bottom: 1px dashed #ddd;
                  margin: 10px 0;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .receipt {
                    border: none;
                    max-width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>${siteConfig.businessName}</h1>
                  <p>${siteConfig.location}</p>
                  <p>${siteConfig.businessHours}</p>
                  <p>${siteConfig.supportPhoneDisplay}</p>
                </div>

                <div class="order-info">
                  <div class="order-info-row">
                    <span>Receipt ID:</span>
                    <span>#${String(orderSummary?.id || "").slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div class="order-info-row">
                    <span>Date:</span>
                    <span>${new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div class="items-section">
                  <div class="items-header">
                    <span style="flex: 1">Item</span>
                    <span style="width: 40px">Qty</span>
                    <span style="width: 60px; text-align: right">Total</span>
                  </div>
                  ${items
                    .map(
                      (item) => `
                    <div class="item">
                      <div class="item-left">
                        <div class="item-name">${item.product.name}</div>
                        <div class="item-details">
                          ${item.product.brand}${item.product.brand ? " • " : ""}
                          ${formatPrice(item.product.price)} each
                        </div>
                        
                      </div>
                      <div class="item-right">
                        <div style="width: 40px; text-align: center">${item.quantity}</div>
                        <div style="width: 60px; text-align: right">${formatPrice(item.product.price * item.quantity)}</div>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>

                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${formatPrice(subtotal)}</span>
                  </div>
                  <div class="total-row">
                    <span>Discount:</span>
                    <span>${discountLabel}</span>
                  </div>
                  <div class="total-row" style="font-size: 11px;">
                    <span>Other charges:</span>
                    <span>${otherChargesLabel}</span>
                  </div>
                  <div class="total-row" style="font-size: 11px;">
                    <span>VAT:</span>
                    <span>${vatLabel}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>TOTAL:</span>
                    <span>${formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div class="payment-info">
                  <div class="payment-row">
                    <span>Method:</span>
                    <span>${String(saleForm.paymentMethod).replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                  <div class="payment-row">
                    <span>Status:</span>
                    <span>${String(saleForm.paymentStatus).toUpperCase()}</span>
                  </div>
                  ${
                    saleForm.transactionReference
                      ? `
                    <div class="payment-row">
                      <span>Reference:</span>
                      <span>${saleForm.transactionReference}</span>
                    </div>
                  `
                      : ""
                  }
                </div>

                ${
                  saleForm.customerName || saleForm.customerPhone
                    ? `
                  <div class="customer-info">
                    ${saleForm.customerName ? `<div class="customer-row"><span>Customer:</span><span>${saleForm.customerName}</span></div>` : ""}
                    ${saleForm.customerPhone ? `<div class="customer-row"><span>Phone:</span><span>${saleForm.customerPhone}</span></div>` : ""}
                  </div>
                `
                    : ""
                }

                <div class="footer">
                  <p>Thank you for your purchase!</p>
                  <p>${siteConfig.businessName}</p>
                </div>
              </div>
            </body>
          </html>
        `
        );
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">POS Receipt</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={receiptRef}
          className="max-h-[60vh] overflow-y-auto bg-white p-6 text-xs"
          style={{ fontFamily: "monospace" }}
        >
          <div className="space-y-2 text-center">
            <h3 className="text-sm font-bold">{siteConfig.businessName}</h3>
            <p className="text-xs text-muted-foreground">{siteConfig.location}</p>
            <p className="text-xs text-muted-foreground">
              {siteConfig.businessHours}
            </p>
            <p className="text-xs text-muted-foreground">
              {siteConfig.supportPhoneDisplay}
            </p>
          </div>

          <div className="my-2 border-t border-b py-2 text-xs">
            <div className="flex justify-between">
              <span>Receipt ID:</span>
              <span className="font-semibold">
                #{String(orderSummary?.id || "").slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="my-3 space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1 text-xs font-semibold">
              <span style={{ flex: 1 }}>Item</span>
              <span style={{ width: "40px" }}>Qty</span>
              <span style={{ width: "60px", textAlign: "right" }}>Total</span>
            </div>
            {items.map((item) => (
              <div key={item.product.id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">{item.product.name}</span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.product.brand} • {formatPrice(item.product.price)} x{" "}
                  {item.quantity}
                </div>
                
              </div>
            ))}
          </div>

          <div className="my-3 border-t border-b py-2 text-xs font-semibold">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>{discountLabel}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span>Other charges:</span>
              <span>{otherChargesLabel}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span>VAT:</span>
              <span>{vatLabel}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span>TOTAL:</span>
              <span className="text-base text-primary">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          <div className="my-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-medium">
                {String(saleForm.paymentMethod).replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">
                {String(saleForm.paymentStatus).toUpperCase()}
              </span>
            </div>
            {saleForm.transactionReference && (
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-medium">{saleForm.transactionReference}</span>
              </div>
            )}
          </div>

          {(saleForm.customerName || saleForm.customerPhone) && (
            <div className="my-2 border-t border-b py-2 text-xs">
              {saleForm.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{saleForm.customerName}</span>
                </div>
              )}
              {saleForm.customerPhone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{saleForm.customerPhone}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Thank you for your purchase!</p>
            <p className="mt-1">{siteConfig.businessName}</p>
          </div>
        </div>

        <div className="flex gap-2 border-t p-4">
          <Button
            onClick={handlePrint}
            className="flex-1"
            variant="highlight"
          >
            Print Receipt
          </Button>
          <Button onClick={onClose} className="flex-1" variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
