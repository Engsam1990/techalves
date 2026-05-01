export type AdminPermission =
  | "dashboard:view"
  | "dashboard:view_product_stats"
  | "dashboard:view_finance"
  | "dashboard:view_inquiries"
  | "dashboard:view_orders"
  | "products:view"
  | "products:view_all"
  | "products:create"
  | "products:edit"
  | "products:edit_basic"
  | "products:edit_serials"
  | "products:edit_pricing_stock"
  | "products:edit_sources"
  | "products:edit_images"
  | "products:toggle_featured"
  | "products:toggle_premium"
  | "products:delete"
  | "products:archive"
  | "inventory:view"
  | "inventory:view_overview"
  | "inventory:view_metrics"
  | "inventory:view_stock_health"
  | "inventory:view_categories"
  | "inventory:view_movements"
  | "inventory:view_product_flow"
  | "inventory:view_action_lists"
  | "inventory:receive_stock"
  | "inventory:adjust"
  | "pos:use"
  | "orders:view"
  | "orders:view_all"
  | "orders:update_status"
  | "orders:record_payment"
  | "orders:refund"
  | "orders:return_items"
  | "finance:view"
  | "finance:view_all"
  | "finance:export"
  | "expenses:view"
  | "expenses:view_all"
  | "expenses:create"
  | "expenses:edit"
  | "expenses:void"
  | "sources:view"
  | "sources:manage"
  | "sourcing_payments:view"
  | "sourcing_payments:update"
  | "catalog:view"
  | "catalog:manage"
  | "blog:view"
  | "blog:manage"
  | "messages:view"
  | "messages:manage"
  | "newsletter:view"
  | "newsletter:manage"
  | "customers:view"
  | "customers:manage"
  | "analytics:view"
  | "uploads:manage"
  | "admin_users:manage"
  | "super_admin:view";

export type AdminPermissionDefinition = {
  key: AdminPermission;
  label: string;
  group: string;
  description: string;
};

