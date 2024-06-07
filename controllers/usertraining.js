import { Training } from '../modules/training.js';
import { UserTraining } from "../modules/usertraining.js";
import Clerk from '@clerk/clerk-sdk-node/esm/instance';
import dotenv from 'dotenv';
import UserProgress from '../modules/userProgress.js';
import { request, response } from 'express';
import { initializeUserProgress } from './userProgress.js';
import { Certificate } from '../modules/certificate.js';
import UserQuiz from '../modules/userQuiz.js';

dotenv.config();

const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });


// Controller to list users by training
export const listUsersByTraining = async (request, response) => {
        try {

            const { trainingId } = request.params;

            const userTrainings = await UserTraining.find({trainingId: trainingId});

            const userIds = userTrainings.map(userTraining => userTraining.userId);

             // Retrieve users from Clerk using their IDs
            const users = await Promise.all(userIds.map(async userId => {
            try {
                const user = await clerkClient.users.getUser(userId);
                return user;
            } catch (error) {
                // Handle error if user is not found or other issues
                console.error(`Error fetching user with ID ${userId}:`, error);
                return null;
            }
        }));

        // Filter out any potential null values from the users array
        const validUsers = users.filter(user => user !== null);

        //Filter neccessery attribut
        const filteredUserList = validUsers.map(user => ({
            id: user.id,
            username: user.username,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.emailAddresses[0].emailAddress
          }));

        response.status(200).json(filteredUserList);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}

// Controller to list users who completed a training
export const listUsersByTrainingCompleted = async (request, response) => {
    try {

        const { trainingId } = request.params;

        const userTrainings = await UserTraining.find({
            trainingId: trainingId,
            completeTraining: true
        });

        const userIds = userTrainings.map(userTraining => userTraining.userId);

        // Retrieve users from Clerk using their IDs
        const users = await Promise.all(userIds.map(async userId => {
            try {
                const user = await clerkClient.users.getUser(userId);
                return user;
            } catch (error) {
                // Handle error if user is not found or other issues
                console.error(`Error fetching user with ID ${userId}:`, error);
                return null;
            }
        }));

        // Filter out any potential null values from the users array
        const validUsers = users.filter(user => user !== null);

        //Filter neccessery attribut
        const filteredUserList = validUsers.map(user => ({
            id: user.id,
            username: user.username,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.emailAddresses[0].emailAddress
          }));

        response.status(200).json(filteredUserList);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
    
}

// Controller to list trainings of a user
export const listTrainingsByUser = async (request, response) => {
    try {
        const userId = request.params.userId;

        const userTrainings = await UserTraining.find({userId: userId}, 'trainingId');
        const trainings = [];

        for (let userTraining of userTrainings) {
            const training = await Training.findById(userTraining.trainingId).select('_id title description');
            const percentageProgress = await UserProgress.findOne({userId: userId, trainingId: training._id}, 'percentageProgress')
            // Combine training with progress
            const trainingWithProgress = {
                    _id: training._id,
                    title: training.title,
                    description: training.description,
                    progress: percentageProgress.percentageProgress        
            };
            trainings.push(trainingWithProgress);
        };

        response.status(200).json({trainings})

    } catch (error) {
        response.status(401).json({message: error.message});
    }
}

// Controller to enroll to a training
export const enrollTraining = async (request, response) => {
    try {
        const { userId, trainingId } = request.body;

        const training = await Training.findById(trainingId);

        if (!training) {
            return response.status(500).json({ error: "Training not Found" });
        }

        // Link User to a training to track his progress
        const newUserTraining = new UserTraining({
            userId: userId,
            trainingId: trainingId
        })
        await newUserTraining.save();

        await training.save();

        const userProgress = await initializeUserProgress(userId, trainingId);

        response.json({ message: 'You have enrolled the training' });
    } catch (error) {
        console.error('Error while enrolling training');
        response.status(500).json({ message: error.message });
    }
}

// Controller function to check if a course is already enrolled
export const checkEnrollment = async (request, response) => {
    try {
        const { userId, trainingId } = request.params;

      // Query the UserTraining collection to find a document matching userId and trainingId
      const enrollment = await UserTraining.findOne({ userId, trainingId });
  
      // If a document is found, return true indicating enrollment
      if (enrollment) {
        response.status(200).json({enrolled: true});
      } else {
        // If not found, return false indicating not enrolled
        response.status(200).json({enrolled: false});
      }
    } catch (error) {
      // Handle any errors
      response.status(401).json({message: error.message})
    }
  };

// Controller to find training completed of a user
export const findCompletedTraining = async (request, response) => {
    try {
        const { userId } = request.body;

         // Query the UserTraining collection to find documents matching userId with completeTraining set to true
        const completedTrainings = await UserTraining.find({ userId, completeTraining: true });
        const notCompletedTrainings = await UserTraining.find({ userId, completeTraining: false });
        // Extract trainingIds from the matching documents
        const completedTrainingIds = completedTrainings.map(training => training.trainingId);
        const completedTrainingsFiltred = [];

        const notCompletedTrainingIds = notCompletedTrainings.map(training => training.trainingId);
        const notCompletedTrainingsFiltred = [];

        for (let trainingId in completedTrainingIds) {

            const training = await Training.findById(trainingId, '_id title');
            completedTrainingsFiltred.push(training);
        }

        for (let trainingId in notCompletedTrainingIds) {

            const training = await Training.findById(trainingId, '_id title');
            notCompletedTrainingsFiltred.push(training);
        }

        response.status(201).json({comleted: completedTrainingsFiltred, notCompleted: notCompletedTrainingsFiltred});
            
    } catch (error) {
        response.status(4001).json({message: error.message});
    }
}

// Function to calculate user progress for each training
export async function calculateCompletionPercentage(userId, trainingId) {

    // Find the user progress
    try {
        const userProgress = await UserProgress.findOne({ userId, trainingId });
        if (!userProgress) {
            throw new Error('User progress not found');
        };
            let totalSections = 0;
        let completedSections = 0;

    userProgress.moduleProgress.forEach(moduleProg => {
        moduleProg.sectionProgress.forEach(sectionProg => {
            totalSections++;
            if (sectionProg.completed) {
                completedSections++;
            }
        });
    });

    return (completedSections / totalSections) * 90;
        

    } catch (error) {
        console.log(error.message);
    }

};

// Function to set a training as completed
export async function markUserTrainingAsCompleted(userId, trainingId) {
    try {
        console.log('start markUserTrainingAsCompleted function');
        // Find the user training record by userId and trainingId
        const userTraining = await UserTraining.findOne({ userId, trainingId });
        let userProgress = await UserProgress.findOne({ userId, trainingId });

        if (!userTraining) {
            console.log('User training record not found');
            throw new Error('User training record not found');
        }

        if (!userProgress) {
            console.log('User progress record not found');
            throw new Error('User progress record not found');
        }
        console.log("start updating progress");
        console.log(`Current progress: ${userProgress.percentageProgress}`);
        userProgress.percentageProgress = 100;
        await userProgress.save();
        console.log(`Updated progress: ${userProgress.percentageProgress}`);
        console.log("end updating progress");

        // Set the 'completeTraining' field to true
        userTraining.completeTraining = true;
        userTraining.finishDate = Date.now();

        // Save the updated user training record
        await userTraining.save();
        console.log("the function markUserTrainingAsCompleted worked successefully");
        return { message: 'User training marked as completed' };
    } catch (error) {
        console.log(`Error marking user training as completed: ${error.message}`);
        throw new Error(`Error marking user training as completed: ${error.message}`);
    }
}

export const getUserDataSummary = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Get the last completed training title
        const lastCompletedTraining = await UserTraining.findOne({ userId, completeTraining: true })
            .populate('trainingId', 'title')
            .exec();

        const lastCompletedTrainingTitle = lastCompletedTraining ? lastCompletedTraining.trainingId.title : "Not yet";

        // Get the number of incomplete trainings
        const numberOfIncompleteTrainings = await UserTraining.countDocuments({ userId, completeTraining: false });
        // Get the number of earned certificates
        const numberOfCertificatesEarned = await Certificate.countDocuments({ userId });

        // Get the number of quizzes where the user has a grade of 100
        const numberOfQuizzesWithGrade100 = await UserQuiz.countDocuments({ userId, grade: 100 });

        return res.status(200).json({
            lastCompletedTrainingTitle,
            numberOfIncompleteTrainings: numberOfIncompleteTrainings.toString(),
            numberOfCertificatesEarned: numberOfCertificatesEarned.toString(),
            numberOfQuizzesWithGrade100: numberOfQuizzesWithGrade100.toString()
        });
    } catch (error) {
        console.error("Error fetching user data summary:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};