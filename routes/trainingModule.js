import express from 'express';
import { createTrainingModule, deleteModuleAndSections, updateModule } from '../controllers/trainingModule.js';


const trainingModuleRouter = express.Router();

//API to create new Training Module
trainingModuleRouter.post('/', createTrainingModule);

//API to update Training Module
trainingModuleRouter.put('/:id', updateModule);

//API to delete Training Module and Sections associated
trainingModuleRouter.delete('/:id', deleteModuleAndSections);

export default trainingModuleRouter;