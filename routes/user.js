import express from 'express';
import { findAllUsers, findUserById, deleteUser, updateUser } from '../controllers/user.js';
import { Clerk } from '@clerk/clerk-sdk-node';

const userRouter = express.Router();

// API to list all users
userRouter.get('/', findAllUsers);

//API to get user by Id
userRouter.get('/:userId', findUserById);

//API to delete a user
userRouter.delete("/:userId", deleteUser);

//API to update user
userRouter.post('/:userId', updateUser); 

export default userRouter;