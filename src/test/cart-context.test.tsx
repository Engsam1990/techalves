import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";

vi.mock("@/contexts/CustomerAuthContext", () => ({
  useCustomerAuth: () => ({ token: null }),
}));

const sampleProduct: Product = {
  id: "lp-001",
  name: "HP EliteBook 840 G5",
  slug: "hp-elitebook-840-g5",
  category: "laptops",
  brand: "HP",
  price: 45000,
  condition: "refurbished",
  description: "Business laptop",
  specs: { RAM: "8GB" },
  images: ["/placeholder.png"],
  inStock: true,
  featured: false,
  rating: 4.5,
  reviewCount: 10,
  warranty: "6 months",
};

function CartHarness() {
  const { itemCount, subtotal, addToCart, updateQuantity, clearCart } = useCart();

  return (
    <div>
      <div data-testid="item-count">{itemCount}</div>
      <div data-testid="subtotal">{subtotal}</div>
      <button onClick={() => void addToCart(sampleProduct, 2)}>add</button>
      <button onClick={() => void updateQuantity(sampleProduct.id, 3)}>update</button>
      <button onClick={() => void clearCart()}>clear</button>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds items and calculates totals in guest mode", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await act(async () => {
      screen.getByRole("button", { name: "add" }).click();
    });

    expect(screen.getByTestId("item-count")).toHaveTextContent("2");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("90000");
  });

  it("updates quantity and clears cart", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await act(async () => {
      screen.getByRole("button", { name: "add" }).click();
    });

    await act(async () => {
      screen.getByRole("button", { name: "update" }).click();
    });

    expect(screen.getByTestId("item-count")).toHaveTextContent("3");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("135000");

    await act(async () => {
      screen.getByRole("button", { name: "clear" }).click();
    });

    expect(screen.getByTestId("item-count")).toHaveTextContent("0");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("0");
  });
});
