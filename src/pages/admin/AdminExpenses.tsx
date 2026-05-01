import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/products";

const defaultForm = {
  categoryId: "",
  productId: "",
  sourceId: "",
  orderId: "",
  orderItemId: "",
  amount: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  reference: "",
  description: "",
};

function asArray(value: any) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function sourceCost(product: any) {
  const unitCost = Number(product?.sourcePrice || 0);
  const units = Number(product?.totalStockReceived || product?.stockQuantity || 1);
  return unitCost * Math.max(1, units);
}

function dataEntrantDisplay(record: any) {
  const name = record?.dataEntrantName || record?.createdByName || "";
  const email = record?.dataEntrantEmail || record?.createdByEmail || "";
  const primary = name || email || "Unknown admin";
  const secondary = name && email && name !== email ? email : "";
  return { primary, secondary };
}

function orderLabel(order: any) {
  const id = String(order?.id || "").slice(0, 8).toUpperCase();
  const customer = order?.deliveryName || order?.customerName || order?.customer?.fullName || "Customer";
  return `#${id} — ${customer} — ${formatPrice(Number(order?.totalAmount || 0))}`;
}

function orderItemLabel(item: any) {
  const name = item?.productName || item?.product?.name || "Product/accessory";
  const quantity = Number(item?.quantity || 0);
  const total = Number(item?.totalPrice ?? item?.totalSellingPrice ?? item?.unitPrice ?? 0);
  const serials = Array.isArray(item?.serialNumbers) && item.serialNumbers.length ? ` — SN: ${item.serialNumbers.join(", ")}` : "";
  return `${name}${quantity ? ` × ${quantity}` : ""}${total ? ` — ${formatPrice(total)}` : ""}${serials}`;
}

