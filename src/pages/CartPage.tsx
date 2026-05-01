import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/api/hooks";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Seo from "@/components/seo/Seo";
import CartFlowProgress from "@/components/cart/CartFlowProgress";

const CartPage = () => {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Layout>
        <Seo title="Shopping Cart" description="Review items in your TECHALVES Solutions cart before checkout." canonicalPath="/cart" noIndex noFollow />
        <div className="container py-20 text-center">
          <ShoppingBag className="mx-auto h-14 w-14 text-muted-foreground" />
          <h1 className="mt-4 text-3xl font-display font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add products to your cart to continue to checkout.</p>
          <Button variant="highlight" className="mt-6" asChild>
            <Link to="/">Continue shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title="Shopping Cart" description="Review items in your TECHALVES Solutions cart before checkout." canonicalPath="/cart" noIndex noFollow />
      <div className="container space-y-8 py-8 sm:py-10">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Cart</p>
            <h1 className="text-3xl font-display font-bold">Review your order</h1>
          </div>
          <CartFlowProgress current="cart" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-24 rounded-lg border object-cover" />
                  <div className="flex-1">
                    <Link to={`/product/${item.product.slug}`} className="font-semibold hover:text-primary">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                    <p className="mt-2 font-display font-bold text-primary">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="icon" className="hover:border-brand-yellow/60 hover:bg-brand-yellow/10" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value || 1))}
                      className="w-16 text-center"
                    />
                    <Button variant="outline" size="icon" className="hover:border-brand-yellow/60 hover:bg-brand-yellow/10" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.productId)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit lg:sticky lg:top-28">
            <CardHeader>
              <CardTitle className="font-display">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between text-lg font-display font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
              <Button
                variant="highlight"
                className="w-full"
                onClick={() => {
                  if (!customer) {
                    navigate("/auth?redirect=/checkout");
                    return;
                  }
                  navigate("/checkout");
                }}
              >
                {customer ? "Proceed to checkout" : "Login to checkout"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Keep shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
