import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  ShoppingCart,
  User,
  Shield,
  LogOut,
  LayoutDashboard,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, useCategories, useSearchProducts } from "@/api/hooks";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { siteConfig } from "@/config/site";
import logo from "@assets/logo.png";

function useDebouncedValue<T>(value: T, delay = 220) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

interface SearchBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (query: string) => void;
  onNavigate?: () => void;
  className?: string;
}

const SearchBox = ({ value, onValueChange, onSearch, onNavigate, className }: SearchBoxProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebouncedValue(value.trim());
  const [isOpen, setIsOpen] = useState(false);

  const suggestionsQuery = debouncedQuery.length >= 2 ? debouncedQuery : "";
  const { data, isFetching } = useSearchProducts({ q: suggestionsQuery, page: 1, limit: 6, sort: "newest" });
  const suggestions = data?.data ?? [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.trim().length < 2) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [value]);

  return (
    <div ref={wrapperRef} className={className}>
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(value);
          setIsOpen(false);
        }}
      >
        <Input
          placeholder="Search products..."
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => {
            if (value.trim().length >= 2) setIsOpen(true);
          }}
          className="border border-white/10 bg-white/10 pr-10 text-white placeholder:text-white/55 focus-visible:ring-[#FEEF00]"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4 text-white/80" />
        </button>
      </form>

      {isOpen && value.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="max-h-[22rem] overflow-y-auto p-2">
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
              </div>
            ) : suggestions.length ? (
              <>
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onValueChange("");
                      setIsOpen(false);
                      onNavigate?.();
                      navigate(`/product/${product.slug}`);
                    }}
                  >
                    <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded-lg border object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSearch(value);
                    setIsOpen(false);
                    onNavigate?.();
                  }}
                >
                  <span>View all results for “{value.trim()}”</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No quick matches yet. Press enter to search all products.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompact, setIsCompact] = useState(false);
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { customer, logout: customerLogout } = useCustomerAuth();
  const { user: adminUser, logout: adminLogout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const runSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleCustomerLogout = () => {
    customerLogout();
    closeMobileMenu();
    navigate("/");
  };

  const handleAdminLogout = () => {
    adminLogout();
    closeMobileMenu();
    navigate("/");
  };

  const AuthDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Account"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {!customer && !adminUser ? (
          <>
            <DropdownMenuLabel>Choose login</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/auth" onClick={closeMobileMenu} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Customer Login</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/login" onClick={closeMobileMenu} className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin Login</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <>
            {customer && (
              <>
                <DropdownMenuLabel>Customer account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/account" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleCustomerLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}

            {customer && <DropdownMenuSeparator />}

            {adminUser ? (
              <>
                <DropdownMenuLabel>Admin</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleAdminLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Admin Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Admin</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/login" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin Login</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}

            {!customer && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Customer</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/auth" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Customer Login</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#030303]/80 backdrop-blur-sm">
      <nav className="bg-[#030303] shadow-sm">
        <div
          className={`container border-b border-white/10 flex items-center justify-between gap-2 pl-2 pr-3 transition-all duration-300 sm:pl-3 sm:pr-4 md:gap-4 md:py-3 ${isCompact ? "py-2" : "py-3"
            }`}
        >
          <Link to="/" className="-ml-3 shrink-0 sm:-ml-4">
            <img
              src={logo}
              alt={siteConfig.businessName}
              className={`w-auto transition-all duration-300 ${isCompact ? "h-9 sm:h-10" : "h-10 sm:h-11"}`}
            />
          </Link>

          <SearchBox
            value={searchQuery}
            onValueChange={setSearchQuery}
            onSearch={runSearch}
            className="relative hidden max-w-xl flex-1 md:block"
          />

          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FEEF00] px-1 text-[10px] text-[#030303]">
                  {itemCount}
                </Badge>
              )}
            </Link>

            <AuthDropdown />

            <Link to="/contact">
              <Button
                size="sm"
                className="hidden border-0 bg-[#FEEF00] font-semibold text-[#030303] hover:bg-[#FEEF00]/90 sm:inline-flex"
              >
                Contact Us
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div
          className={`hidden overflow-hidden bg-white transition-all duration-300 md:block ${isCompact ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
            }`}
        >
          <div
            className={`container flex flex-wrap items-center justify-center gap-1 transition-all duration-300 ${isCompact ? "py-0" : "py-1"
              }`}
          >
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary"
                >
                  {cat.name}
                </Button>
              </Link>
            ))}
            <Link to="/blog">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary"
              >
                Blog
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary"
              >
                About Us
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 border-b border-white/10 bg-[#030303] shadow-lg md:hidden">
          <div className="container py-1">
            <SearchBox
              value={searchQuery}
              onValueChange={setSearchQuery}
              onSearch={runSearch}
              onNavigate={closeMobileMenu}
              className="relative"
            />

            <div className="grid gap-1">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 hover:text-white">
                    {cat.name}
                  </Button>
                </Link>
              ))}
              <Link to="/blog" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 hover:text-white">
                  Blog
                </Button>
              </Link>
              <Link to="/about" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 hover:text-white">
                  About Us
                </Button>
              </Link>
              <Link to="/contact" onClick={closeMobileMenu}>
                <Button className="w-full justify-start border-0 bg-[#FEEF00] text-[#030303] hover:bg-[#FEEF00]/90">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;