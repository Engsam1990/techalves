"use strict";
// server/src/middleware/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ADMIN_PERMISSIONS = exports.ADMIN_PERMISSION_DEFINITIONS = void 0;
exports.normalizeAdminRole = normalizeAdminRole;
exports.isSuperAdminRole = isSuperAdminRole;
exports.normalizeAdminPermissions = normalizeAdminPermissions;
exports.getAdminPermissionsForRole = getAdminPermissionsForRole;
exports.getAdminPermissionsForUser = getAdminPermissionsForUser;
exports.hasAdminPermission = hasAdminPermission;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.requireAuth = requireAuth;
exports.requireAdminPermission = requireAdminPermission;
exports.requireSuperAdmin = requireSuperAdmin;
exports.requireCustomerAuth = requireCustomerAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const db_1 = require("../lib/db");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
}
exports.ADMIN_PERMISSION_DEFINITIONS = [
    {
        key: "dashboard:view",
        label: "View dashboard",
        group: "Dashboard",
        description: "Open the admin dashboard and overview cards.",
    },
    {
        key: "products:view",
        label: "View products",
        group: "Products",
        description: "Open product lists and product details.",
    },
    {
        key: "products:create",
        label: "Create products",
        group: "Products",
        description: "Add new catalog or POS products.",
    },
    {
        key: "products:edit",
        label: "Edit all product sections",
        group: "Products",
        description: "Update every product section. Existing roles with this permission keep full edit access.",
    },
    {
        key: "products:edit_basic",
        label: "Edit product basic info + specs",
        group: "Products",
        description: "Update product name, category, brand, condition, description, barcode, and specifications.",
    },
    {
        key: "products:edit_serials",
        label: "Edit product serial numbers",
        group: "Products",
        description: "Add or remove unsold product serial numbers.",
    },
    {
        key: "products:edit_pricing_stock",
        label: "Edit product pricing & stock",
        group: "Products",
        description: "Update product prices, warranty, stock received, and stock quantity.",
    },
    {
        key: "products:edit_sources",
        label: "Edit product supplier/source",
        group: "Products",
        description: "Update product supplier, acquisition date, acquisition cost, and acquisition payment status.",
    },
    {
        key: "products:edit_images",
        label: "Edit product images",
        group: "Products",
        description: "Add, remove, and reorder product gallery photos.",
    },
    {
        key: "products:toggle_featured",
        label: "Toggle featured products",
        group: "Products",
        description: "Mark or unmark products as featured for hot-deal sections.",
    },
    {
        key: "products:toggle_premium",
        label: "Toggle premium products",
        group: "Products",
        description: "Mark or unmark products as premium for hero carousel sections.",
    },
    {
        key: "products:delete",
        label: "Delete/archive products",
        group: "Products",
        description: "Remove unused products or archive products with history.",
    },
    {
        key: "products:archive",
        label: "Archive products",
        group: "Products",
        description: "Hide products from catalog without deleting history.",
    },
    {
        key: "inventory:view",
        label: "View inventory",
        group: "Inventory",
        description: "Open stock reports and inventory movement lists.",
    },
    {
        key: "inventory:receive_stock",
        label: "Receive stock",
        group: "Inventory",
        description: "Record stock received from suppliers.",
    },
    {
        key: "inventory:adjust",
        label: "Adjust inventory",
        group: "Inventory",
        description: "Perform stock corrections and stock status changes.",
    },
    {
        key: "pos:use",
        label: "Use POS",
        group: "POS",
        description: "Open the POS and create walk-in sales.",
    },
    {
        key: "orders:view",
        label: "View orders",
        group: "Orders",
        description: "Open order lists and details.",
    },
    {
        key: "orders:update_status",
        label: "Update order status",
        group: "Orders",
        description: "Confirm, process, complete, or cancel orders.",
    },
    {
        key: "orders:record_payment",
        label: "Record payments",
        group: "Orders",
        description: "Add order payment events and partial payments.",
    },
    {
        key: "orders:refund",
        label: "Record refunds",
        group: "Orders",
        description: "Record refund payment events.",
    },
    {
        key: "orders:return_items",
        label: "Process returns",
        group: "Orders",
        description: "Return order items and restore stock when needed.",
    },
    {
        key: "finance:view",
        label: "View finance",
        group: "Finance",
        description: "Open finance reports, revenue, COGS, and profit summaries.",
    },
    {
        key: "finance:export",
        label: "Export finance",
        group: "Finance",
        description: "Download finance exports when available.",
    },
    {
        key: "expenses:view",
        label: "View expenses",
        group: "Expenses",
        description: "Open expense lists and expense summaries.",
    },
    {
        key: "expenses:create",
        label: "Create expenses",
        group: "Expenses",
        description: "Record sale and operating expenses.",
    },
    {
        key: "expenses:edit",
        label: "Edit expenses",
        group: "Expenses",
        description: "Update expense details, payment status, and references.",
    },
    {
        key: "expenses:void",
        label: "Void expenses",
        group: "Expenses",
        description: "Cancel expenses without unsafe hard-deletes.",
    },
    {
        key: "sources:view",
        label: "View suppliers/sources",
        group: "Suppliers",
        description: "Open supplier/source lists.",
    },
    {
        key: "sources:manage",
        label: "Manage suppliers/sources",
        group: "Suppliers",
        description: "Create, update, deactivate, or delete supplier records.",
    },
    {
        key: "sourcing_payments:view",
        label: "View source payments",
        group: "Suppliers",
        description: "Open source payment and payable lists.",
    },
    {
        key: "sourcing_payments:update",
        label: "Update source payments",
        group: "Suppliers",
        description: "Mark product acquisition payments as paid or pending.",
    },
    {
        key: "catalog:view",
        label: "View catalog setup",
        group: "Catalog",
        description: "Open categories, brands, subcategories, and specs.",
    },
    {
        key: "catalog:manage",
        label: "Manage catalog setup",
        group: "Catalog",
        description: "Create, edit, and remove catalog setup records.",
    },
    {
        key: "blog:view",
        label: "View blog",
        group: "Content",
        description: "Open blog admin lists and article details.",
    },
    {
        key: "blog:manage",
        label: "Manage blog",
        group: "Content",
        description: "Create, edit, publish, and delete blog posts.",
    },
    {
        key: "messages:view",
        label: "View messages",
        group: "Communication",
        description: "Open customer contact messages.",
    },
    {
        key: "messages:manage",
        label: "Manage messages",
        group: "Communication",
        description: "Update message status or remove messages.",
    },
    {
        key: "newsletter:view",
        label: "View newsletter",
        group: "Communication",
        description: "Open newsletter subscribers.",
    },
    {
        key: "newsletter:manage",
        label: "Manage newsletter",
        group: "Communication",
        description: "Remove or manage newsletter subscribers.",
    },
    {
        key: "customers:view",
        label: "View customers",
        group: "Customers",
        description: "Open customer lists and customer details.",
    },
    {
        key: "customers:manage",
        label: "Manage customers",
        group: "Customers",
        description: "Reserved for customer edit/suspend tools.",
    },
    {
        key: "analytics:view",
        label: "View analytics",
        group: "Analytics",
        description: "Open product analytics and activity timelines.",
    },
    {
        key: "uploads:manage",
        label: "Upload files",
        group: "System",
        description: "Upload images and admin media.",
    },
    {
        key: "admin_users:manage",
        label: "Manage admin users",
        group: "Super Admin",
        description: "Create admins, reset passwords, assign permissions, and remove admins.",
    },
    {
        key: "super_admin:view",
        label: "View super admin panel",
        group: "Super Admin",
        description: "Open the super admin dashboard.",
    },
];
exports.ALL_ADMIN_PERMISSIONS = exports.ADMIN_PERMISSION_DEFINITIONS.map((item) => item.key);
const VALID_PERMISSION_SET = new Set(exports.ALL_ADMIN_PERMISSIONS);
const SUPER_ADMIN_ONLY = new Set([
    "admin_users:manage",
    "super_admin:view",
]);
const LEGACY_PERMISSION_MAP = {
    "products:manage": [
        "products:view",
        "products:create",
        "products:edit",
        "products:edit_basic",
        "products:edit_serials",
        "products:edit_pricing_stock",
        "products:edit_sources",
        "products:edit_images",
        "products:toggle_featured",
        "products:toggle_premium",
        "products:delete",
        "products:archive",
    ],
    "products:edit": [
        "products:edit",
        "products:edit_basic",
        "products:edit_serials",
        "products:edit_pricing_stock",
        "products:edit_sources",
        "products:edit_images",
        "products:toggle_featured",
        "products:toggle_premium",
    ],
    "inventory:manage": [
        "inventory:view",
        "inventory:receive_stock",
        "inventory:adjust",
    ],
    "pos:manage": ["pos:use"],
    "orders:manage": [
        "orders:view",
        "orders:update_status",
        "orders:record_payment",
        "orders:refund",
        "orders:return_items",
    ],
    "expenses:manage": [
        "expenses:view",
        "expenses:create",
        "expenses:edit",
        "expenses:void",
    ],
    "sources:manage": [
        "sources:view",
        "sources:manage",
        "sourcing_payments:view",
        "sourcing_payments:update",
    ],
    "catalog:manage": ["catalog:view", "catalog:manage"],
    "blog:manage": ["blog:view", "blog:manage"],
    "messages:manage": ["messages:view", "messages:manage"],
    "newsletter:manage": ["newsletter:view", "newsletter:manage"],
};
const STANDARD_ADMIN_DEFAULTS = [
    "dashboard:view",
    "products:view",
    "products:create",
    "products:edit",
    "products:edit_basic",
    "products:edit_serials",
    "products:edit_pricing_stock",
    "products:edit_sources",
    "products:edit_images",
    "products:toggle_featured",
    "products:toggle_premium",
    "products:delete",
    "products:archive",
    "inventory:view",
    "inventory:receive_stock",
    "inventory:adjust",
    "pos:use",
    "orders:view",
    "orders:update_status",
    "orders:record_payment",
    "orders:refund",
    "orders:return_items",
    "finance:view",
    "finance:export",
    "expenses:view",
    "expenses:create",
    "expenses:edit",
    "expenses:void",
    "sources:view",
    "sources:manage",
    "sourcing_payments:view",
    "sourcing_payments:update",
    "catalog:view",
    "catalog:manage",
    "blog:view",
    "blog:manage",
    "messages:view",
    "messages:manage",
    "newsletter:view",
    "newsletter:manage",
    "customers:view",
    "customers:manage",
    "analytics:view",
    "uploads:manage",
];
function normalizeAdminRole(role) {
    return String(role || "").trim().toLowerCase() === "super_admin"
        ? "super_admin"
        : "admin";
}
function isSuperAdminRole(role) {
    return normalizeAdminRole(role) === "super_admin";
}
function parsePermissionsJson(value) {
    if (value === null || value === undefined || value === "")
        return null;
    if (Array.isArray(value)) {
        return value.map(String);
    }
    try {
        const parsed = JSON.parse(String(value));
        return Array.isArray(parsed) ? parsed.map(String) : null;
    }
    catch {
        return null;
    }
}
function normalizeAdminPermissions(input, role) {
    const effectiveRole = normalizeAdminRole(role);
    if (effectiveRole === "super_admin") {
        return [...exports.ALL_ADMIN_PERMISSIONS];
    }
    const raw = Array.isArray(input)
        ? input.map(String)
        : parsePermissionsJson(input) || [];
    const expanded = new Set();
    for (const item of raw) {
        const mapped = LEGACY_PERMISSION_MAP[item];
        if (mapped) {
            mapped.forEach((permission) => expanded.add(permission));
            continue;
        }
        if (VALID_PERMISSION_SET.has(item)) {
            expanded.add(item);
        }
    }
    return Array.from(expanded).filter((permission) => !SUPER_ADMIN_ONLY.has(permission));
}
function getAdminPermissionsForRole(role) {
    return isSuperAdminRole(role)
        ? [...exports.ALL_ADMIN_PERMISSIONS]
        : [...STANDARD_ADMIN_DEFAULTS];
}
function getAdminPermissionsForUser(user) {
    const role = normalizeAdminRole(user?.role);
    if (role === "super_admin") {
        return [...exports.ALL_ADMIN_PERMISSIONS];
    }
    const hasPermissionsProperty = !!user && Object.prototype.hasOwnProperty.call(user, "permissions");
    const hasPermissionsJsonProperty = !!user && Object.prototype.hasOwnProperty.call(user, "permissionsJson");
    const explicit = hasPermissionsProperty ? user?.permissions : undefined;
    const explicitJson = hasPermissionsJsonProperty ? user?.permissionsJson : undefined;
    const hasExplicit = explicit !== undefined && explicit !== null;
    const hasExplicitJson = explicitJson !== undefined && explicitJson !== null && explicitJson !== "";
    if (hasExplicit || hasExplicitJson) {
        return normalizeAdminPermissions(hasExplicit ? explicit : explicitJson, role);
    }
    return getAdminPermissionsForRole(role);
}
function hasAdminPermission(roleOrUser, permission) {
    if (!permission)
        return true;
    const permissions = typeof roleOrUser === "string"
        ? getAdminPermissionsForRole(roleOrUser)
        : getAdminPermissionsForUser(roleOrUser);
    if (permissions.includes(permission)) {
        return true;
    }
    const legacyMappedPermissions = LEGACY_PERMISSION_MAP[String(permission)] || [];
    return legacyMappedPermissions.some((mappedPermission) => permissions.includes(mappedPermission));
}
function generateToken(payload) {
    const permissions = payload.accountType === "admin"
        ? getAdminPermissionsForUser(payload)
        : payload.permissions;
    return jsonwebtoken_1.default.sign({
        ...payload,
        role: payload.accountType === "admin"
            ? normalizeAdminRole(payload.role)
            : payload.role,
        permissions,
    }, getJwtSecret(), { expiresIn: "24h" });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, getJwtSecret());
}
function requireToken(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new errorHandler_1.AppError(401, "Authentication required");
    }
    const token = header.split(" ")[1];
    return verifyToken(token);
}
function isInactiveFlag(value) {
    return value === false || value === 0 || value === "0";
}
async function loadLiveAdminRow(decoded) {
    try {
        const result = await (0, db_1.queryDb)("SELECT `id`, `email`, `name`, `role`, `is_active`, `permissions_json` FROM `admin_users` WHERE `id` = ? LIMIT 1", [decoded.id]);
        const rows = Array.isArray(result) ? result : [];
        return rows[0] || null;
    }
    catch (error) {
        const message = String(error?.message || "").toLowerCase();
        if (error?.code !== "ER_BAD_FIELD_ERROR" && !message.includes("permissions_json")) {
            throw error;
        }
        const fallbackResult = await (0, db_1.queryDb)("SELECT `id`, `email`, `name`, `role`, `is_active` FROM `admin_users` WHERE `id` = ? LIMIT 1", [decoded.id]);
        const fallbackRows = Array.isArray(fallbackResult) ? fallbackResult : [];
        return fallbackRows[0] || null;
    }
}
async function loadLiveAdmin(decoded) {
    const row = await loadLiveAdminRow(decoded);
    if (!row) {
        throw new errorHandler_1.AppError(404, "Admin user not found");
    }
    if (isInactiveFlag(row.is_active)) {
        throw new errorHandler_1.AppError(403, "Admin account is inactive");
    }
    const role = normalizeAdminRole(String(row.role || decoded.role || "admin"));
    const permissions = getAdminPermissionsForUser({
        role,
        permissionsJson: row.permissions_json,
    });
    return {
        id: String(row.id || decoded.id),
        email: String(row.email || decoded.email),
        name: row.name === null || row.name === undefined ? decoded.name : String(row.name),
        role,
        accountType: "admin",
        permissions,
    };
}
async function requireAuth(req, _res, next) {
    try {
        const decoded = requireToken(req);
        if (decoded.accountType !== "admin") {
            throw new errorHandler_1.AppError(403, "Admin access required");
        }
        req.adminUser = await loadLiveAdmin(decoded);
        next();
    }
    catch (e) {
        if (e instanceof errorHandler_1.AppError)
            return next(e);
        next(new errorHandler_1.AppError(401, "Invalid or expired token"));
    }
}
function requireAdminPermission(permission) {
    return async function requirePermission(req, _res, next) {
        try {
            const decoded = req.adminUser || requireToken(req);
            if (decoded.accountType !== "admin") {
                throw new errorHandler_1.AppError(403, "Admin access required");
            }
            const liveAdmin = await loadLiveAdmin(decoded);
            if (!hasAdminPermission(liveAdmin, permission)) {
                throw new errorHandler_1.AppError(403, "You do not have permission to perform this admin action");
            }
            req.adminUser = liveAdmin;
            next();
        }
        catch (e) {
            if (e instanceof errorHandler_1.AppError)
                return next(e);
            next(new errorHandler_1.AppError(401, "Invalid or expired token"));
        }
    };
}
async function requireSuperAdmin(req, _res, next) {
    try {
        const decoded = req.adminUser || requireToken(req);
        if (decoded.accountType !== "admin") {
            throw new errorHandler_1.AppError(403, "Admin access required");
        }
        const liveAdmin = await loadLiveAdmin(decoded);
        if (!isSuperAdminRole(liveAdmin.role)) {
            throw new errorHandler_1.AppError(403, "Super admin access required");
        }
        req.adminUser = liveAdmin;
        next();
    }
    catch (e) {
        if (e instanceof errorHandler_1.AppError)
            return next(e);
        next(new errorHandler_1.AppError(401, "Invalid or expired token"));
    }
}
function requireCustomerAuth(req, _res, next) {
    try {
        const decoded = requireToken(req);
        if (decoded.accountType !== "customer") {
            throw new errorHandler_1.AppError(403, "Customer access required");
        }
        req.customerUser = decoded;
        next();
    }
    catch (e) {
        if (e instanceof errorHandler_1.AppError)
            return next(e);
        next(new errorHandler_1.AppError(401, "Invalid or expired token"));
    }
}
//# sourceMappingURL=auth.js.map