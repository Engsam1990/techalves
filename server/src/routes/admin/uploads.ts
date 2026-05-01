// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdminPermission } from "../../middleware/auth";
import { saveBase64Upload } from "../../utils/uploads";

const router = Router();
router.use(requireAuth);
router.use(requireAdminPermission("uploads:manage"));

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  data: z.string().min(20),
});

router.post("/", async (req, res, next) => {
  try {
    const payload = uploadSchema.parse(req.body ?? {});
    const result = saveBase64Upload(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
