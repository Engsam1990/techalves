import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { formatPrice } from "@/api/hooks";
import { Loader2 } from "lucide-react";
import Seo from "@/components/seo/Seo";
import CartFlowProgress from "@/components/cart/CartFlowProgress";

type CheckoutForm = {
  deliveryName: string;
  deliveryPhone: string;
  deliveryEmail: string;
  deliveryAddress: string;
  notes: string;
  paymentMethod: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

const CheckoutPage = () => {
  const { customer, token } = useCustomerAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [form, setForm] = useState<CheckoutForm>({
    deliveryName: customer?.fullName || "",
    deliveryPhone: customer?.phone || "",
    deliveryEmail: customer?.email || "",
    deliveryAddress: "",
    notes: "",
    paymentMethod: "cash_on_delivery",
  });

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  if (!customer) return <Navigate to="/auth?redirect=/checkout" replace />;
  if (items.length === 0) return <Navigate to="/cart" replace />;

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: CheckoutErrors = {};
    if (!form.deliveryName.trim()) nextErrors.deliveryName = "Full name is required.";
    if (!form.deliveryPhone.trim()) nextErrors.deliveryPhone = "Phone number is required.";
    if (!form.deliveryEmail.trim()) nextErrors.deliveryEmail = "Email is required.";
    if (!form.deliveryAddress.trim()) nextErrors.deliveryAddress = "Delivery address is required.";
    if (!form.paymentMethod.trim()) nextErrors.paymentMethod = "Please choose a payment method.";
    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await apiClient<{ message: string; order: { id: string } }>("/orders/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      await clearCart();
      toast.success(res.message || "Order placed successfully");
      navigate(`/account?order=${res.order.id}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Could not place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Seo title="Checkout" description="Secure checkout for your TECHALVES Solutions order." canonicalPath="/checkout" noIndex noFollow />
      <div className="container space-y-8 py-8 sm:py-10">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Checkout</p>
            <h1 className="text-3xl font-display font-bold">Complete your order</h1>
          </div>
          <CartFlowProgress current="checkout" />
        </div>

        <form className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-display">Delivery details</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-name">Full name</Label>
                    <Input
                      id="checkout-name"
                      value={form.deliveryName}
                      onChange={(e) => updateField("deliveryName", e.target.value)}
                      aria-invalid={Boolean(errors.deliveryName)}
                      className={errors.deliveryName ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.deliveryName ? <p className="text-sm text-destructive">{errors.deliveryName}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-phone">Phone</Label>
                    <Input
                      id="checkout-phone"
                      value={form.deliveryPhone}
                      onChange={(e) => updateField("deliveryPhone", e.target.value)}
                      aria-invalid={Boolean(errors.deliveryPhone)}
                      className={errors.deliveryPhone ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.deliveryPhone ? <p className="text-sm text-destructive">{errors.deliveryPhone}</p> : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    value={form.deliveryEmail}
                    onChange={(e) => updateField("deliveryEmail", e.target.value)}
                    aria-invalid={Boolean(errors.deliveryEmail)}
                    className={errors.deliveryEmail ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.deliveryEmail ? <p className="text-sm text-destructive">{errors.deliveryEmail}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-address">Delivery address</Label>
                  <Textarea
                    id="checkout-address"
                    value={form.deliveryAddress}
                    onChange={(e) => updateField("deliveryAddress", e.target.value)}
                    rows={4}
                    aria-invalid={Boolean(errors.deliveryAddress)}
                    className={errors.deliveryAddress ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.deliveryAddress ? <p className="text-sm text-destructive">{errors.deliveryAddress}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-notes">Order notes</Label>
                  <Textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                    placeholder="Optional notes for delivery or installation"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display">Payment method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={form.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value)} className="space-y-3">
                  {[
                    ["cash_on_delivery", "Cash on delivery", "Pay when your order reaches you."],
                    ["mpesa", "M-Pesa", "Place the order now and complete payment after confirmation."],
                    ["bank_transfer", "Bank transfer", "Use bank transfer for corporate and bulk orders."],
                  ].map(([value, title, text]) => (
                    <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:border-brand-yellow/60 hover:bg-brand-yellow/5">
                      <RadioGroupItem value={value} className="mt-1" />
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.paymentMethod ? <p className="text-sm text-destructive">{errors.paymentMethod}</p> : null}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit lg:sticky lg:top-28">
            <CardHeader><CardTitle className="font-display">Your items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-14 w-14 rounded-lg border object-cover" />
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="capitalize">{form.paymentMethod.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between text-lg font-display font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <Button type="submit" variant="highlight" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place order
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cart">Back to cart</Link>
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
