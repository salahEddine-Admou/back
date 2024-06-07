import express from 'express';
import { createCategory, findAllCategories, findCategoryById, updateCategory, deleteCategory } from '../controllers/category.js';

const categoryRouter = express.Router();

// API to create a new category
categoryRouter.post('/', createCategory);

// API to get all categories
categoryRouter.get('/', findAllCategories);

// API to get a specific category by ID
categoryRouter.get('/:id', findCategoryById);

// API to update a specific category by ID
categoryRouter.put('/:id', updateCategory);

// API to delete a specific category by ID
categoryRouter.delete('/:id', deleteCategory);

export default categoryRouter;

