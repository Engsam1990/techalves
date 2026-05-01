import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });
    return res.status(400).json({ status: 400, message: "Validation error", errors });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ status: err.status, message: err.message });
  }

  logger.error(err, "Unhandled error");
  res.status(500).json({ status: 500, message: "Internal server error" });
}
