import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import ideaRoutes from "./routes/idea";
import {errorHandler, notFoundHandler} from "./middleware/errorHandler";
import authMiddleware from "./middleware/authMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to IdeaHub API!');
});

app.use("/v1/auth", authRoutes);
app.use("/v1/ideas", authMiddleware,ideaRoutes);

app.use("/", notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});