import { useMemo, useState } from "react";
import { apiPost } from "@/api/client";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { type ProductCondition, type ProductFiltersMetadata } from "@/data/products";
import { useSearchProducts } from "@/api/hooks";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import CompareDrawer from "@/components/CompareDrawer";
import QueryErrorState from "@/components/QueryErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCompareProducts } from "@/hooks/useCompareProducts";
import Seo from "@/components/seo/Seo";
import {
  countSelectedSpecValues,
  parseMultiSelectParam,
  parseSpecFiltersParam,
  serializeMultiSelectParam,
  serializeSpecFiltersParam,
  toggleListValue,
  toggleSpecFilterValue,
} from "@/lib/productFilters";

const PAGE_SIZE = 12;
type SortOption = "price-asc" | "price-desc" | "newest" | "rating";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get("q") || "";
  const selectedConditions = parseMultiSelectParam(searchParams.get("condition")) as ProductCondition[];
  const selectedBrands = parseMultiSelectParam(searchParams.get("brand"));
  const selectedSubcategories = parseMultiSelectParam(searchParams.get("subcategory"));
  const selectedSpecs = parseSpecFiltersParam(searchParams.get("specs"));
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sortBy = (searchParams.get("sort") as SortOption) || "newest";
  const page = Number(searchParams.get("page") || 1);

  const requestParams = useMemo(
    () => ({
      q: query,
      condition: serializeMultiSelectParam(selectedConditions),
      brand: serializeMultiSelectParam(selectedBrands),
      subcategory: serializeMultiSelectParam(selectedSubcategories),
      specs: serializeSpecFiltersParam(selectedSpecs),
      minPrice,
      maxPrice,
      sort: sortBy,
      page,
      limit: PAGE_SIZE,
    }),
    [query, selectedConditions, selectedBrands, selectedSubcategories, selectedSpecs, minPrice, maxPrice, sortBy, page],
  );

  const { data, isLoading, isError, refetch } = useSearchProducts(requestParams);
  const results = data?.data ?? [];
  const pagination = data?.pagination;
  const filters: ProductFiltersMetadata = data?.filters ?? { brands: [], subcategories: [], specs: [] };
  const { compareProducts, compareOpen, setCompareOpen, toggleCompare, removeCompare, clearCompare, isComparing } = useCompareProducts(results);

  const updateParams = (updates: Record<string, string | undefined>, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    if (resetPage) nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const toggleCondition = (condition: ProductCondition) => {
    updateParams({ condition: serializeMultiSelectParam(toggleListValue(selectedConditions, condition)) });
  };

  const toggleBrand = (brand: string) => {
    updateParams({ brand: serializeMultiSelectParam(toggleListValue(selectedBrands, brand)) });
  };

  const toggleSubcategory = (subcategory: string) => {
    updateParams({ subcategory: serializeMultiSelectParam(toggleListValue(selectedSubcategories, subcategory)) });
  };

  const toggleSpec = (specName: string, value: string) => {
    updateParams({ specs: serializeSpecFiltersParam(toggleSpecFilterValue(selectedSpecs, specName, value)) });
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    ["condition", "brand", "subcategory", "specs", "minPrice", "maxPrice", "sort", "page"].forEach((key) => nextParams.delete(key));
    setSearchParams(nextParams);
  };

  const handleCompare = (product: (typeof results)[number]) => {
    const added = toggleCompare(product);
    if (added) {
      apiPost("/analytics/track", {
        productId: product.id,
        event: "add_to_compare",
        metadata: { source: "search", q: query },
      }).catch(() => {});
    }
  };

  const activeFilterCount =
    selectedConditions.length + selectedBrands.length + selectedSubcategories.length + countSelectedSpecValues(selectedSpecs);
  const hasActiveFilters = activeFilterCount > 0 || minPrice !== undefined || maxPrice !== undefined;

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1).filter((pageNumber) => {
      return pageNumber === 1 || pageNumber === pagination.totalPages || Math.abs(pageNumber - page) <= 1;
    });

    return (
      <Pagination className="mt-8 justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (page > 1) updateParams({ page: String(page - 1) }, false);
              }}
            />
          </PaginationItem>
          {pages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(event) => {
                  event.preventDefault();
                  updateParams({ page: String(pageNumber) }, false);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (page < pagination.totalPages) updateParams({ page: String(page + 1) }, false);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Condition</h4>
        {(["new", "refurbished", "ex-uk"] as ProductCondition[]).map((condition) => (
          <div key={condition} className="flex items-center gap-2">
            <Checkbox id={`search-cond-${condition}`} checked={selectedConditions.includes(condition)} onCheckedChange={() => toggleCondition(condition)} />
            <Label htmlFor={`search-cond-${condition}`} className="text-sm capitalize cursor-pointer">
              {condition === "ex-uk" ? "Ex-UK" : condition}
            </Label>
          </div>
        ))}
      </div>

      {filters.subcategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Subcategory</h4>
          {filters.subcategories.map((subcategory) => (
            <div key={subcategory} className="flex items-center gap-2">
              <Checkbox
                id={`search-subcategory-${subcategory}`}
                checked={selectedSubcategories.includes(subcategory)}
                onCheckedChange={() => toggleSubcategory(subcategory)}
              />
              <Label htmlFor={`search-subcategory-${subcategory}`} className="text-sm cursor-pointer">
                {subcategory}
              </Label>
            </div>
          ))}
        </div>
      )}

      {filters.brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Brand</h4>
          {filters.brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox id={`search-brand-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
              <Label htmlFor={`search-brand-${brand}`} className="text-sm cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      )}

      {filters.specs.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Specifications</h4>
          {filters.specs.map((spec) => (
            <div key={spec.name} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{spec.name}</p>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {spec.values.map((value) => (
                  <div key={`${spec.name}-${value}`} className="flex items-center gap-2">
                    <Checkbox
                      id={`search-spec-${spec.name}-${value}`}
                      checked={(selectedSpecs[spec.name] ?? []).includes(value)}
                      onCheckedChange={() => toggleSpec(spec.name, value)}
                    />
                    <Label htmlFor={`search-spec-${spec.name}-${value}`} className="text-sm cursor-pointer">
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Price Range</h4>
        <div className="flex gap-2">
          <Input type="number" placeholder="Min" value={minPrice ?? ""} onChange={(event) => updateParams({ minPrice: event.target.value || undefined })} className="text-sm" />
          <Input type="number" placeholder="Max" value={maxPrice ?? ""} onChange={(event) => updateParams({ maxPrice: event.target.value || undefined })} className="text-sm" />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <Seo
        title={query ? `Search results for "${query}"` : "Search products"}
        description={query ? `Browse internal search results for ${query} on TECHALVES Solutions.` : "Use the TECHALVES Solutions product search to find laptops, phones, desktops and accessories."}
        canonicalPath={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
        noIndex
      />
      <div className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{query ? `Results for "${query}"` : "Search Products"}</h1>
              {query && !isLoading && <p className="text-sm text-muted-foreground mt-1">{pagination?.total ?? 0} result(s) found</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" className="lg:hidden gap-2" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-1 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Select value={sortBy} onValueChange={(value) => updateParams({ sort: value })}>
              <SelectTrigger className="w-[180px] text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError && <QueryErrorState message="Search failed" onRetry={() => refetch()} compact />}

        {!query && (
          <div className="text-center py-16 space-y-3">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-lg text-muted-foreground">Type a search term to find products.</p>
            <Link to="/">
              <Button variant="outline">Browse categories</Button>
            </Link>
          </div>
        )}

        {query && (
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-40 rounded-xl border bg-card p-5">
                <FilterSidebar />
              </div>
            </aside>

            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-foreground/30" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-card p-6 overflow-y-auto shadow-elevated animate-in slide-in-from-right">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-lg">Filters</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <FilterSidebar />
                </div>
              </div>
            )}

            <div className="flex-1">
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {!isLoading && results.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <Search className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                  <p className="text-lg text-muted-foreground">No products found for "{query}"</p>
                  <p className="text-sm text-muted-foreground/70">Try a different search term or clear your current filters.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {results.length > 0 && !isLoading && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} onCompare={handleCompare} isComparing={isComparing(product.id)} />
                    ))}
                  </div>
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <CompareDrawer
        products={compareProducts}
        onRemove={removeCompare}
        onClear={clearCompare}
        isOpen={compareOpen}
        onToggle={() => setCompareOpen(!compareOpen)}
      />
    </Layout>
  );
};

export default SearchPage;
