"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const loadEnv_1 = require("./lib/loadEnv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_1 = require("./utils/logger");
const swagger_1 = require("./utils/swagger");
const uploads_1 = require("./utils/uploads");
const errorHandler_1 = require("./middleware/errorHandler");
const categories_1 = __importDefault(require("./routes/categories"));
const products_1 = __importDefault(require("./routes/products"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const blog_1 = __importDefault(require("./routes/blog"));
const contact_1 = __importDefault(require("./routes/contact"));
const newsletter_1 = __importDefault(require("./routes/newsletter"));
const auth_1 = __importDefault(require("./routes/auth"));
const customer_auth_1 = __importDefault(require("./routes/customer-auth"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const products_2 = __importDefault(require("./routes/admin/products"));
const orders_2 = __importDefault(require("./routes/admin/orders"));
const pos_1 = __importDefault(require("./routes/admin/pos"));
const expenses_1 = __importDefault(require("./routes/admin/expenses"));
const sources_1 = __importDefault(require("./routes/admin/sources"));
const analytics_1 = __importDefault(require("./routes/admin/analytics"));
const categories_2 = __importDefault(require("./routes/admin/categories"));
const catalog_1 = __importDefault(require("./routes/admin/catalog"));
const blog_2 = __importDefault(require("./routes/admin/blog"));
const contact_messages_1 = __importDefault(require("./routes/admin/contact-messages"));
const newsletter_2 = __importDefault(require("./routes/admin/newsletter"));
const customers_1 = __importDefault(require("./routes/admin/customers"));
const admin_users_1 = __importDefault(require("./routes/admin/admin-users"));
const uploads_2 = __importDefault(require("./routes/admin/uploads"));
const database_migrations_1 = __importDefault(require("./routes/admin/database-migrations"));
const analytics_2 = __importDefault(require("./routes/analytics"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
function resolveFrontendDist() {
    const candidates = [
        process.env.FRONTEND_DIST_DIR,
        path_1.default.resolve(process.cwd(), "dist"),
        path_1.default.resolve(process.cwd(), "../dist"),
        path_1.default.resolve(__dirname, "../../dist"),
        path_1.default.resolve(__dirname, "../../../dist"),
    ].filter(Boolean);
    for (const candidate of candidates) {
        const indexFile = path_1.default.join(candidate, "index.html");
        const assetsDir = path_1.default.join(candidate, "assets");
        if (fs_1.default.existsSync(indexFile) && fs_1.default.existsSync(assetsDir)) {
            return candidate;
        }
    }
    return null;
}
function normalizeOrigin(origin) {
    if (!origin)
        return "";
    return origin.trim().replace(/\/$/, "");
}
if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET is not configured");
const defaultOrigins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];
const allowedOrigins = new Set((process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : defaultOrigins)
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean));
const frontendDist = resolveFrontendDist();
app.set("trust proxy", 1);
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "base-uri": ["'self'"],
            "font-src": ["'self'", "data:", "https:", "https://fonts.gstatic.com"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'self'"],
            "img-src": ["'self'", "data:", "blob:", "https://images.unsplash.com"],
            "media-src": ["'self'", "data:", "blob:"],
            "object-src": ["'none'"],
            "script-src": ["'self'"],
            "script-src-attr": ["'none'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "style-src-elem": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "upgrade-insecure-requests": [],
        },
    },
}));
app.use(express_1.default.json({ limit: "12mb" }));
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
const apiCors = (0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.has(normalizedOrigin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
});
app.use("/api", apiCors);
app.use("/api/categories", categories_1.default);
app.use("/api/products", products_1.default);
app.use("/api/reviews", reviews_1.default);
app.use("/api/blog", blog_1.default);
app.use("/api/contact", contact_1.default);
app.use("/api/newsletter", newsletter_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/customer-auth", customer_auth_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/analytics", analytics_2.default);
app.use("/api/admin/products", products_2.default);
app.use("/api/admin/orders", orders_2.default);
app.use("/api/admin/pos", pos_1.default);
app.use("/api/admin/expenses", expenses_1.default);
app.use("/api/admin/sources", sources_1.default);
app.use("/api/admin/analytics", analytics_1.default);
app.use("/api/admin/categories", categories_2.default);
app.use("/api/admin/catalog", catalog_1.default);
app.use("/api/admin/blog", blog_2.default);
app.use("/api/admin/contact-messages", contact_messages_1.default);
app.use("/api/admin/newsletter", newsletter_2.default);
app.use("/api/admin/customers", customers_1.default);
app.use("/api/admin/admin-users", admin_users_1.default);
app.use("/api/admin/uploads", uploads_2.default);
app.use("/api/admin/database-migrations", database_migrations_1.default);
app.get("/api/health", (_req, res) => res.json({ status: "ok", storage: "mysql", frontendDist }));
app.use("/uploads", express_1.default.static((0, uploads_1.resolveUploadsDir)(), {
    index: false,
    redirect: false,
}));
if (frontendDist) {
    app.use("/assets", express_1.default.static(path_1.default.join(frontendDist, "assets"), {
        immutable: true,
        maxAge: "1y",
        index: false,
        redirect: false,
    }));
    app.use(express_1.default.static(frontendDist, {
        index: false,
        redirect: false,
    }));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api"))
            return next();
        if (path_1.default.extname(req.path)) {
            return res.status(404).type("text/plain").send("Not found");
        }
        res.sendFile(path_1.default.join(frontendDist, "index.html"));
    });
}
else {
    logger_1.logger.warn("Frontend dist folder was not found. Static assets are disabled.");
}
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    logger_1.logger.info(`TECHALVES API running on http://localhost:${PORT}`);
    logger_1.logger.info(`Swagger docs at http://localhost:${PORT}/docs`);
    logger_1.logger.info(`Active env file: ${(0, loadEnv_1.getLoadedEnvFile)() || "process environment"}`);
    logger_1.logger.info(`Database config: ${process.env.DB_USER || "unknown"}@${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "unset"}`);
    if (frontendDist) {
        logger_1.logger.info(`Serving frontend from ${frontendDist}`);
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map