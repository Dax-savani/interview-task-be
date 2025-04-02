import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later." },
    headers: true,
    keyGenerator: (req) => req.user?.userId || req.ip, // Limit based on user ID or IP
});
