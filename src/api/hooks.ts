import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiPost } from "./client";
import type { BlogPost } from "@/data/blog";
import { formatPrice, type Category, type Product, type ProductFiltersMetadata, type ProductReview } from "@/data/products";

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface PaginatedProductsResponse extends PaginatedResponse<Product> {
  filters: ProductFiltersMetadata;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient<Category[]>("/categories"),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts(params?: {
  category?: string;
  q?: string;
  brand?: string;
  subcategory?: string;
  specs?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: "true" | "false";
  premium?: "true" | "false";
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => apiClient<PaginatedProductsResponse>("/products", { params: params as Record<string, string | number | undefined> }),
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => apiClient<Product[]>("/products/featured"),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePremiumProducts(limit = 5) {
  return useQuery({
    queryKey: ["products", "premium", limit],
    queryFn: () => apiClient<PaginatedProductsResponse>("/products", { params: { premium: "true", limit } }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiClient<Product>(`/products/${slug}`),
    enabled: !!slug,
    retry: 1,
  });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: ["product", slug, "related"],
    queryFn: () => apiClient<Product[]>(`/products/${slug}/related`),
    enabled: !!slug,
    retry: 1,
  });
}

export function useProductReviews(slug: string) {
  return useQuery({
    queryKey: ["productReviews", slug],
    queryFn: () => apiClient<ProductReview[]>(`/reviews/product/${slug}`),
    enabled: !!slug,
    retry: 1,
  });
}

export function useCreateProductReview(slug: string, token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      apiClient<{ message: string }>(`/reviews/product/${slug}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews", slug] });
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog"],
    queryFn: () => apiClient<BlogPost[]>("/blog"),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => apiClient<BlogPost>(`/blog/${slug}`),
    enabled: !!slug,
    retry: 1,
  });
}

export function useSearchProducts(params: {
  q: string;
  brand?: string;
  subcategory?: string;
  specs?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["products", "search", params],
    queryFn: () => apiClient<PaginatedProductsResponse>("/products", { params: params as Record<string, string | number | undefined> }),
    enabled: !!params.q,
    retry: 1,
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: { fullName: string; email: string; phone?: string; subject: string; message: string }) =>
      apiPost<{ message: string }>("/contact", data),
  });
}

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (data: { email: string; source?: string }) => apiPost<{ message: string }>("/newsletter/subscribe", data),
  });
}

export { formatPrice };
