import {
    createIdea,
    getIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea,
    voteIdea
} from "../controllers/Idea";
import {Router} from "express";

const router = Router();
router.get("/:id", getIdeaById);
router.put("/:id", updateIdea);
router.delete("/:id", deleteIdea);
router.patch("/:id/vote", voteIdea);
router.post("/", createIdea);
router.get("/", getIdeas);

export default router;