import express from "express";
import { IpFilter, IpDeniedError } from "express-ipfilter";
import { Request, Response, NextFunction } from "express";

const app = express();

app.set("trust proxy", true);

// List of allowed or blocked IPs
const WHITELISTED_IPS = ["192.168.1.100", "203.0.113.5","127.0.0.1", "::ffff:127.0.0.1"]; // Example IPs
const BLACKLISTED_IPS = ["123.456.789.0", "111.222.333.444"]; // Example blocked IPs

// Function to get the client's IP safely
const detectClientIp = (req: Request): string => {
    return req.ip || req.connection.remoteAddress || "unknown"; // Ensure a string is always returned
};

export const ipWhitelist = IpFilter(WHITELISTED_IPS, {
    mode: "allow",
    detectIp: detectClientIp, // Use the fixed function
});

export const ipBlacklist = IpFilter(BLACKLISTED_IPS, {
    mode: "deny",
    detectIp: detectClientIp, // Use the fixed function
});

// Custom Error Handling
export const ipErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof IpDeniedError) {
        res.status(403).json({ message: "Access Denied: Your IP is not allowed." });
    } else {
        next(err);
    }
};
