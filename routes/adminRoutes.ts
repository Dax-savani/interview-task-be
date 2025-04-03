import {updateIdeaStatus, getAllIdeasForAdmin, deleteIdea} from "../controllers/Idea";
import {Router} from "express";

const router = Router();
router.put("/ideas/:id", updateIdeaStatus);
router.delete("/ideas/:id", deleteIdea);
router.get("/ideas", getAllIdeasForAdmin);

export default router;