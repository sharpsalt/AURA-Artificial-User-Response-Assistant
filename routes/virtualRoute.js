import express from "express";
import { virtualAssistant, getLearningStats } from "../controllers/assistantController.js";

const router = express.Router();

router.post('/virtualAssistant', virtualAssistant);
router.get('/stats', getLearningStats);

export default router;