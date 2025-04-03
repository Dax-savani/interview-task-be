import { NextFunction, Request, Response } from "express";
import Idea from "../models/Idea";
import mongoose from "mongoose";

// Helper function for sending error responses
const errorResponse = (res: Response, statusCode: number, message: string) => {
    res.status(statusCode).json({ error: message });
};

// Create a new idea
export const createIdea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, description } = req.body;
        const user_id = req.user.userId;

        if (!title || !description) {
            return errorResponse(res, 400, "Title and description are required");
        }

        const newIdea = new Idea({ title, description, user_id });
        const savedIdea = await newIdea.save();
        res.status(201).json(savedIdea);
    } catch (error) {
        next(error);
    }
};

// Get all ideas
export const getIdeas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        const ideas = await Idea.find({ status: "approved" })
            .sort({ votes: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .select("_id title description votes comments")
            .lean(); // Convert MongoDB documents to plain objects

        // Add vote count for each idea
        const updatedIdeas = ideas.map(idea => ({
            ...idea,
            upvotes: idea.votes.filter((vote: any) => vote.voteType === "up").length,
            downvotes: idea.votes.filter((vote: any) => vote.voteType === "down").length
        }));

        const total = await Idea.countDocuments({ status: "approved" });

        res.status(200).json({ ideas: updatedIdeas, total });
    } catch (error) {
        next(error);
    }
};


// Get a single idea by ID
export const getIdeaById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 400, "Invalid idea ID");
        }

        const idea = await Idea.findById(req.params.id).populate("user_id", "username email");
        if (!idea) {
            return errorResponse(res, 404, "Idea not found");
        }
        res.status(200).json(idea);
    } catch (error) {
        next(error);
    }
};

// Update an idea
export const updateIdea = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 400, "Invalid idea ID");
        }

        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            return errorResponse(res, 404, "Idea not found");
        }

        const updatedIdea = await Idea.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedIdea);
    } catch (error) {
        next(error);
    }
};

// Delete an idea
export const deleteIdea = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return errorResponse(res, 400, "Invalid idea ID");
        }

        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            return errorResponse(res, 404, "Idea not found");
        }

        await Idea.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Idea deleted successfully" });
    } catch (error) {
        next(error);
    }
};
// Vote for an idea
export const voteIdea = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) return errorResponse(res, 401, "Missing or invalid token");
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return errorResponse(res, 400, "Invalid idea ID");

        const { voteType } = req.body;
        if (!voteType) return errorResponse(res, 400, "Invalid input");

        const userId = req.user.userId;
        const idea = await Idea.findById(req.params.id);
        if (!idea) return errorResponse(res, 404, "Idea not found");

        const existingVoteIndex = idea.votes.findIndex(vote => vote.user_id.toString() === userId);
        if (existingVoteIndex !== -1) {
            if (idea.votes[existingVoteIndex].voteType === voteType) {
                idea.votes.splice(existingVoteIndex, 1);
            } else {
                idea.votes[existingVoteIndex].voteType = voteType;
            }
        } else {
            idea.votes.push({ user_id: userId, voteType });
        }

        await idea.save();
        res.status(200).json({ message: "Vote registered successfully", totalVotes: idea.votes.length });
    } catch (error) {
        next(error);
    }
};

// Add a comment
export const addComment = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) return errorResponse(res, 401, "Missing or invalid token");
        const { content } = req.body;
        if (!content) return errorResponse(res, 400, "Invalid input");

        const user_id = req.user.userId;
        const idea = await Idea.findById(req.params.id);
        if (!idea) return errorResponse(res, 404, "Idea not found");

        idea.comments.push({ user_id, content });
        await idea.save();

        res.status(201).json({ comment: idea.comments[idea.comments.length - 1], message: "Comment added" });
    } catch (error) {
        next(error);
    }
};

// Update idea status (Admin only)
export const updateIdeaStatus = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body;
        if (!status) return errorResponse(res, 400, "Invalid input");

        const idea = await Idea.findById(req.params.id);
        if (!idea) return errorResponse(res, 404, "Idea not found");

        idea.status = status;
        await idea.save();
        res.status(200).json({ message: "Status updated successfully", idea });
    } catch (error) {
        next(error);
    }
};

// Get all ideas for admin
export const getAllIdeasForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        const ideas = await Idea.find()
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Idea.countDocuments();
        res.status(200).json({ ideas, total });
    } catch (error) {
        next(error);
    }
};
