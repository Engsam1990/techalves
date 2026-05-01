import { Product, formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";
import { X, GitCompareArrows, Share2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface CompareDrawerProps {
  products: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CompareDrawer = ({ products, onRemove, onClear, isOpen, onToggle }: CompareDrawerProps) => {
  if (products.length === 0) return null;

  const allSpecKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Comparison link copied.");
    } catch {
      toast.error("Could not copy the comparison link.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-elevated"
      >
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 overflow-x-auto">
            <GitCompareArrows className="h-5 w-5 text-primary shrink-0" />
            <span className="font-display font-semibold text-sm shrink-0">
              {products.length} product{products.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              {products.map((p) => (
                <div key={p.id} className="relative group/chip shrink-0">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border bg-muted">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>Clear</Button>
            <Button size="sm" onClick={onToggle} disabled={products.length < 2} className="gap-2">
              <GitCompareArrows className="h-4 w-4" />
              Compare ({products.length}/3)
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && products.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onToggle} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card rounded-2xl shadow-elevated max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="font-display font-bold text-xl">Product Comparison</h2>
                  <p className="text-sm text-muted-foreground">This comparison can be reopened or shared using the current page link.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onToggle}><X className="h-5 w-5" /></Button>
              </div>
              <div className="p-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Feature</TableHead>
                      {products.map((p) => (
                        <TableHead key={p.id} className="min-w-[200px] align-top">
                          <div className="space-y-2">
                            <div className="h-32 w-full rounded-lg overflow-hidden bg-muted">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <Link to={`/product/${p.slug}`} className="font-display font-semibold text-sm hover:text-primary transition-colors block">
                              {p.name}
                            </Link>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">Price</TableCell>
                      {products.map((p) => (
                        <TableCell key={p.id} className="font-display font-bold text-primary">{formatPrice(p.price)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">Brand</TableCell>
                      {products.map((p) => <TableCell key={p.id}>{p.brand}</TableCell>)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">Condition</TableCell>
                      {products.map((p) => <TableCell key={p.id} className="capitalize">{p.condition === "ex-uk" ? "Ex-UK" : p.condition}</TableCell>)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">Warranty</TableCell>
                      {products.map((p) => <TableCell key={p.id}>{p.warranty}</TableCell>)}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">Rating</TableCell>
                      {products.map((p) => <TableCell key={p.id}>{p.rating} ⭐ ({p.reviewCount})</TableCell>)}
                    </TableRow>
                    {allSpecKeys.map((key) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium text-muted-foreground">{key}</TableCell>
                        {products.map((p) => (
                          <TableCell key={p.id}>{String(p.specs[key] ?? "—")}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CompareDrawer;
