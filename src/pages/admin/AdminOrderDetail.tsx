import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { hasAdminPermission } from "@/lib/adminPermissions";
import { AlertTriangle, ArrowLeft, RotateCcw, WalletCards } from "lucide-react";

const methodsRequiringTransactionReference = new Set(["mpesa", "card", "bank_transfer"]);
const paymentMethods = [
  { value: "cash_on_delivery", label: "Cash on delivery" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash / POS" },
  { value: "card", label: "Card / POS" },
  { value: "other", label: "Other" },
];

const defaultStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const walkInStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

function serialValue(serial: unknown) {
  if (serial && typeof serial === "object" && "serialNumber" in serial) {
    return String((serial as { serialNumber?: string }).serialNumber || "");
  }
  return String(serial || "");
}

function getOrderIssues(order: any) {
  return Array.isArray(order?.issues) ? order.issues.filter(Boolean) : [];
}

function dataEntrantDisplay(record: any) {
  const adminName = String(record?.dataEntrantName || record?.createdByName || "").trim();
  const adminEmail = String(record?.dataEntrantEmail || record?.createdByEmail || "").trim();
  const customerName = String(record?.customer?.fullName || record?.deliveryName || "").trim();
  const customerEmail = String(record?.customer?.email || record?.deliveryEmail || "").trim();
  const rawEntrant = String(record?.dataEntrant || "").trim();

  if (adminName || adminEmail) {
    return {
      primary: adminName || adminEmail,
      secondary: adminName && adminEmail && adminName !== adminEmail ? adminEmail : "",
      type: "admin",
    };
  }

  if (customerEmail || customerName) {
    return {
      primary: customerEmail || customerName,
      secondary: customerEmail && customerName && customerEmail !== customerName ? customerName : "Customer order",
      type: "customer",
    };
  }

  return { primary: rawEntrant || "Unknown entrant", secondary: "", type: "unknown" };
}

function formatStatusLabel(value: string) {
  return String(value || "").replace(/_/g, " ");
}

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdateOrderStatus = hasAdminPermission(user, "orders:update_status");
  const canRecordPayment = hasAdminPermission(user, "orders:record_payment");
  const canRefundOrder = hasAdminPermission(user, "orders:refund");
  const canReturnItems = hasAdminPermission(user, "orders:return_items");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [transactionReference, setTransactionReference] = useState("");
  const [itemSerialNumbers, setItemSerialNumbers] = useState<Record<string, string[]>>({});

  const [paymentForm, setPaymentForm] = useState({
    eventType: "payment",
    amount: "",
    paymentMethod: "mpesa",
    reference: "",
    note: "",
  });
  const [returnForm, setReturnForm] = useState({
    orderItemId: "",
    quantity: "1",
    serialNumbers: "",
    restoreStock: "yes",
    refundAmount: "",
    refundMethod: "mpesa",
    reference: "",
    reason: "",
  });

  useEffect(() => {
    if (!canRecordPayment && canRefundOrder && paymentForm.eventType !== "refund") {
      setPaymentForm((current) => ({ ...current, eventType: "refund" }));
    }
    if (canRecordPayment && !canRefundOrder && paymentForm.eventType === "refund") {
      setPaymentForm((current) => ({ ...current, eventType: "payment" }));
    }
  }, [canRecordPayment, canRefundOrder, paymentForm.eventType]);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminApi.getOrder(id);
      setOrder(res);
      setStatus(res.status);
      setPaymentStatus(res.paymentStatus);
      setTransactionReference(res.transactionReference || "");
      setItemSerialNumbers(
        Object.fromEntries((res.items || []).map((item: any) => [item.id, Array.isArray(item.serialNumbers) ? item.serialNumbers : []]))
      );
      const firstReturnable = (res.items || []).find((item: any) => Number(item.returnableQuantity ?? item.quantity ?? 0) > 0);
      setReturnForm((current) => ({ ...current, orderItemId: firstReturnable?.id || current.orderItemId || "" }));
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not load order", variant: "destructive" });
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusOptions = order?.isWalkInCustomer ? walkInStatusOptions : defaultStatusOptions;
  const orderIssues = getOrderIssues(order);
  const showTransactionReference = methodsRequiringTransactionReference.has(String(order?.paymentMethod || ""));
  const paymentSummary = order?.paymentSummary || {};
  const returnableItems = useMemo(
    () => (order?.items || []).filter((item: any) => Number(item.returnableQuantity ?? item.quantity ?? 0) > 0),
    [order]
  );

  const updateItemSerial = (itemId: string, index: number, serialNumber: string) => {
    setItemSerialNumbers((current) => {
      const next = [...(current[itemId] || [])];
      next[index] = serialNumber;
      return { ...current, [itemId]: next };
    });
  };

  const saveChanges = async () => {
    if (!id || !order) return;
    if (!canUpdateOrderStatus) return;
    if (order.status === "pending" && status === "confirmed") {
      const missingSerialItem = (order.items || []).find((item: any) => {
        const availableSerials = (item.product?.availableSerialNumbers || []).map(serialValue).filter(Boolean);
        if (!availableSerials.length) return false;
        const selected = (itemSerialNumbers[item.id] || []).map((value) => value.trim()).filter(Boolean);
        return selected.length !== item.quantity || new Set(selected.map((value) => value.toLowerCase())).size !== selected.length;
      });
      if (missingSerialItem) {
        toast({
          title: "Serial numbers required",
          description: `Select ${missingSerialItem.quantity} unique serial number(s) for ${missingSerialItem.product?.name || "this item"} before confirming.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await adminApi.updateOrder(id, {
        status,
        paymentStatus,
        transactionReference: transactionReference.trim() || null,
        itemSerialNumbers,
      });
      setOrder(updated);
      setStatus(updated.status);
      setPaymentStatus(updated.paymentStatus);
      setTransactionReference(updated.transactionReference || "");
      setItemSerialNumbers(
        Object.fromEntries((updated.items || []).map((item: any) => [item.id, Array.isArray(item.serialNumbers) ? item.serialNumbers : []]))
      );
      toast({ title: "Order updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not update order", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addPaymentEvent = async () => {
    if (!id) return;
    const isRefund = paymentForm.eventType === "refund";
    if ((isRefund && !canRefundOrder) || (!isRefund && !canRecordPayment)) return;
    const amount = Number(paymentForm.amount || 0);
    if (amount <= 0 && paymentForm.eventType !== "payment_status_change") {
      toast({ title: "Amount required", description: "Enter a payment or refund amount greater than zero.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const updated = await adminApi.addOrderPaymentEvent(id, {
        ...paymentForm,
        amount,
        reference: paymentForm.reference.trim() || null,
        note: paymentForm.note.trim() || null,
      });
      setOrder(updated);
      setPaymentStatus(updated.paymentStatus);
      setTransactionReference(updated.transactionReference || "");
      setPaymentForm((current) => ({ ...current, amount: "", reference: "", note: "" }));
      toast({ title: paymentForm.eventType === "refund" ? "Refund recorded" : "Payment recorded" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not record payment event", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const processReturn = async () => {
    if (!id) return;
    if (!canReturnItems) return;
    const quantity = Number(returnForm.quantity || 0);
    if (!returnForm.orderItemId || quantity <= 0) {
      toast({ title: "Return item required", description: "Select an item and quantity to return.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const serialNumbers = returnForm.serialNumbers
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const updated = await adminApi.processOrderReturn(id, {
        items: [{ orderItemId: returnForm.orderItemId, quantity, serialNumbers }],
        restoreStock: returnForm.restoreStock === "yes",
        refundAmount: Number(returnForm.refundAmount || 0),
        refundMethod: returnForm.refundMethod,
        reference: returnForm.reference.trim() || null,
        reason: returnForm.reason.trim() || null,
      });
      setOrder(updated);
      setPaymentStatus(updated.paymentStatus);
      const firstReturnable = (updated.items || []).find((item: any) => Number(item.returnableQuantity ?? item.quantity ?? 0) > 0);
      setReturnForm({
        orderItemId: firstReturnable?.id || "",
        quantity: "1",
        serialNumbers: "",
        restoreStock: "yes",
        refundAmount: "",
        refundMethod: "mpesa",
        reference: "",
        reason: "",
      });
      toast({ title: "Return processed", description: "Stock and refund history were updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not process return", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-[420px] w-full rounded-xl" />;
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to="/admin/orders">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
        </Link>
      </Button>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        {canUpdateOrderStatus ? <Button onClick={saveChanges} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button> : null}
      </div>

      {orderIssues.length ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-950 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-950">
              <AlertTriangle className="h-5 w-5" />
              Order issue warning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderIssues.map((issue: any) => (
              <div key={issue.key || issue.title} className="rounded-lg border border-amber-200 bg-white/70 p-3">
                <p className="text-sm font-semibold text-amber-950">{issue.title || "Order issue"}</p>
                <p className="mt-1 text-sm text-amber-900">{issue.message || "This order needs admin review before it is closed."}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl border p-3">
                  {item.product?.image ? <img src={item.product.image} alt="" className="h-14 w-14 rounded-lg border object-cover" /> : null}
                  <div className="flex-1">
                    <p className="font-medium">{item.productName || item.product?.name || "Product"}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity}
                      {item.returnedQuantity ? ` • Returned ${item.returnedQuantity}` : ""}
                      {item.productBrand || item.brand ? ` • ${item.productBrand || item.brand}` : ""}
                      {item.productBarcode || item.barcode ? ` • ${item.productBarcode || item.barcode}` : ""}
                    </p>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <p>Source: {item.sourceName || "—"}</p>
                      <p>Source payment: {item.sourcePaymentStatus || "—"}</p>
                      <p>Source price: {formatPrice(Number(item.unitSourcePrice || item.sourcePrice || 0))}</p>
                      <p>Selling price: {formatPrice(Number(item.unitSellingPrice || item.unitPrice || 0))}</p>
                      <p>Total source: {formatPrice(Number(item.totalSourcePrice || item.sourceCost || 0))}</p>
                      <p>Total selling: {formatPrice(Number(item.totalSellingPrice || item.totalPrice || 0))}</p>
                      <p>VAT: {formatPrice(Number(item.vatAmount || 0))}</p>
                      <p>Gross profit: {formatPrice(Number(item.grossProfit || 0))}</p>
                    </div>
                    {item.serialNumbers?.length ? (
                      <p className="mt-1 text-xs text-muted-foreground">Serials: {item.serialNumbers.join(", ")}</p>
                    ) : null}
                    {order.status === "pending" && status === "confirmed" && (item.product?.availableSerialNumbers || []).length ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {Array.from({ length: item.quantity }).map((_, index) => (
                          <Select
                            key={`${item.id}-serial-${index}`}
                            value={itemSerialNumbers[item.id]?.[index] || ""}
                            onValueChange={(value) => updateItemSerial(item.id, index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Serial ${index + 1}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {(item.product?.availableSerialNumbers || [])
                                .map(serialValue)
                                .filter(Boolean)
                                .filter((serial: string) => !(itemSerialNumbers[item.id] || []).includes(serial) || itemSerialNumbers[item.id]?.[index] === serial)
                                .map((serial: string) => (
                                  <SelectItem key={serial} value={serial}>{serial}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(Number(item.totalPrice || 0))}</p>
                    <p className="text-xs text-muted-foreground">Stock: {item.product?.stockQuantity ?? 0}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Delivery details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {order.deliveryName}</p>
              <p><span className="font-medium">Phone:</span> {order.deliveryPhone}</p>
              <p><span className="font-medium">Email:</span> {order.deliveryEmail}</p>
              <p><span className="font-medium">Address:</span> {order.deliveryAddress}</p>
              {order.notes ? <p><span className="font-medium">Notes:</span> {order.notes}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><WalletCards className="h-5 w-5" /> Payment history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-xl border bg-muted/40 p-3 text-sm sm:grid-cols-4">
                <p><span className="font-medium">Total:</span><br />{formatPrice(Number(paymentSummary.totalDue || order.totalAmount || 0))}</p>
                <p><span className="font-medium">Paid:</span><br />{formatPrice(Number(paymentSummary.paidAmount || 0))}</p>
                <p><span className="font-medium">Refunded:</span><br />{formatPrice(Number(paymentSummary.refundedAmount || 0))}</p>
                <p><span className="font-medium">Balance:</span><br />{formatPrice(Number(paymentSummary.balanceAmount || 0))}</p>
              </div>

              {canRecordPayment || canRefundOrder ? (
              <div className="grid gap-3 md:grid-cols-5">
                <Select value={paymentForm.eventType} onValueChange={(value) => setPaymentForm((current) => ({ ...current, eventType: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {canRecordPayment ? <SelectItem value="payment">Payment</SelectItem> : null}
                    {canRecordPayment ? <SelectItem value="partial_payment">Partial payment</SelectItem> : null}
                    {canRefundOrder ? <SelectItem value="refund">Refund</SelectItem> : null}
                    {canRecordPayment ? <SelectItem value="adjustment">Adjustment</SelectItem> : null}
                  </SelectContent>
                </Select>
                <Input type="number" min="0" value={paymentForm.amount} onChange={(e) => setPaymentForm((current) => ({ ...current, amount: e.target.value }))} placeholder="Amount" />
                <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm((current) => ({ ...current, paymentMethod: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={paymentForm.reference} onChange={(e) => setPaymentForm((current) => ({ ...current, reference: e.target.value }))} placeholder="Reference" />
                <Button onClick={addPaymentEvent} disabled={saving}>{saving ? "Saving..." : "Record"}</Button>
                <Input className="md:col-span-5" value={paymentForm.note} onChange={(e) => setPaymentForm((current) => ({ ...current, note: e.target.value }))} placeholder="Payment note" />
              </div>
              ) : null}

              <div className="space-y-2">
                {(order.paymentEvents || []).map((event: any) => {
                  const entrant = dataEntrantDisplay(event);
                  return (
                    <div key={event.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium capitalize">{formatStatusLabel(event.eventType)} • {formatPrice(Number(event.amount || 0))}</p>
                        <p className="text-xs text-muted-foreground">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}</p>
                      </div>
                      <p className="text-muted-foreground">
                        {event.paymentMethod ? formatStatusLabel(event.paymentMethod) : "—"}
                        {event.reference ? ` • Ref: ${event.reference}` : ""}
                        {event.note ? ` • ${event.note}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">By {entrant.primary}{entrant.secondary ? ` (${entrant.secondary})` : ""}</p>
                    </div>
                  );
                })}
                {(order.paymentEvents || []).length === 0 ? <p className="text-sm text-muted-foreground">No payment events recorded yet.</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><RotateCcw className="h-5 w-5" /> Returns and refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canReturnItems && returnableItems.length ? (
                <div className="grid gap-3 md:grid-cols-5">
                  <Select value={returnForm.orderItemId} onValueChange={(value) => setReturnForm((current) => ({ ...current, orderItemId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>
                      {returnableItems.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {(item.productName || item.product?.name || "Item").slice(0, 40)} ({item.returnableQuantity} left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min="1" value={returnForm.quantity} onChange={(e) => setReturnForm((current) => ({ ...current, quantity: e.target.value }))} placeholder="Qty" />
                  <Select value={returnForm.restoreStock} onValueChange={(value) => setReturnForm((current) => ({ ...current, restoreStock: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Restore stock</SelectItem>
                      <SelectItem value="no">Do not restore</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" min="0" value={returnForm.refundAmount} onChange={(e) => setReturnForm((current) => ({ ...current, refundAmount: e.target.value }))} placeholder="Refund amount" />
                  <Button onClick={processReturn} disabled={saving}>{saving ? "Saving..." : "Process return"}</Button>
                  <Input className="md:col-span-2" value={returnForm.serialNumbers} onChange={(e) => setReturnForm((current) => ({ ...current, serialNumbers: e.target.value }))} placeholder="Returned serials, comma separated" />
                  <Select value={returnForm.refundMethod} onValueChange={(value) => setReturnForm((current) => ({ ...current, refundMethod: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={returnForm.reference} onChange={(e) => setReturnForm((current) => ({ ...current, reference: e.target.value }))} placeholder="Refund reference" />
                  <Input className="md:col-span-5" value={returnForm.reason} onChange={(e) => setReturnForm((current) => ({ ...current, reason: e.target.value }))} placeholder="Return reason / note" />
                </div>
              ) : canReturnItems ? (
                <p className="text-sm text-muted-foreground">No returnable items for this order.</p>
              ) : null}

              <div className="space-y-2">
                {(order.returns || []).map((entry: any) => {
                  const entrant = dataEntrantDisplay(entry);
                  return (
                    <div key={entry.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium">{entry.items?.length || 0} item return record • Refund {formatPrice(Number(entry.refundAmount || 0))}</p>
                        <p className="text-xs text-muted-foreground">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}</p>
                      </div>
                      <p className="text-muted-foreground">
                        {entry.restoreStock ? "Stock restored" : "Stock not restored"}
                        {entry.reference ? ` • Ref: ${entry.reference}` : ""}
                        {entry.reason ? ` • ${entry.reason}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">By {entrant.primary}{entrant.secondary ? ` (${entrant.secondary})` : ""}</p>
                    </div>
                  );
                })}
                {(order.returns || []).length === 0 ? <p className="text-sm text-muted-foreground">No return records yet.</p> : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Order control</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Order status</p>
                <Select value={status} onValueChange={setStatus} disabled={!canUpdateOrderStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment status</p>
                <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={!canUpdateOrderStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showTransactionReference ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transaction reference</p>
                  <Input
                    value={transactionReference}
                    onChange={(event) => setTransactionReference(event.target.value)}
                    placeholder="Enter M-Pesa, card, or bank transfer reference"
                    disabled={!canUpdateOrderStatus}
                  />
                </div>
              ) : null}
              <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                Confirming an online order deducts inventory once. Cancelling a confirmed order restores stock. Returns can restore partial stock and record a refund history.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Customer:</span> {order.customer?.fullName || order.deliveryName}</p>
              <p><span className="font-medium">Customer email:</span> {order.customer?.email || order.deliveryEmail}</p>
              <p><span className="font-medium">Payment method:</span> {formatStatusLabel(order.paymentMethod)}</p>
              {order.transactionReference ? <p><span className="font-medium">Transaction reference:</span> {order.transactionReference}</p> : null}
              <p><span className="font-medium">Subtotal:</span> {formatPrice(Number(order.subtotalAmount || 0))}</p>
              <p><span className="font-medium">VAT ({Number(order.vatRate || 0)}%):</span> {formatPrice(Number(order.vatAmount || 0))}</p>
              <p><span className="font-medium">Total amount:</span> {formatPrice(order.totalAmount)}</p>
              <p><span className="font-medium">Total source price:</span> {formatPrice(Number(order.totalSourcePrice || 0))}</p>
              <p><span className="font-medium">Gross profit:</span> {formatPrice(Number(order.grossProfit || 0))}</p>
              {order.isPosSale ? <p><span className="font-medium">Sale channel:</span> POS / instant sale</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Data entry</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(() => {
                const entrant = dataEntrantDisplay(order);
                return (
                  <>
                    <p><span className="font-medium">Entered by:</span> {entrant.primary}</p>
                    {entrant.secondary ? <p><span className="font-medium">Entrant email:</span> {entrant.secondary}</p> : null}
                  </>
                );
              })()}
              <p><span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleString()}</p>
              <p><span className="font-medium">Last updated:</span> {new Date(order.updatedAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
