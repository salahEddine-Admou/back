import express from "express";
import { findTotalHoursSpentOnTrainings, initializeUserProgressOnEnroll, markSectionAsCompleted, showTrainingProgress } from "../controllers/userProgress.js";

const userProgressRouter = express.Router();

// API to initialise new user progress
userProgressRouter.post("/", initializeUserProgressOnEnroll);

// API to update progression
userProgressRouter.patch("/", markSectionAsCompleted);

// API to get training progress
userProgressRouter.get("/progress/:userId/:trainingId", showTrainingProgress);

// API to get total hours spent 
userProgressRouter.get("/hours/:userId", findTotalHoursSpentOnTrainings);

export default userProgressRouter;