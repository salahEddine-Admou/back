import express from 'express';
import upload from '../utils/multer.js';
import { createSection, deleteSection, updateSection } from '../controllers/section.js';

const sectionRouter = express.Router();

//API to create new Section
sectionRouter.post('/', upload.single('videoUrl'), createSection);

//API to update Section
sectionRouter.put('/:id', upload.single('videoUrl'), updateSection);

//API to delete Section
sectionRouter.delete('/:id', deleteSection);

export default sectionRouter;