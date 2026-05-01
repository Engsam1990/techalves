"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
function formatPost(post) { return { id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt, content: post.contentHtml, image: post.imageUrl, author: post.author, date: String(post.publishedAt || "").split("T")[0], category: post.category, readTime: post.readTime }; }
router.get("/", async (_req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const posts = (0, db_1.sortByDateDesc)(db.blogPosts.filter((item) => item.isPublished !== false), "publishedAt");
    res.json(posts.map(formatPost));
}
catch (e) {
    next(e);
} });
router.get("/:slug", async (req, res, next) => { try {
    const db = await (0, db_1.readDb)();
    const post = db.blogPosts.find((item) => item.slug === String(req.params.slug) && item.isPublished !== false);
    if (!post)
        throw new errorHandler_1.AppError(404, "Blog post not found");
    res.json(formatPost(post));
}
catch (e) {
    next(e);
} });
exports.default = router;
//# sourceMappingURL=blog.js.map