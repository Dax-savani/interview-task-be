import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();


const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};


const errorResponse = (res: Response, statusCode: number, message: string) => {
    res.status(statusCode).json({ error: message });
};


export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return errorResponse(res, 400, "All fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 400, "Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: "User registered", userId: user.id });
    } catch (err) {
        errorResponse(res, 500, "Internal server error");
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return errorResponse(res, 400, "Email and password are required");
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return errorResponse(res, 401, "Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse(res, 401, "Invalid email or password");
        }

        const tokens = generateTokens(user.id);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        const userWithoutPassword = await User.findById(user._id).select("-password");

        res.json({ user: userWithoutPassword, tokens });
    } catch (err) {
        errorResponse(res, 500, "Internal server error");
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return errorResponse(res, 401, "Refresh token required");
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return errorResponse(res, 403, "Invalid refresh token");
        }

        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!,
            (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
                if (err) {
                    return errorResponse(res, 403, "Invalid refresh token");
                }

                if (typeof decoded === "string" || !decoded) {
                    return errorResponse(res, 400, "Invalid token payload");
                }



                const accessToken = jwt.sign(
                    { userId: decoded.userId },
                    process.env.JWT_SECRET!,
                    { expiresIn: "15m" }
                );

                res.json({ accessToken, refreshToken });
            }
        );
    } catch (err) {
        errorResponse(res, 500, "Internal server error");
    }
};
