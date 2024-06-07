import dotenv from 'dotenv';
import Clerk from '@clerk/clerk-sdk-node/esm/instance';
import { Certificate } from '../modules/certificate.js';
import UserProgress from '../modules/userProgress.js';
import { UserTraining } from '../modules/usertraining.js';
import UserQuiz from '../modules/userQuiz.js';
import mongoose from 'mongoose';
 
dotenv.config();

const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Controller to find all users
export const findAllUsers = async (request, response) => {
    try {
      const userList = await clerkClient.users.getUserList();
      const filteredUserList = userList.map(user => ({
        id: user.id,
        username: user.username,
        image: user.imageUrl,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.emailAddresses[0].emailAddress
      }));

      response.status(200).json(filteredUserList);
    } catch (error) {
      // Handle errors
      console.log(error.message);
      response.status(500).json({ error: "Error fetching users" });
    }
  };

// Controller to find all users
export const findUserById = async (request, response) => {
  try {
    const userId = request.params.userId;
    const user = await clerkClient.users.getUser(userId);
    const filteredUser = {
      id: user.id,
      username: user.username,
      firstname: user.firstName,
      lastname: user.lastName,
      email: user.emailAddresses[0].emailAddress,
      imageUrl: user.imageUrl
    }

    response.status(200).json(filteredUser);
  } catch (error) {
    // Handle errors
    console.log(error.message);
    response.status(500).json({ error: "Error fetching users" });
  }
};

// Controller to Delete user
export const deleteUser = async (request, response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = request.params.userId;

    // Delete related documents in other collections
    await Certificate.deleteMany({ userId }).session(session);
    await UserProgress.deleteMany({ userId }).session(session);
    await UserTraining.deleteMany({ userId }).session(session);
    await UserQuiz.deleteMany({ userId }).session(session);

    // Delete the user
    await clerkClient.users.deleteUser(userId);

    await session.commitTransaction();
    session.endSession();

    response.status(200).send("User and related data were deleted successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    response.status(500).json({ message: error.message });
  }
};

// Controller to Update user
export const updateUser = async (request, response) => {
  try {
      const userId = request.params.userId;

      const params = request.body;

      const user = await clerkClient.users.updateUser(userId, params);

      return response.status(200).json(user);
      
  } catch (error) {
    response.status(409).send({message : error.message});
  }
}

// Function to find user by ID and return only first and last name
export const findUserInfoById = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    
    // Extracting only first and last name
    const filteredUser = {
      firstname: user.firstName,
      lastname: user.lastName
    };

    return filteredUser;
  } catch (error) {
    // Handle errors
    console.log(error.message);
    throw new Error("Error fetching user");
  }
};




