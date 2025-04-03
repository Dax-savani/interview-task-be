import {
    createIdea,
    getIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea,
    voteIdea, addComment, updateIdeaStatus, getAllIdeasForAdmin
} from "../controllers/Idea";
import {Router} from "express";
import {isAdmin} from "../middleware/isAdmin";

const router = Router();
router.get("/", getIdeas);
router.get("/:id", getIdeaById);
router.put("/:id", updateIdea);
router.put("/:id/vote", voteIdea);
router.post("/", createIdea);
router.put("/:id/comment",addComment);

export default router;