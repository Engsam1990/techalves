"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class AppError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        err.errors.forEach((e) => {
            const path = e.path.join(".");
            if (!errors[path])
                errors[path] = [];
            errors[path].push(e.message);
        });
        return res.status(400).json({ status: 400, message: "Validation error", errors });
    }
    if (err instanceof AppError) {
        return res.status(err.status).json({ status: err.status, message: err.message });
    }
    logger_1.logger.error(err, "Unhandled error");
    res.status(500).json({ status: 500, message: "Internal server error" });
}
//# sourceMappingURL=errorHandler.js.map