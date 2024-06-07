import express from 'express';
import { correctQuiz, createQuiz, deleteQuiz, findQuizById, findQuizzesByTraining, updateQuiz } from '../controllers/quiz.js';

const quizRouter = express.Router();

//API to create new Quiz
quizRouter.post('/', createQuiz);

//API to update a Quiz
quizRouter.put('/:id', updateQuiz);

//API to delete a Quiz
quizRouter.delete('/:id', deleteQuiz);

//API to find a Quiz by ID
quizRouter.get('/:id', findQuizById);

//API to find a Quiz by training
quizRouter.get('/:trainingId', findQuizzesByTraining);

//API to find a Quiz by training
quizRouter.post('/correct', correctQuiz);

export default quizRouter;