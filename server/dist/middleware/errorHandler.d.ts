import { Request, Response, NextFunction } from "express";
export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}
export declare class AppError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map