export default function AdminExpenses() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [form, setForm] = useState(defaultForm);

  const selectedCategory = categories.find((item) => item.id === form.categoryId);
  const categorySlug = String(selectedCategory?.slug || "").toLowerCase();
  const isSupplier = categorySlug === "supplier";
  const isSale = categorySlug === "sale";
  const selectedOrder = useMemo(() => orders.find((item) => String(item.id) === String(form.orderId)), [orders, form.orderId]);
  const saleOrderItems = useMemo(() => Array.isArray(selectedOrder?.items) ? selectedOrder.items : [], [selectedOrder]);

  const supplierExpenseProductIds = useMemo(() => {
    return new Set(
      expenses
        .filter((expense) => String(expense.categorySlug || expense.category || "").toLowerCase() === "supplier" || expense.categoryId === "expense-cat-supplier")
        .map((expense) => String(expense.productId || ""))
        .filter(Boolean)
    );
  }, [expenses]);

  const sourcedProducts = useMemo(() => {
    return products.filter((item) => item.sourceId && Number(item.sourcePrice || 0) > 0 && !supplierExpenseProductIds.has(String(item.id)));
  }, [products, supplierExpenseProductIds]);

  const selectedProduct = products.find((item) => String(item.id) === String(form.productId));
  const selectedSupplierSource = sources.find((item) => item.id === selectedProduct?.sourceId);

  const load = async () => {
    const [categoryData, productData, sourceData, expenseData, orderData] = await Promise.all([
      adminApi.getExpenseCategories(),
      adminApi.getProducts({ includePosOnly: 1 }),
      adminApi.getSources(),
      adminApi.getExpenses(),
      adminApi.getOrders({ limit: 100 }),
    ]);

    const visibleCategories = (categoryData || []).filter((category: any) => !["order", "supplier"].includes(String(category.slug || category.name || "").toLowerCase()));
    setCategories(visibleCategories);
    setProducts(productData || []);
    setSources(sourceData || []);
    setExpenses(expenseData || []);
    setOrders(asArray(orderData));
    setForm((current) => ({ ...current, categoryId: current.categoryId || visibleCategories?.[0]?.id || "" }));
  };

  useEffect(() => {
    load().catch((err) => toast({ title: "Error", description: err.message || "Could not load expenses", variant: "destructive" }));
  }, []);

  const selectProduct = (productId: string) => {
    const product = products.find((item) => String(item.id) === String(productId));
    setForm((current) => ({
      ...current,
      productId,
      orderItemId: isSale ? current.orderItemId : "",
      sourceId: product?.sourceId || "",
      amount: isSupplier && product ? sourceCost(product) : current.amount,
      description: isSupplier && product && !current.description
        ? `Supplier/product acquisition cost for ${product.name}`
        : current.description,
    }));
  };

  const selectSaleOrder = (orderId: string) => {
    setForm((current) => ({
      ...current,
      orderId,
      orderItemId: "",
      productId: "",
      sourceId: "",
    }));
  };

  const selectSaleOrderItem = (orderItemId: string) => {
    const item = saleOrderItems.find((entry) => String(entry.id) === String(orderItemId));
    setForm((current) => ({
      ...current,
      orderItemId,
      productId: item?.productId || "",
      sourceId: item?.sourceId || item?.product?.sourceId || "",
      amount: current.amount,
      description: item && !current.description
        ? `Sale/order expense for ${item.productName || item.product?.name || "selected item"} on ${selectedOrder ? orderLabel(selectedOrder) : "selected order"}`
        : current.description,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.description.trim()) {
      toast({ title: "Description required", description: "Enter what this expense paid for.", variant: "destructive" });
      return;
    }

    if (isSupplier && !form.productId) {
      toast({ title: "Supplier expense needs product", description: "Select an acquired product that already has a supplier/source assigned.", variant: "destructive" });
      return;
    }

    if (isSupplier && !selectedSupplierSource) {
      toast({ title: "Product has no supplier/source", description: "Choose a product with a saved supplier/source.", variant: "destructive" });
      return;
    }

    if (isSale && !form.orderId) {
      toast({ title: "Sale expense needs order", description: "Select the customer order/sale this non-profit cost belongs to.", variant: "destructive" });
      return;
    }

    if (isSale && (!form.orderItemId || !form.productId)) {
      toast({ title: "Sale expense needs product", description: "Select a product/accessory from the selected sale/order.", variant: "destructive" });
      return;
    }

    try {
      await adminApi.createExpense({
        ...form,
        productId: form.productId || null,
        sourceId: isSupplier ? selectedProduct?.sourceId || null : form.sourceId || null,
        orderId: isSale ? form.orderId || null : null,
        orderItemId: isSale ? form.orderItemId || null : null,
        paymentStatus: "paid",
      });
      toast({ title: "Expense recorded" });
      setForm((f) => ({ ...defaultForm, categoryId: f.categoryId, expenseDate: new Date().toISOString().slice(0, 10) }));
      await load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not create expense", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Expenses</h2>
        <p className="text-muted-foreground">
          Record sale and operating expenses only. Product acquisition cost is handled from Products, POS instant sale, and Source Payments.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add expense</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Category *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={(event) => setForm((f) => ({ ...f, categoryId: event.target.value, productId: "", sourceId: "", orderId: "", orderItemId: "", amount: 0, description: "" }))}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>

            {isSale ? (
              <div className="space-y-2">
                <Label>Order / sale *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.orderId}
                  onChange={(event) => selectSaleOrder(event.target.value)}
                  required
                >
                  <option value="">Select order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>{orderLabel(order)}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {isSupplier || isSale ? (
              <div className="space-y-2">
                <Label>{isSupplier ? "Acquired product *" : "Product/accessory *"}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={isSale ? form.orderItemId : form.productId}
                  onChange={(event) => isSale ? selectSaleOrderItem(event.target.value) : selectProduct(event.target.value)}
                  required={isSupplier || isSale}
                  disabled={isSale && !form.orderId}
                >
                  <option value="">{isSale && !form.orderId ? "Select order first" : "Select product"}</option>
                  {isSupplier ? (
                    sourcedProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                        {product.salesChannel === "pos_only" ? " (instant sale)" : ""}
                        {product.sourceName ? ` — ${product.sourceName}` : ""}
                      </option>
                    ))
                  ) : (
                    saleOrderItems.map((item) => (
                      <option key={item.id || item.productId} value={item.id}>
                        {orderItemLabel(item)}
                      </option>
                    ))
                  )}
                </select>
                {isSupplier && !sourcedProducts.length ? (
                  <p className="text-xs text-muted-foreground">No unpaid sourced products available. Products already recorded as supplier expenses are hidden.</p>
                ) : null}
                {isSale && form.orderId && !saleOrderItems.length ? (
                  <p className="text-xs text-muted-foreground">This order has no saved product/accessory items.</p>
                ) : null}
              </div>
            ) : null}

            {isSupplier ? (
              <div className="space-y-2">
                <Label>Supplier/source</Label>
                <Input value={selectedSupplierSource?.name || "Select an acquired product first"} readOnly className="bg-muted" />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" min={1} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} required />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.expenseDate} onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Payment method</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.paymentMethod}
                onChange={(event) => setForm((f) => ({ ...f, paymentMethod: event.target.value }))}
              >
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>

            <Button className="md:col-span-2 lg:col-span-3">Record paid expense</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Expense records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Product / supplier</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Data entrant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.expenseDate || expense.date}</TableCell>
                  <TableCell>{expense.categoryName || expense.category}</TableCell>
                  <TableCell>{expense.productName || "—"}{expense.sourceName ? ` / ${expense.sourceName}` : ""}</TableCell>
                  <TableCell>Paid {expense.paymentMethod ? `(${expense.paymentMethod})` : ""}</TableCell>
                  <TableCell>
                    {(() => {
                      const entrant = dataEntrantDisplay(expense);
                      return (
                        <div>
                          <p>{entrant.primary}</p>
                          {entrant.secondary ? <p className="text-xs text-muted-foreground">{entrant.secondary}</p> : null}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(Number(expense.amount || 0))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
