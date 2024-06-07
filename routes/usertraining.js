import express from 'express';
import { checkEnrollment, enrollTraining, findCompletedTraining, getUserDataSummary, listTrainingsByUser, listUsersByTraining, listUsersByTrainingCompleted } from "../controllers/usertraining.js";

const usertrainingRouter = express.Router();

// API to list users by training
usertrainingRouter.get('/:trainingId', listUsersByTraining);

// API to list users who completed a training:
usertrainingRouter.get('/:trainingId/completed', listUsersByTrainingCompleted);

//API to list trainings by user
usertrainingRouter.get('/user/:userId', listTrainingsByUser);

//API for enrolling training
usertrainingRouter.post('/enroll', enrollTraining);

//API for checking if a course is already enrolled or not
usertrainingRouter.get('/check-enrollment/:userId/:trainingId', checkEnrollment);

// API to find training completed of a user
usertrainingRouter.get('/completedTrainings', findCompletedTraining);

//API to find user data summury
usertrainingRouter.get('/summary/:userId', getUserDataSummary);




export default usertrainingRouter;