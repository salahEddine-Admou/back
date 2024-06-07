import express from 'express';
import {createTraining, findAllTraining, findTrainingById, deleteTrainingById, updateTraining, searchTrainingByTitle, getAllTrainingData} from '../controllers/training.js';
import upload from '../utils/multer.js'

const trainingRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trainings
 *   description: Operations about trainings
 */

/**
 * @swagger
 * /training:
 *   get:
 *     summary: Returns all trainings
 *     description: Get all trainings from the database
 *     responses:
 *       200:
 *         description: A list of trainnings
 */
//API to list all trainings
trainingRouter.get('/', findAllTraining);

// API to get all training with populated data
trainingRouter.get('/all', getAllTrainingData);

/**
 * @swagger
 * /training:
 *   post:
 *     summary: Create a new training
 *     description: Create a new training record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the training
 *               description:
 *                 type: string
 *                 description: Description of the training
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the training (format is YYYY-MM-DD)
 *               duration:
 *                 type: number
 *                 description: Duration of the training in hours
 *               center:
 *                 type: string
 *                 description: Localisation of the training
 *     responses:
 *       200:
 *         description: Training created successfully
 *       409:
 *         description: Invalid request body
 */
//API to create new Training
trainingRouter.post('/', upload.single('image'), createTraining);

// Route for searching training by title
trainingRouter.get('/search', searchTrainingByTitle);

/**
 * @swagger
 * /training/{id}:
 *   get:
 *     summary: Get a training by ID
 *     description: Get a user's details by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: String
 *         description: Training ID
 *     responses:
 *       200:
 *         description: A single training object
 */
//API to find training by ID
trainingRouter.get('/:id', findTrainingById);

/**
 * @swagger
 * /training/{id}:
 *   delete:
 *     summary: Delete a training
 *     description: Delete a training record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: ID of the training to delete
 *     responses:
 *       200:
 *         description: Training deleted successfully
 *       409:
 *         description: Training not found
 */
//API for Deleting Training
trainingRouter.delete('/:id', deleteTrainingById);

/**
 * @swagger
 * /training/{id}:
 *   put:
 *     summary: Update a training
 *     description: Update an existing training record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: Training ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the training
 *               description:
 *                 type: string
 *                 description: Description of the training
*               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the training
 *               duration:
 *                 type: number
 *                 description: Duration of the training in hours
 *               center: 
 *                  type: string
 *                  description: Localisation of the training
 *     responses:
 *       200:
 *         description: Training updated successfully
 *       409:
 *         description: Invalid request body or Training ID
 */
//API for updating Training
trainingRouter.put('/:id',upload.array(), updateTraining);


export default trainingRouter;