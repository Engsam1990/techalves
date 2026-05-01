"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middleware/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const db_1 = require("../../lib/db");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireAdminPermission)("blog:view"));
const blogBaseSchema = zod_1.z.object({
    slug: zod_1.z.string().min(2).max(200),
    title: zod_1.z.string().min(3).max(200),
    excerpt: zod_1.z.string().min(10),
    contentHtml: zod_1.z.string().min(20),
    imageUrl: zod_1.z.string().max(1000).optional().or(zod_1.z.literal("")).nullable(),
    author: zod_1.z.string().optional().nullable(),
    category: zod_1.z.string().optional().nullable(),
    readTime: zod_1.z.string().optional().nullable(),
    publishedAt: zod_1.z.string().datetime().optional(),
    isPublished: zod_1.z.boolean().default(true),
});
const blogCreateSchema = blogBaseSchema;
const blogUpdateSchema = blogBaseSchema.partial();
function normalizePostInput(data) {
    return {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        contentHtml: data.contentHtml,
        imageUrl: data.imageUrl || null,
        author: data.author || null,
        category: data.category || null,
        readTime: data.readTime || null,
        publishedAt: data.publishedAt || (0, db_1.nowIso)(),
        isPublished: data.isPublished ?? true,
    };
}
function formatPost(post) {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        contentHtml: post.contentHtml,
        imageUrl: post.imageUrl,
        author: post.author,
        category: post.category,
        readTime: post.readTime,
        isPublished: post.isPublished,
        publishedAt: post.publishedAt,
    };
}
router.get("/", async (_req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        res.json((0, db_1.sortByDateDesc)(db.blogPosts, "publishedAt").map(formatPost));
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const post = db.blogPosts.find((item) => item.id === String(req.params.id));
        if (!post)
            throw new errorHandler_1.AppError(404, "Blog post not found");
        res.json(formatPost(post));
    }
    catch (e) {
        next(e);
    }
});
router.post("/", (0, auth_1.requireAdminPermission)("blog:manage"), async (req, res, next) => {
    try {
        const data = blogCreateSchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const post = { id: (0, db_1.createId)(), ...normalizePostInput(data) };
        db.blogPosts.push(post);
        await (0, db_1.writeDb)(db);
        res.status(201).json(formatPost(post));
    }
    catch (e) {
        next(e);
    }
});
router.put("/:id", (0, auth_1.requireAdminPermission)("blog:manage"), async (req, res, next) => {
    try {
        const patch = blogUpdateSchema.parse(req.body ?? {});
        const db = await (0, db_1.readDb)();
        const post = db.blogPosts.find((item) => item.id === String(req.params.id));
        if (!post)
            throw new errorHandler_1.AppError(404, "Blog post not found");
        const merged = blogCreateSchema.parse({
            slug: patch.slug ?? post.slug,
            title: patch.title ?? post.title,
            excerpt: patch.excerpt ?? post.excerpt,
            contentHtml: patch.contentHtml ?? post.contentHtml,
            imageUrl: patch.imageUrl ?? post.imageUrl ?? "",
            author: patch.author ?? post.author ?? "",
            category: patch.category ?? post.category ?? "",
            readTime: patch.readTime ?? post.readTime ?? "",
            publishedAt: patch.publishedAt ?? post.publishedAt,
            isPublished: patch.isPublished ?? post.isPublished,
        });
        Object.assign(post, normalizePostInput(merged));
        await (0, db_1.writeDb)(db);
        res.json(formatPost(post));
    }
    catch (e) {
        next(e);
    }
});
router.delete("/:id", (0, auth_1.requireAdminPermission)("blog:manage"), async (req, res, next) => {
    try {
        const db = await (0, db_1.readDb)();
        const exists = db.blogPosts.some((item) => item.id === String(req.params.id));
        if (!exists)
            throw new errorHandler_1.AppError(404, "Blog post not found");
        await (0, db_1.executeDb)("DELETE FROM `blog_posts` WHERE `id` = ?", [String(req.params.id)]);
        res.json({ message: "Blog post deleted" });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=blog.js.map