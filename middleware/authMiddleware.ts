import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';

declare module 'express' {
    interface Request {
        user?: any;
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "No token, authorization denied" });
        return;
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

export default authMiddleware;
