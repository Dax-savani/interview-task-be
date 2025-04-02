import { Request, Response, NextFunction } from "express";

// Middleware for handling 404 errors (route not found)
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({ error: "Route doesn't exist" });
};

// Middleware for handling errors globally
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
};
