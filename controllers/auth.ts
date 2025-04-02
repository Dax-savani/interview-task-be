import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, {JwtPayload, VerifyErrors} from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Tokens
const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!);
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!);
    return { accessToken, refreshToken };
};

// ✅ Register User
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: "User registered", userId: user.id });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }

        const tokens = generateTokens(user.id);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        // Fetch user again without the password field
        const userWithoutPassword = await User.findById(user._id).select("-password");

        res.json({
            user: userWithoutPassword,
            tokens
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};


// ✅ Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: "Refresh token required" });
            return;
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.status(403).json({ error: "Invalid refresh token" });
            return;
        }

        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!,
            (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid refresh token" });
                }

                if (typeof decoded === "string" || !decoded) {
                    return res.status(400).json({ message: "Invalid token payload" });
                }

                const tokens = generateTokens(decoded.userId);
                res.json(tokens);
            }
        );
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};