export const ADMIN_PERMISSION_DEFINITIONS: AdminPermissionDefinition[] = [
  { key: "dashboard:view", label: "View dashboard", group: "Dashboard", description: "Open the store dashboard page. Section checkboxes control what appears inside it." },
  { key: "dashboard:view_product_stats", label: "View dashboard product stats", group: "Dashboard", description: "View product, stock, analytics, inquiry, and conversion stat cards." },
  { key: "dashboard:view_finance", label: "View dashboard finance", group: "Dashboard", description: "View dashboard revenue and order health cards." },
  { key: "dashboard:view_inquiries", label: "View dashboard inquiries", group: "Dashboard", description: "View latest product inquiries on the dashboard." },
  { key: "dashboard:view_orders", label: "View dashboard orders", group: "Dashboard", description: "View recent orders on the dashboard." },
  { key: "products:view", label: "View products", group: "Products", description: "Open product lists and product details." },
  { key: "products:view_all", label: "View all product reports", group: "Products", description: "See products added by every admin. Without this, admins only see their own products." },
  { key: "products:create", label: "Create products", group: "Products", description: "Add new catalog or POS products." },
  { key: "products:edit", label: "Edit all product sections", group: "Products", description: "Update every product section. Existing roles with this permission keep full edit access." },
  { key: "products:edit_basic", label: "Edit product basic info + specs", group: "Products", description: "Update product name, category, brand, condition, description, barcode, and specifications." },
  { key: "products:edit_serials", label: "Edit product serial numbers", group: "Products", description: "Add or remove unsold product serial numbers." },
  { key: "products:edit_pricing_stock", label: "Edit product pricing & stock", group: "Products", description: "Update product prices, warranty, stock received, and stock quantity." },
  { key: "products:edit_sources", label: "Edit product supplier/source", group: "Products", description: "Update product supplier, acquisition date, acquisition cost, and acquisition payment status." },
  { key: "products:edit_images", label: "Edit product images", group: "Products", description: "Add, remove, and reorder product gallery photos." },
  { key: "products:toggle_featured", label: "Toggle featured products", group: "Products", description: "Mark or unmark products as featured for hot-deal sections." },
  { key: "products:toggle_premium", label: "Toggle premium products", group: "Products", description: "Mark or unmark products as premium for hero carousel sections." },
  { key: "products:delete", label: "Delete/archive products", group: "Products", description: "Remove unused products or archive products with history." },
  { key: "products:archive", label: "Archive products", group: "Products", description: "Hide products from catalog without deleting history." },
  { key: "inventory:view", label: "View inventory", group: "Inventory", description: "Open the inventory dashboard page. Section checkboxes control what appears inside it." },
  { key: "inventory:view_overview", label: "View inventory overview", group: "Inventory", description: "View the inventory control center, watchlist, and period context." },
  { key: "inventory:view_metrics", label: "View inventory metrics", group: "Inventory", description: "View core inventory metric cards and valuation totals." },
  { key: "inventory:view_stock_health", label: "View stock health chart", group: "Inventory", description: "View the stock-health distribution chart." },
  { key: "inventory:view_categories", label: "View category inventory", group: "Inventory", description: "View category-level inventory value and unit charts." },
  { key: "inventory:view_movements", label: "View inventory movements", group: "Inventory", description: "View movement timeline and recent inventory ledger activity." },
  { key: "inventory:view_product_flow", label: "View product flow", group: "Inventory", description: "View fastest outflow and top replenished product sections." },
  { key: "inventory:view_action_lists", label: "View inventory action lists", group: "Inventory", description: "View low-stock, sold-out, overstock, dormant, and barcode action lists." },
  { key: "inventory:receive_stock", label: "Receive stock", group: "Inventory", description: "Record stock received from suppliers." },
  { key: "inventory:adjust", label: "Adjust inventory", group: "Inventory", description: "Perform stock corrections and stock status changes." },
  { key: "pos:use", label: "Use POS", group: "POS", description: "Open POS and create walk-in sales." },
  { key: "orders:view", label: "View orders", group: "Orders", description: "Open order lists and details." },
  { key: "orders:view_all", label: "View all order reports", group: "Orders", description: "See orders and sales recorded by every admin. Without this, admins only see their own orders." },
  { key: "orders:update_status", label: "Update order status", group: "Orders", description: "Confirm, process, complete, or cancel orders." },
  { key: "orders:record_payment", label: "Record payments", group: "Orders", description: "Add order payment events and partial payments." },
  { key: "orders:refund", label: "Record refunds", group: "Orders", description: "Record refund payment events." },
  { key: "orders:return_items", label: "Process returns", group: "Orders", description: "Return order items and restore stock when needed." },
  { key: "finance:view", label: "View finance", group: "Finance", description: "Open finance, revenue, COGS, and profit reports." },
  { key: "finance:view_all", label: "View comprehensive finance", group: "Finance", description: "See company-wide finance reports. Without this, admins only see finance tied to their own activity." },
  { key: "finance:export", label: "Export finance", group: "Finance", description: "Download finance exports when available." },
  { key: "expenses:view", label: "View expenses", group: "Expenses", description: "Open expense lists and expense summaries." },
  { key: "expenses:view_all", label: "View all expense reports", group: "Expenses", description: "See expenses recorded by every admin. Without this, admins only see their own expenses." },
  { key: "expenses:create", label: "Create expenses", group: "Expenses", description: "Record supplier, sale, and other expenses." },
  { key: "expenses:edit", label: "Edit expenses", group: "Expenses", description: "Update expense details, payment status, and references." },
  { key: "expenses:void", label: "Void expenses", group: "Expenses", description: "Cancel expenses without unsafe hard-deletes." },
  { key: "sources:view", label: "View suppliers/sources", group: "Suppliers", description: "Open supplier/source lists." },
  { key: "sources:manage", label: "Manage suppliers/sources", group: "Suppliers", description: "Create, update, deactivate, or delete supplier records." },
  { key: "sourcing_payments:view", label: "View source payments", group: "Suppliers", description: "Open source payment and payable lists." },
  { key: "sourcing_payments:update", label: "Update source payments", group: "Suppliers", description: "Mark acquisition payments as paid or pending." },
  { key: "catalog:view", label: "View catalog setup", group: "Catalog", description: "Open categories, brands, subcategories, and specs." },
  { key: "catalog:manage", label: "Manage catalog setup", group: "Catalog", description: "Create, edit, and remove catalog setup records." },
  { key: "blog:view", label: "View blog", group: "Content", description: "Open blog admin lists and article details." },
  { key: "blog:manage", label: "Manage blog", group: "Content", description: "Create, edit, publish, and delete blog posts." },
  { key: "messages:view", label: "View messages", group: "Communication", description: "Open customer contact messages." },
  { key: "messages:manage", label: "Manage messages", group: "Communication", description: "Update message status or remove messages." },
  { key: "newsletter:view", label: "View newsletter", group: "Communication", description: "Open newsletter subscribers." },
  { key: "newsletter:manage", label: "Manage newsletter", group: "Communication", description: "Remove or manage newsletter subscribers." },
  { key: "customers:view", label: "View customers", group: "Customers", description: "Open customer lists and customer details." },
  { key: "customers:manage", label: "Manage customers", group: "Customers", description: "Reserved for future customer edit/suspend tools." },
  { key: "analytics:view", label: "View analytics", group: "Analytics", description: "Open product analytics and activity timelines." },
  { key: "uploads:manage", label: "Upload files", group: "System", description: "Upload images and admin media." },
  { key: "admin_users:manage", label: "Manage admin users", group: "Super Admin", description: "Create admins, reset passwords, assign permissions, and remove admins." },
  { key: "super_admin:view", label: "View super admin panel", group: "Super Admin", description: "Open the super admin dashboard." },
];

export const STANDARD_ADMIN_DEFAULT_PERMISSIONS = ADMIN_PERMISSION_DEFINITIONS
  .map((item) => item.key)
  .filter((key) => (
    key !== "admin_users:manage" &&
    key !== "super_admin:view" &&
    key !== "sourcing_payments:update" &&
    !key.endsWith(":view_all")
  ));

export type AdminIdentity = {
  role?: string | null;
  permissions?: string[] | null;
} | null | undefined;

export function getFallbackPermissionsForRole(role?: string | null): AdminPermission[] {
  return String(role || "").trim().toLowerCase() === "super_admin"
    ? ADMIN_PERMISSION_DEFINITIONS.map((item) => item.key)
    : STANDARD_ADMIN_DEFAULT_PERMISSIONS;
}

export function hasAdminPermission(user: AdminIdentity, permission?: AdminPermission | null) {
  if (!permission) return true;
  if (String(user?.role || "").trim().toLowerCase() === "super_admin") return true;
  const explicit = Array.isArray(user?.permissions) ? user.permissions : [];
  const permissions = Array.isArray(user?.permissions) ? explicit : getFallbackPermissionsForRole(user?.role);
  return permissions.includes(permission);
}

export function groupPermissionDefinitions(definitions: AdminPermissionDefinition[] = ADMIN_PERMISSION_DEFINITIONS) {
  return definitions.reduce<Record<string, AdminPermissionDefinition[]>>((acc, permission) => {
    acc[permission.group] = acc[permission.group] || [];
    acc[permission.group].push(permission);
    return acc;
  }, {});
}
