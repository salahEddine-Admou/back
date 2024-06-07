import UserProgress from "../modules/userProgress.js";
import {Training} from "../modules/training.js"
import { calculateCompletionPercentage, markUserTrainingAsCompleted } from "./usertraining.js";




// Controller to update progresion
export const markSectionAsCompleted = async (request, response) => {
    try {
        const { userId, trainingId, moduleId, sectionId } = request.body;

        // Find user progress record for the user and training
        let userProgress = await UserProgress.findOne({ userId, trainingId });

        if (!userProgress) {
            return response.status(404).json({ message: 'User progress not found' });
        }

        // Find module progress record for the module
        const moduleIndex = userProgress.moduleProgress.findIndex(module => module.moduleId.toString() === moduleId);
        
        if (moduleIndex === -1) {
            return response.status(404).json({ message: 'Module progress not found' });
        }

        // Check if the section is already marked as completed
        const sectionIndex = userProgress.moduleProgress[moduleIndex].sectionProgress
            .findIndex(section => section.sectionId.toString() === sectionId);

        if (sectionIndex !== -1) {
            // Set the 'isCompleted' field of the section to true
            userProgress.moduleProgress[moduleIndex].sectionProgress[sectionIndex].completed = true;
        }

        await userProgress.save();

        // Check if the course is completed:
        const percentage = await calculateCompletionPercentage(userId, trainingId);

        // Find the training to get its duration
        const training = await Training.findById(trainingId);
        const duration = training.duration; // Duration of the training in hours

        // Calculate hours spent based on percentage progress and duration
        const hoursSpent = (percentage / 100) * duration;
        userProgress.hourSpent = hoursSpent;
        userProgress.percentageProgress = percentage;

        // Save updated user progress
        await userProgress.save();

        console.log('end of proceess');
        return response.status(200).json(userProgress);
    } catch (error) {
        return response.status(500).json({ message: `Error marking section as completed: ${error.message}` });
    }
}

// Function to initialize new user progress
export async function initializeUserProgress(userId, trainingId) {
    try {
        // Find the training to get module and section information
        const training = await Training.findById(trainingId).populate('modules');

        if (!training) {
            throw new Error('Training not found');
        }

        // Create a new user progress record
        const userProgress = new UserProgress({
            userId,
            trainingId,
            moduleProgress: training.modules.map(module => ({
                moduleId: module._id,
                sectionProgress: module.sections.map(section => ({
                    sectionId: section._id,
                    completed: false
                }))
            }))
        });

        // Save the initialized user progress
        await userProgress.save();

        return userProgress;
    } catch (error) {
        throw new Error(`Error initializing user progress: ${error.message}`);
    }
}

// this is just a controll for testing before implementing enroll logic
export async function initializeUserProgressOnEnroll(request, response) {
    try {
        const { userId, trainingId } = request.body;

        // Find the training to get module and section information
        const training = await Training.findById(trainingId).populate('modules');

        if (!training) {
            return response.status(404).json({ message: 'Training not found' });
        }

        // Create a new user progress record
        const userProgress = new UserProgress({
            userId,
            trainingId,
            moduleProgress: training.modules.map(module => ({
                moduleId: module._id,
                sectionProgress: module.sections.map(section => ({
                    sectionId: section._id,
                    completed: false
                }))
            }))
        });

        // Save the initialized user progress
        await userProgress.save();

        return response.status(201).json(userProgress);
    } catch (error) {
        return response.status(500).json({ message: `Error initializing user progress: ${error.message}` });
    }
}

// Controller to show training progress
export async function showTrainingProgress(request, response) {
    try {
        const { userId, trainingId } = request.params;

        // Find user progress record for the user and training
        let userProgress = await UserProgress.findOne({ userId, trainingId });

        if (!userProgress) {
            return response.status(404).json({ message: 'User progress not found' });
        }

        const percentage = userProgress.percentageProgress;

        return response.status(200).json({percentage});
    } catch (error) {
        return response.status(500).json({ message: `Error calculating training progress: ${error.message}` });
    }
}

// Controller to get total hours spent on trainings
export const findTotalHoursSpentOnTrainings = async(request, response) => {

    try {

        const userId = request.params.userId;

        const userProgresses = await UserProgress.find({userId});

        let totalHours = 0;
        for (const userProgress of userProgresses) {
            totalHours = totalHours + userProgress.hourSpent;
        }

        return response.status(200).json({totalHours});
    } catch (error) {
        return response.status(500).json({ message: `Error calculating total hours: ${error.message}` });
    }
}


