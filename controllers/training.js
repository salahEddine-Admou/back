import { Training } from '../modules/training.js';
import cloudinary from '../utils/cloudinary.js';
import TrainingModule from "../modules/trainingModule.js";
import Section from "../modules/section.js"
import { eventEmitter } from '../utils/eventEmitter.js';
import { Certificate } from '../modules/certificate.js';
import UserProgress from '../modules/userProgress.js';
import { UserTraining } from '../modules/usertraining.js';
import mongoose from 'mongoose';

// Controller for creating new training
export const createTraining = async (request, response) => {
    try {

        // Upload image to Cloudinary
        const image = request.file.path;
        const uploadedImage = await cloudinary.uploader.upload(image);
        console.log('images uploaded');
        
        // Create new training object with attributes
    const newTraining = new Training({
        title: request.body.title,
        description: request.body.description,
        prerequisites: request.body.prerequisites,
        objectives: request.body.objectives,
        duration: request.body.duration,
        userIds: request.body.userIds,
        image: uploadedImage.secure_url,
        category: request.body.category,
        modules: []
      });

        await newTraining.save();

        // Emit an event to signal that a new course has been added
        eventEmitter.emit('courseAdded', newTraining);

        response.status(200).json(newTraining);
    } catch (error) {
        response.status(409).json({ message : error.message });
    }
}

// Controller for listing all trainings
export const findAllTraining = async (request, response) => {
    try {
        const trainings = await Training.find({}, '_id title description prerequisites objectives duration image category')
            .populate('category', 'title'); // Populate only the title field of the category

        return response.status(200).json({
            count: trainings.length,
            data: trainings.map(training => ({
                _id: training._id,
                title: training.title,
                description: training.description,
                prerequisites: training.prerequisites,
                objectives: training.objectives,
                duration: training.duration,
                image: training.image,
                category: training.category ? training.category.title : null, // Ensure only the category title is returned
            }))
        });
    } catch (error) {
        response.status(409).send({ message: error.message });
    }
};

// Controller for finding training by ID
export const findTrainingById = async (request, response) => {
    try {
        const { id } = request.params;

        const training = await Training.findById(id)
            .populate({
                path: 'modules',
                populate: [
                    {
                        path: 'sections'
                    }
                    // Removed the quiz population here
                ]
            });
            // Removed the quiz population here

        return response.status(200).json({ training });

    } catch (error) {
        response.status(409).send({ message: error.message });
    }
};

// Controller for deleting training by ID
export const deleteTrainingById = async (request, response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { id } = request.params;
  
      // Find the training
      const training = await Training.findById(id).session(session);
  
      if (!training) {
        return response.status(404).send("Training not found");
      }
  
      // Find and delete all modules related to the training
      const modules = await TrainingModule.find({ _id: { $in: training.modules } }).session(session);
  
      for (const module of modules) {
        // Delete all sections related to the module
        await Section.deleteMany({ _id: { $in: module.sections } }).session(session);
      }
  
      // Delete all modules related to the training
      await TrainingModule.deleteMany({ _id: { $in: training.modules } }).session(session);
  
      // Delete all UserProgress and UserTraining records related to the training
      await Certificate.deleteMany({ userId }).session(session);
      await UserProgress.deleteMany({ userId }).session(session);
      await UserTraining.deleteMany({ userId }).session(session);
  
      // Delete the training itself by ID
      await Training.findByIdAndDelete(id).session(session);
  
      await session.commitTransaction();
      session.endSession();
  
      return response.status(200).send("Training and associated data were deleted successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      response.status(500).send({ message: error.message });
    }
  };

// Controller to update training
export const updateTraining = async (request, response) => {
    try {
        const { id } = request.params;
        const fieldsToUpdate = request.body;
        console.log(request.body);
        // Remove the modules field from the fieldsToUpdate object
        delete fieldsToUpdate.modules;

        const result = await Training.findByIdAndUpdate(id, fieldsToUpdate, { new: true });

        if (!result) {
            return response.status(409).send("Training does not exist");
        }

        return response.status(200).json({ message: "Training updated successfully" });

    } catch (error) {
        response.status(409).send({ message: error.message });
    }
};

// Controller for searching training by title
export const searchTrainingByTitle = async (request, response) => {

    try {
        const { query } = request.query;
        
        // Perform a case-insensitive search for training titles that match the query
        const searchResults = await Training.find(
            { title: { $regex: new RegExp(query, 'i') } },
            { _id: 1, title: 1, description: 1 }
        );

        return response.status(200).json({ results: searchResults });
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
};

export const getTrainingTitle = async (trainingId) => {
    try {
      const training = await Training.findById(trainingId);
      
      if (!training) {
        throw new Error("Training not found");
      }
  
      return training.title;
    } catch (error) {
      // Handle errors
      console.log(error.message);
      throw new Error("Error fetching training title");
    }
};

// Controller to get all training with populated data
export async function getAllTrainingData(req, res) {
    try {
        // Fetch all trainings
        const trainings = await Training.find({}, 'id title').populate({
            path: 'modules',
            select: 'id title quiz', // Include 'quiz' field in the selection
            populate: {
                path: 'sections',
                select: 'id title'
            }
        }).populate('quiz', 'id title'); // Populate the quiz for each training

        res.json(trainings);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
