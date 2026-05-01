import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product } from "@/data/products";

const STORAGE_KEY = "techalves_compare_products";
const MAX_COMPARE = 3;

function parseStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function parseCompareIds(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE);
}

export function useCompareProducts(visibleProducts: Product[] = []) {
  const [searchParams, setSearchParams] = useSearchParams();
  const compareIdsFromUrl = useMemo(() => parseCompareIds(searchParams.get("compare")), [searchParams]);
  const [compareProducts, setCompareProducts] = useState<Product[]>(() => {
    const stored = parseStoredProducts();
    if (compareIdsFromUrl.length > 0) {
      return stored.filter((product) => compareIdsFromUrl.includes(product.id)).slice(0, MAX_COMPARE);
    }
    return stored.slice(0, MAX_COMPARE);
  });
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    if (compareIdsFromUrl.length === 0) return;

    setCompareProducts((previous) => {
      const next = previous.filter((product) => compareIdsFromUrl.includes(product.id));
      visibleProducts.forEach((product) => {
        if (compareIdsFromUrl.includes(product.id) && !next.some((existing) => existing.id === product.id)) {
          next.push(product);
        }
      });
      return next.slice(0, MAX_COMPARE);
    });
  }, [compareIdsFromUrl, visibleProducts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareProducts));

    const currentCompare = searchParams.get("compare") ?? "";
    const nextCompare = compareProducts.map((product) => product.id).join(",");
    if (currentCompare === nextCompare) return;

    const nextParams = new URLSearchParams(searchParams);
    if (nextCompare) nextParams.set("compare", nextCompare);
    else nextParams.delete("compare");
    setSearchParams(nextParams, { replace: true });
  }, [compareProducts, searchParams, setSearchParams]);

  const isComparing = (productId: string) => compareProducts.some((product) => product.id === productId);

  const toggleCompare = (product: Product) => {
    let added = false;
    setCompareProducts((previous) => {
      if (previous.some((item) => item.id === product.id)) {
        return previous.filter((item) => item.id !== product.id);
      }
      if (previous.length >= MAX_COMPARE) {
        return previous;
      }
      added = true;
      return [...previous, product];
    });
    return added;
  };

  const removeCompare = (productId: string) => {
    setCompareProducts((previous) => previous.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareProducts([]);
    setCompareOpen(false);
  };

  return {
    compareProducts,
    compareOpen,
    setCompareOpen,
    isComparing,
    toggleCompare,
    removeCompare,
    clearCompare,
  };
}
