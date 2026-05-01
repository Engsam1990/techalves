import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiPost } from "@/api/client";
import Layout from "@/components/layout/Layout";
import { useProduct, useRelatedProducts, useProductReviews, useCreateProductReview, formatPrice } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShieldCheck, MessageCircle, Truck, Award, ShoppingCart, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import QueryErrorState from "@/components/QueryErrorState";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { buildWhatsAppUrl } from "@/config/site";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/seo/Seo";
import { createBreadcrumbSchema, buildCanonicalUrl, toAbsoluteUrl, truncateText, stripHtml } from "@/lib/seo";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useProduct(slug || "");
  const { data: related = [] } = useRelatedProducts(slug || "");
  const { data: reviews = [], isLoading: reviewsLoading } = useProductReviews(slug || "");
  const { customer, token } = useCustomerAuth();
  const createReview = useCreateProductReview(slug || "", token);
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    if (product?.id) {
      apiPost("/analytics/track", {
        productId: product.id,
        event: "view",
      }).catch(() => {});
    }
  }, [product?.id]);

  useEffect(() => {
    if (!customer) return;

    setInquiryForm((current) => ({
      ...current,
      fullName: customer.fullName || current.fullName,
      email: customer.email || current.email,
      phone: customer.phone || current.phone || "",
    }));
  }, [customer]);

  const whatsappMessage = useMemo(() => {
    if (!product) return buildWhatsAppUrl();
    return buildWhatsAppUrl(`Hi! I'm interested in the ${product.name} (${formatPrice(product.price)}). Is it available?`);
  }, [product]);

  const productSeoTitle = product ? `${product.name} in Kenya` : "Product Details";
  const productSeoDescription = product
    ? truncateText(`${stripHtml(product.description)} ${product.condition === "ex-uk" ? "Ex-UK" : product.condition} ${product.brand} product available from TECHALVES Solutions with ${product.warranty}.`, 160)
    : "View product details from TECHALVES Solutions.";
  const productStructuredData = product
    ? [
        createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: product.category, path: `/category/${product.category}` },
          { name: product.name, path: `/product/${product.slug}` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: product.images.map((image) => toAbsoluteUrl(image)),
          description: stripHtml(product.description),
          brand: { "@type": "Brand", name: product.brand },
          sku: product.id,
          category: product.category,
          aggregateRating: product.reviewCount
            ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
            : undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "KES",
            price: product.price,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: buildCanonicalUrl(`/product/${product.slug}`),
            itemCondition: product.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
          },
        },
      ]
    : undefined;

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError) {
    return (
      <Layout>
        <Seo title="Product Details" description="Product details are temporarily unavailable." noIndex noFollow />
        <div className="container py-20">
          <QueryErrorState message="Failed to load product details" onRetry={() => refetch()} />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <Seo title="Product Not Found" description="The requested product could not be found." noIndex noFollow />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold">Product not found</h1>
          <Link to="/"><Button className="mt-4">Back to Home</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      toast.error("Please sign in to leave a review.");
      return;
    }

    createReview.mutate(
      { rating: reviewRating, comment: reviewComment.trim() },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Review saved successfully.");
          setReviewComment("");
        },
        onError: (error) => {
          toast.error(error.message || "Could not save your review.");
        },
      }
    );
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const message = inquiryForm.message.trim();
    if (!message) {
      toast.error("Please enter your inquiry message.");
      return;
    }

    setSubmittingInquiry(true);
    try {
      await apiPost("/contact", {
        fullName: inquiryForm.fullName.trim(),
        email: inquiryForm.email.trim(),
        phone: inquiryForm.phone.trim(),
        subject: `[Product Inquiry] ${product.name}`,
        message: [
          `Product: ${product.name}`,
          `Product URL: ${buildCanonicalUrl(`/product/${product.slug}`)}`,
          `Price: ${formatPrice(product.price)}`,
          "",
          "Customer inquiry:",
          message,
        ].join("\n"),
      });

      apiPost("/analytics/track", {
        productId: product.id,
        event: "inquiry",
        metadata: { channel: "form", slug: product.slug },
      }).catch(() => {});

      toast.success("Inquiry sent successfully. The admin can now review it from the dashboard.");
      setInquiryForm((current) => ({ ...current, message: "" }));
    } catch (error: any) {
      toast.error(error.message || "Could not send your inquiry.");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <Layout>
      <Seo
        title={productSeoTitle}
        description={productSeoDescription}
        canonicalPath={product ? `/product/${product.slug}` : slug ? `/product/${slug}` : "/"}
        image={product?.images?.[0]}
        type="product"
        keywords={product ? [product.name, product.brand, `${product.category} Kenya`, product.condition] : undefined}
        structuredData={productStructuredData}
      />
      <div className="container py-6 sm:py-8">
        <div className="mb-6 flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-primary capitalize">{product.category}</Link>
          <span>/</span>
          <span className="min-w-0 break-words text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted sm:aspect-square md:cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={isZoomed ? { transform: "scale(2)", transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-20 ${i === selectedImage ? "border-primary" : "border-transparent hover:border-muted-foreground/30"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">{product.brand}</p>
              <h1 className="break-words text-2xl font-display font-bold text-foreground lg:text-3xl">{product.name}</h1>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-display font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
              {product.originalPrice && <Badge className="bg-destructive text-destructive-foreground">Save {formatPrice(product.originalPrice - product.price)}</Badge>}
            </div>

            <article className="prose max-w-none break-words prose-headings:font-display prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: product.description }} />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted text-center">
                <Truck className="h-5 w-5 text-primary" /><span className="text-xs font-medium">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted text-center">
                <ShieldCheck className="h-5 w-5 text-primary" /><span className="text-xs font-medium">{product.warranty}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted text-center">
                <Award className="h-5 w-5 text-primary" /><span className="text-xs font-medium">{product.inStock ? "In Stock" : "Out of Stock"}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href={whatsappMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 lg:col-span-1"
                onClick={() => {
                  apiPost("/analytics/track", {
                    productId: product.id,
                    event: "inquiry",
                    metadata: { channel: "whatsapp", slug: product.slug },
                  }).catch(() => {});
                }}
              >
                <Button size="lg" variant="secondary" className="w-full gap-2 font-semibold"><MessageCircle className="h-5 w-5" />Inquire</Button>
              </a>
              <Button
                size="lg"
                variant="highlight"
                className="w-full gap-2 font-semibold"
                onClick={() => {
                  addToCart(product, 1);
                  toast.success("Added to cart");
                }}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="highlight"
                className="w-full gap-2 font-semibold"
                onClick={() => {
                  addToCart(product, 1);
                  toast.success("Taking you to checkout");
                  navigate(customer ? "/checkout" : "/auth?redirect=/checkout");
                }}
                disabled={!product.inStock}
              >
                <Zap className="h-5 w-5" />
                Buy Now
              </Button>
            </div>

            <Separator />

            <div>
              <h2 className="font-display font-semibold text-lg mb-3">Specifications</h2>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table><TableBody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <TableRow key={key}><TableCell className="w-36 min-w-36 font-medium text-muted-foreground sm:w-1/3">{key}</TableCell><TableCell className="break-words">{String(value)}</TableCell></TableRow>
                    ))}
                  </TableBody></Table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-2xl font-display font-bold">Customer Reviews</h2>
                <p className="text-sm text-muted-foreground mt-1">Real customer reviews stored in your database.</p>
              </div>
              <Badge variant="outline">{product.reviewCount} total</Badge>
            </div>

            {reviewsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="rounded-xl border bg-card p-5 h-40 animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 text-muted-foreground">
                No reviews yet. Be the first customer to share your experience.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{review.reviewerName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />))}</div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Send a Product Inquiry</CardTitle>
                <p className="text-sm text-muted-foreground">This form goes straight into the admin dashboard inbox for review.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        value={inquiryForm.fullName}
                        onChange={(e) => setInquiryForm((current) => ({ ...current, fullName: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm((current) => ({ ...current, email: e.target.value }))}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm((current) => ({ ...current, phone: e.target.value }))}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Inquiry</label>
                    <Textarea
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm((current) => ({ ...current, message: e.target.value }))}
                      rows={5}
                      minLength={10}
                      maxLength={2000}
                      placeholder="Ask about availability, warranty, delivery, specs, or bulk pricing."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submittingInquiry}>
                    {submittingInquiry && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Send Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="rounded-xl border bg-card p-6 h-fit">
              <h3 className="font-display font-bold text-xl mb-2">Leave a Review</h3>
              <p className="text-sm text-muted-foreground mb-4">Signed-in customers can post a review. Submitting again updates your previous review.</p>

              {!customer ? (
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  Please <Link to="/auth" className="text-primary font-medium hover:underline">sign in</Link> to leave a review.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Your rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setReviewRating(value)}
                          className={`h-10 w-10 rounded-full border flex items-center justify-center transition-colors ${reviewRating >= value ? "bg-secondary text-secondary-foreground border-secondary" : "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"}`}
                        >
                          <Star className={`h-4 w-4 ${reviewRating >= value ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Your review</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={5}
                      minLength={10}
                      maxLength={1500}
                      placeholder="Tell other customers what you liked, what condition the item arrived in, and whether you would recommend it."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createReview.isPending}>
                    {createReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Review
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {related.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
