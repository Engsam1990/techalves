 // @ts-nocheck
import { getLoadedEnvFile } from "./lib/loadEnv";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { logger } from "./utils/logger";
import { swaggerSpec } from "./utils/swagger";
import { resolveUploadsDir } from "./utils/uploads";
import { errorHandler } from "./middleware/errorHandler";
import categoriesRouter from "./routes/categories";
import productsRouter from "./routes/products";
import reviewsRouter from "./routes/reviews";
import blogRouter from "./routes/blog";
import contactRouter from "./routes/contact";
import newsletterRouter from "./routes/newsletter";
import authRouter from "./routes/auth";
import customerAuthRouter from "./routes/customer-auth";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import adminProductsRouter from "./routes/admin/products";
import adminOrdersRouter from "./routes/admin/orders";
import adminPosRouter from "./routes/admin/pos";
import adminExpensesRouter from "./routes/admin/expenses";
import adminSourcesRouter from "./routes/admin/sources";
import adminAnalyticsRouter from "./routes/admin/analytics";
import adminCategoriesRouter from "./routes/admin/categories";
import adminCatalogRouter from "./routes/admin/catalog";
import adminBlogRouter from "./routes/admin/blog";
import adminContactMessagesRouter from "./routes/admin/contact-messages";
import adminNewsletterRouter from "./routes/admin/newsletter";
import adminCustomersRouter from "./routes/admin/customers";
import adminAdminUsersRouter from "./routes/admin/admin-users";
import adminUploadsRouter from "./routes/admin/uploads";
import adminDatabaseMigrationsRouter from "./routes/admin/database-migrations";
import analyticsRouter from "./routes/analytics";

const app = express();
const PORT = process.env.PORT || 4000;

function resolveFrontendDist() {
  const candidates = [
    process.env.FRONTEND_DIST_DIR,
    path.resolve(process.cwd(), "dist"),
    path.resolve(process.cwd(), "../dist"),
    path.resolve(__dirname, "../../dist"),
    path.resolve(__dirname, "../../../dist"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const indexFile = path.join(candidate, "index.html");
    const assetsDir = path.join(candidate, "assets");
    if (fs.existsSync(indexFile) && fs.existsSync(assetsDir)) {
      return candidate;
    }
  }

  return null;
}

function normalizeOrigin(origin?: string | null) {
  if (!origin) return "";
  return origin.trim().replace(/\/$/, "");
}

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");

const defaultOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : defaultOrigins
  )
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)
);

const frontendDist = resolveFrontendDist();

app.set("trust proxy", 1);
app.use(
  helmet({
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
  })
);

app.use(express.json({ limit: "12mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const apiCors = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
});

app.use("/api", apiCors);

app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/contact", contactRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/auth", authRouter);
app.use("/api/customer-auth", customerAuthRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/pos", adminPosRouter);
app.use("/api/admin/expenses", adminExpensesRouter);
app.use("/api/admin/sources", adminSourcesRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/categories", adminCategoriesRouter);
app.use("/api/admin/catalog", adminCatalogRouter);
app.use("/api/admin/blog", adminBlogRouter);
app.use("/api/admin/contact-messages", adminContactMessagesRouter);
app.use("/api/admin/newsletter", adminNewsletterRouter);
app.use("/api/admin/customers", adminCustomersRouter);
app.use("/api/admin/admin-users", adminAdminUsersRouter);
app.use("/api/admin/uploads", adminUploadsRouter);
app.use("/api/admin/database-migrations", adminDatabaseMigrationsRouter);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", storage: "mysql", frontendDist })
);

app.use("/uploads", express.static(resolveUploadsDir(), {
  index: false,
  redirect: false,
}));

if (frontendDist) {
  app.use(
    "/assets",
    express.static(path.join(frontendDist, "assets"), {
      immutable: true,
      maxAge: "1y",
      index: false,
      redirect: false,
    })
  );

  app.use(
    express.static(frontendDist, {
      index: false,
      redirect: false,
    })
  );

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();

    if (path.extname(req.path)) {
      return res.status(404).type("text/plain").send("Not found");
    }

    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  logger.warn("Frontend dist folder was not found. Static assets are disabled.");
}

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`TECHALVES API running on http://localhost:${PORT}`);
  logger.info(`Swagger docs at http://localhost:${PORT}/docs`);
  logger.info(`Active env file: ${getLoadedEnvFile() || "process environment"}`);
  logger.info(
    `Database config: ${process.env.DB_USER || "unknown"}@${process.env.DB_HOST || "127.0.0.1"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "unset"}`
  );
  if (frontendDist) {
    logger.info(`Serving frontend from ${frontendDist}`);
  }
});

export default app;
