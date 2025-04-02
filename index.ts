import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import ideaRoutes from "./routes/idea";
import adminRoutes from "./routes/adminRoutes";
import {errorHandler, notFoundHandler} from "./middleware/errorHandler";
import authMiddleware from "./middleware/authMiddleware";
import {isAdmin} from "./middleware/isAdmin";
import {rateLimiter} from "./middleware/rateLimit";
import {ipBlacklist, ipErrorHandler, ipWhitelist} from "./middleware/ipFilter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "development") {
    console.log("Development mode: All IPs are allowed.");
} else {
    app.use(ipBlacklist);
    app.use(ipWhitelist);
    app.use(ipErrorHandler);
}

app.use(cors());
app.use(express.json());

connectDB();

app.use(rateLimiter);

app.get('/', (req, res) => {
    res.send('Welcome to IdeaHub API!');
});

app.use("/v1/auth", authRoutes);
app.use("/v1/ideas", authMiddleware,ideaRoutes);
app.use("/v1/admin", authMiddleware,isAdmin,adminRoutes);

app.use("/", notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { server,app };