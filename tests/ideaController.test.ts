import request from "supertest";
import {app, server} from "../index";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }
    await mongoose.connect(process.env.MONGO_URI);

    // Ensure IP filtering does not block test requests
    process.env.NODE_ENV = "test";
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close(); // Close the Express server
});


describe("Idea Controller API", () => {
    let token: string;

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "johndoe@example.com",
            password: "123456",
        });

        token = res.body.token;
    });

    test("Should create an idea (Success case)", async () => {
        const res = await request(app)
            .post("/api/ideas")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Test Idea", description: "This is a test idea" });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("title", "Test Idea");
    });

    test("Should reject unauthorized user (Security check)", async () => {
        const res = await request(app)
            .post("/api/ideas")
            .send({ title: "Test Idea", description: "This is a test idea" });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/Missing or invalid token|Unauthorized/);
    });

    test("Should reject unauthorized access to admin endpoint (Failure case)", async () => {
        const res = await request(app)
            .get("/api/admin/ideas")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/Insufficient permissions|Access Denied/);
    });
});
