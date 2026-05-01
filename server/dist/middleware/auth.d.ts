import { Request, Response, NextFunction } from "express";
export type AuthRole = "admin" | "customer";
export type AdminRole = "admin" | "super_admin";
export type AdminPermission = "dashboard:view" | "products:view" | "products:create" | "products:edit" | "products:edit_basic" | "products:edit_serials" | "products:edit_pricing_stock" | "products:edit_sources" | "products:edit_images" | "products:toggle_featured" | "products:toggle_premium" | "products:delete" | "products:archive" | "inventory:view" | "inventory:receive_stock" | "inventory:adjust" | "pos:use" | "orders:view" | "orders:update_status" | "orders:record_payment" | "orders:refund" | "orders:return_items" | "finance:view" | "finance:export" | "expenses:view" | "expenses:create" | "expenses:edit" | "expenses:void" | "sources:view" | "sources:manage" | "sourcing_payments:view" | "sourcing_payments:update" | "catalog:view" | "catalog:manage" | "blog:view" | "blog:manage" | "messages:view" | "messages:manage" | "newsletter:view" | "newsletter:manage" | "customers:view" | "customers:manage" | "analytics:view" | "uploads:manage" | "admin_users:manage" | "super_admin:view" | "products:manage" | "inventory:manage" | "pos:manage" | "orders:manage" | "expenses:manage";
export declare const ADMIN_PERMISSION_DEFINITIONS: Array<{
    key: AdminPermission;
    label: string;
    group: string;
    description: string;
}>;
export declare const ALL_ADMIN_PERMISSIONS: AdminPermission[];
export interface TokenPayload {
    id: string;
    email: string;
    role: string;
    accountType: AuthRole;
    name?: string;
    permissions?: AdminPermission[];
    permissionsJson?: unknown;
}
export interface AuthRequest extends Request {
    adminUser?: TokenPayload;
    customerUser?: TokenPayload;
}
export declare function normalizeAdminRole(role?: string | null): AdminRole;
export declare function isSuperAdminRole(role?: string | null): boolean;
export declare function normalizeAdminPermissions(input?: unknown, role?: string | null): AdminPermission[];
export declare function getAdminPermissionsForRole(role?: string | null): AdminPermission[];
export declare function getAdminPermissionsForUser(user?: {
    role?: string | null;
    permissions?: unknown;
    permissionsJson?: unknown;
} | null): AdminPermission[];
export declare function hasAdminPermission(roleOrUser?: string | {
    role?: string | null;
    permissions?: unknown;
    permissionsJson?: unknown;
} | null, permission?: AdminPermission | string | null): boolean;
export declare function generateToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload;
export declare function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void>;
export declare function requireAdminPermission(permission: AdminPermission): (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare function requireSuperAdmin(req: AuthRequest, _res: Response, next: NextFunction): Promise<void>;
export declare function requireCustomerAuth(req: AuthRequest, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map