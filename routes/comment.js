import express from 'express';
import { createComment, deleteComment, filtreBySectionAndUser, getAllCommentsWithRepliesInSection, updateComment } from '../controllers/comment.js';

const commentRouter = express.Router();

// API to create new comment
commentRouter.post('/', createComment);

// API to update comment
commentRouter.put('/', updateComment);

// API to delete comment
commentRouter.delete('/', deleteComment);

// API to get comments of a specific section
commentRouter.get('/:sectionId', getAllCommentsWithRepliesInSection);

// API to get comments of a specific section and user
commentRouter.get('/', filtreBySectionAndUser);

export default commentRouter;