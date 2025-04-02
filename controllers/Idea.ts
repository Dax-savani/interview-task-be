import { NextFunction, Request, Response } from "express";
import Idea from "../models/Idea";

// Create a new idea
export const createIdea = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { title, description } = req.body;
        const user_id = req.user.userId;

        const newIdea = new Idea({ title, description, user_id });
        const savedIdea = await newIdea.save();
        res.status(201).json(savedIdea);
    } catch (error) {
        next(error);
    }
};

// Get all ideas
export const getIdeas = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // const ideas = await Idea.find().populate("comments").populate("user_id", "username email");
        const ideas = await Idea.find().populate("user_id", "username email");
        res.status(200).json(ideas);
    } catch (error) {
        next(error);
    }
};

// Get a single idea by ID
export const getIdeaById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idea = await Idea.findById(req.params.id).populate("user_id", "username email");
        if (!idea) {
            res.status(404).json({ message: "Idea not found" });
            return;
        }
        res.status(200).json(idea);
    } catch (error) {
        next(error);
    }
};

// Update an idea (only if the user owns it)
export const updateIdea = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            res.status(404).json({ message: "Idea not found" });
            return;
        }

        const updatedIdea = await Idea.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedIdea);
    } catch (error) {
        next(error);
    }
};

// Delete an idea (only if the user owns it)
export const deleteIdea = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            res.status(404).json({ message: "Idea not found" });
            return;
        }

        await Idea.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Idea deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// Vote on an idea
export const voteIdea = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { voteType } = req.body;
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            res.status(404).json({ message: "Idea not found" });
            return;
        }

        idea.votes += voteType === "upvote" ? 1 : voteType === "downvote" ? -1 : 0;
        await idea.save();

        res.status(200).json(idea);
    } catch (error) {
        next(error);
    }
};
