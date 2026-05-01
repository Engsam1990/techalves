import { apiClient, apiPost } from "./client";

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function adminGet<T>(endpoint: string, params?: Record<string, string | number | undefined>) {
  return apiClient<T>(endpoint, { headers: authHeaders(), params });
}

function adminPost<T>(endpoint: string, body: unknown) {
  return apiClient<T>(endpoint, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

function adminPut<T>(endpoint: string, body: unknown) {
  return apiClient<T>(endpoint, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

function adminPatch<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function adminDelete<T>(endpoint: string) {
  return apiClient<T>(endpoint, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export const adminApi = {
  getProducts: (params?: Record<string, string | number | undefined>) => adminGet<any[]>("/admin/products", params),
  getProduct: (id: string) => adminGet<any>(`/admin/products/${id}`),
  createProduct: (data: any) => adminPost<any>("/admin/products", data),
  updateProduct: (id: string, data: any) => adminPut<any>(`/admin/products/${id}`, data),
  updateProductSection: (id: string, section: string, data: any) => adminPatch<any>(`/admin/products/${id}/sections/${section}`, data),
  receiveProductStock: (id: string, data: any) => adminPost<any>(`/admin/products/${id}/receive-stock`, data),
  deleteProduct: (id: string) => adminDelete<any>(`/admin/products/${id}`),
  toggleFeatured: (id: string) => adminPatch<any>(`/admin/products/${id}/toggle-featured`),
  togglePremium: (id: string) => adminPatch<any>(`/admin/products/${id}/toggle-premium`),
  toggleStock: (id: string) => adminPatch<any>(`/admin/products/${id}/toggle-stock`),
  getSourcingPayments: (status?: string) => adminGet<any[]>("/admin/products/sourcing/payments", { status: status || "pay_later" }),
  markSourcingPayment: (id: string, data: { paymentStatus?: "paid" | "pay_later" } = { paymentStatus: "paid" }) => adminPatch<any>(`/admin/products/${id}/sourcing-payment`, data),

  getOverview: () => adminGet<any>("/admin/analytics/overview"),
  getFinanceReport: (params?: Record<string, string | number | undefined>) => adminGet<any>("/admin/analytics/finance-report", params),
  getInventoryReport: (params?: Record<string, string | number | undefined>) => adminGet<any>("/admin/analytics/inventory-report", params),
  getProductAnalytics: (days?: number) => adminGet<any[]>("/admin/analytics/products", { days }),
  getTimeline: (days?: number) => adminGet<any[]>("/admin/analytics/timeline", { days }),

  getCategories: () => adminGet<any[]>("/admin/categories"),
  getCategory: (id: string) => adminGet<any>(`/admin/categories/${id}`),
  createCategory: (data: any) => adminPost<any>("/admin/categories", data),
  updateCategory: (id: string, data: any) => adminPut<any>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => adminDelete<any>(`/admin/categories/${id}`),

  getCatalog: () => adminGet<any>("/admin/catalog"),
  createSubcategory: (data: any) => adminPost<any>("/admin/catalog/subcategories", data),
  updateSubcategory: (id: string, data: any) => adminPut<any>(`/admin/catalog/subcategories/${id}`, data),
  deleteSubcategory: (id: string) => adminDelete<any>(`/admin/catalog/subcategories/${id}`),
  createBrand: (data: any) => adminPost<any>("/admin/catalog/brands", data),
  updateBrand: (id: string, data: any) => adminPut<any>(`/admin/catalog/brands/${id}`, data),
  deleteBrand: (id: string) => adminDelete<any>(`/admin/catalog/brands/${id}`),
  createSpecification: (data: any) => adminPost<any>("/admin/catalog/specifications", data),
  updateSpecification: (id: string, data: any) => adminPut<any>(`/admin/catalog/specifications/${id}`, data),
  deleteSpecification: (id: string) => adminDelete<any>(`/admin/catalog/specifications/${id}`),

  uploadImage: (data: { filename: string; contentType: string; data: string }) => adminPost<{ url: string }>("/admin/uploads", data),

  getBlogPosts: () => adminGet<any[]>("/admin/blog"),
  getBlogPost: (id: string) => adminGet<any>(`/admin/blog/${id}`),
  createBlogPost: (data: any) => adminPost<any>("/admin/blog", data),
  updateBlogPost: (id: string, data: any) => adminPut<any>(`/admin/blog/${id}`, data),
  deleteBlogPost: (id: string) => adminDelete<any>(`/admin/blog/${id}`),

  getContactMessages: (params?: Record<string, string | number | undefined>) => adminGet<any[]>("/admin/contact-messages", params),
  updateContactMessageStatus: (id: string, status: string) => adminPatch<any>(`/admin/contact-messages/${id}`, { status }),
  deleteContactMessage: (id: string) => adminDelete<any>(`/admin/contact-messages/${id}`),

  getNewsletterSubscribers: (params?: Record<string, string | number | undefined>) => adminGet<any[]>("/admin/newsletter", params),
  deleteNewsletterSubscriber: (id: string) => adminDelete<any>(`/admin/newsletter/${id}`),

  getOrders: (params?: Record<string, string | number | undefined>) => adminGet<any>("/admin/orders", params),
  getOrder: (id: string) => adminGet<any>(`/admin/orders/${id}`),
  updateOrder: (id: string, data: any) => adminPatch<any>(`/admin/orders/${id}`, data),
  addOrderPaymentEvent: (id: string, data: any) => adminPost<any>(`/admin/orders/${id}/payment-events`, data),
  processOrderReturn: (id: string, data: any) => adminPost<any>(`/admin/orders/${id}/returns`, data),
  createPosSale: (data: any) => adminPost<any>("/admin/pos/checkout", data),
  getSources: (params?: Record<string, string | number | undefined>) => adminGet<any[]>("/admin/sources", params),
  createSource: (data: any) => adminPost<any>("/admin/sources", data),
  updateSource: (id: string, data: any) => adminPut<any>(`/admin/sources/${id}`, data),
  deleteSource: (id: string) => adminDelete<any>(`/admin/sources/${id}`),
  getExpenseCategories: () => adminGet<any[]>("/admin/expenses/categories"),
  getExpenses: () => adminGet<any[]>("/admin/expenses"),
  createExpense: (data: any) => adminPost<any>("/admin/expenses", data),
  updateExpense: (id: string, data: any) => adminPut<any>(`/admin/expenses/${id}`, data),
  voidExpense: (id: string, reason?: string) => adminPatch<any>(`/admin/expenses/${id}/void`, { reason: reason || "Voided from admin expenses panel" }),
  deleteExpense: (id: string) => adminDelete<any>(`/admin/expenses/${id}`),

  getCustomers: (params?: Record<string, string | number | undefined>) => adminGet<any[]>("/admin/customers", params),
  getCustomer: (id: string) => adminGet<any>(`/admin/customers/${id}`),

  getAdminUsersOverview: () => adminGet<any>("/admin/admin-users/overview"),
  getAdminUsers: (params?: Record<string, string | number | undefined>) => adminGet<any>("/admin/admin-users", params),
  getAdminPermissionDefinitions: () => adminGet<any>("/admin/admin-users/permissions"),
  getAdminActivityLogs: (params?: Record<string, string | number | undefined>) => adminGet<any>("/admin/admin-users/activity", params),
  createAdminUser: (data: any) => adminPost<any>("/admin/admin-users", data),
  promoteCustomerToAdmin: (data: { customerId: string; role: "admin" | "super_admin"; permissions?: string[] }) => adminPost<any>("/admin/admin-users/promote-customer", data),
  updateAdminUser: (id: string, data: any) => adminPatch<any>(`/admin/admin-users/${id}`, data),
    resetAdminUserPassword: (id: string, data: { newPassword: string }) => adminPost<any>(`/admin/admin-users/${id}/reset-password`, data),
  deleteAdminUser: (id: string) => adminDelete<any>(`/admin/admin-users/${id}`),
  getDatabaseMigrations: () => adminGet<any>("/admin/database-migrations"),
  runDatabaseMigrations: (id?: string) => adminPost<any>("/admin/database-migrations/run", id ? { id } : {}),
  
    trackEvent: (productId: string, event: string, metadata?: any) => apiPost<any>("/analytics/track", { productId, event, metadata }),
  };
