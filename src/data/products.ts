export type ProductCondition = "new" | "refurbished" | "ex-uk";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  condition: ProductCondition;
  description: string;
  specs: Record<string, string>;
  images: string[];
  inStock: boolean;
  featured: boolean;
  premium?: boolean;
  rating: number;
  reviewCount: number;
  warranty: string;
  stock?: number;
  reorderLevel?: number;
  serialNumbers?: string[];
  sourcedFrom?: string | null;
  sourcedBy?: string | null;
  sourceDate?: string | null;
  sourcePrice?: number | null;
  sourcingPaymentStatus?: "paid" | "pay_later";
  sourcingPaidAt?: string | null;
  sourcingPaidBy?: string | null;
  dataEntrant?: string | null;
  entryDate?: string | null;
}


export interface ProductFilterGroup {
  name: string;
  values: string[];
}

export interface ProductFiltersMetadata {
  brands: string[];
  subcategories: string[];
  specs: ProductFilterGroup[];
}

export interface ProductReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  productCount: number;
}

export const formatPrice = (price: number) => {
  return `KSh ${price.toLocaleString()}`;
};
