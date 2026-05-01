// @ts-nocheck
import { Router } from "express";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { readDb, contains, sortByDateDesc } from "../../lib/db";
const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("customers:view"));
router.get("/", async (req, res, next) => { try { const q = String(req.query.q || "").trim(); const db = await readDb(); const customers = sortByDateDesc(db.customerUsers).filter((item) => !q || [item.fullName, item.email, item.phone].some((value) => contains(value, q))); res.json(customers.map((customer) => { const orders = sortByDateDesc(db.orders.filter((order) => order.customerId === customer.id)); return { id: customer.id, fullName: customer.fullName, email: customer.email, phone: customer.phone, isActive: customer.isActive, createdAt: customer.createdAt, orderCount: orders.length, lastOrder: orders[0] ? { totalAmount: orders[0].totalAmount, createdAt: orders[0].createdAt } : null }; })); } catch (e) { next(e); } });
router.get("/:id", async (req, res, next) => { try { const db = await readDb(); const customer = db.customerUsers.find((item) => item.id === String(req.params.id)); if (!customer) throw new AppError(404, "Customer not found"); const orders = sortByDateDesc(db.orders.filter((order) => order.customerId === customer.id)).map((order) => ({ ...order, items: (order.items || []).map((item) => { const product = db.products.find((product) => product.id === item.productId); return { ...item, product: product ? { id: product.id, name: product.name, slug: product.slug } : undefined }; }) })); res.json({ id: customer.id, fullName: customer.fullName, email: customer.email, phone: customer.phone, isActive: customer.isActive, createdAt: customer.createdAt, updatedAt: customer.updatedAt, orders }); } catch (e) { next(e); } });
export default router;
