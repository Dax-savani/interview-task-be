import { NextFunction, Request, Response } from "express";
import User from "../models/User";

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ message: "Forbidden: Admin access required" });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
