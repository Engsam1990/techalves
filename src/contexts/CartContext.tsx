import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import type { Product } from "@/data/products";
import { apiClient } from "@/api/client";
import { useCustomerAuth } from "./CustomerAuthContext";

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isSyncing: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  mergeGuestCartToServer: (tokenOverride?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "techalves_cart";

interface ServerCartResponse {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

function readGuestCart(): CartItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useCustomerAuth();
  const [items, setItems] = useState<CartItem[]>(() => readGuestCart());
  const [isSyncing, setIsSyncing] = useState(false);

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const applyServerCart = useCallback((cart: ServerCartResponse) => {
    setItems(cart.items || []);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setItems(readGuestCart());
      return;
    }

    setIsSyncing(true);
    try {
      const cart = await apiClient<ServerCartResponse>("/cart", { headers: authHeaders });
      applyServerCart(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyServerCart, authHeaders, token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const mergeGuestCartToServer = useCallback(async (tokenOverride?: string) => {
    const guestItems = readGuestCart();
    const activeToken = tokenOverride || token;

    if (!activeToken || guestItems.length === 0) {
      if (!activeToken) {
        setItems(guestItems);
      }
      return;
    }

    setIsSyncing(true);
    try {
      const cart = await apiClient<ServerCartResponse>("/cart/merge", {
        method: "POST",
        headers: { Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          items: guestItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      localStorage.removeItem(STORAGE_KEY);
      applyServerCart(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyServerCart, token]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    if (!token) {
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
              : item
          );
        }
        return [...prev, { productId: product.id, quantity, product }];
      });
      return;
    }

    setIsSyncing(true);
    try {
      const cart = await apiClient<ServerCartResponse>("/cart/items", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      applyServerCart(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyServerCart, authHeaders, token]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!token) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    setIsSyncing(true);
    try {
      const cart = await apiClient<ServerCartResponse>(`/cart/items/${productId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      applyServerCart(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyServerCart, authHeaders, token]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!token) {
      setItems((prev) => prev.map((item) => (
        item.productId === productId ? { ...item, quantity: Math.min(quantity, 10) } : item
      )));
      return;
    }

    setIsSyncing(true);
    try {
      const cart = await apiClient<ServerCartResponse>(`/cart/items/${productId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ quantity }),
      });
      applyServerCart(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyServerCart, authHeaders, removeFromCart, token]);

  const clearCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    setIsSyncing(true);
    try {
      const cart = await apiClient<ServerCartResponse>("/cart/clear", {
        method: "DELETE",
        headers: authHeaders,
      });
      applyServerCart(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyServerCart, authHeaders, token]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [items]);

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, isSyncing, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart, mergeGuestCartToServer }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
