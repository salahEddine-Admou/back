import Comment from "../modules/comment.js";

// Controller to create new comment or reply
export const createComment = async (request, response) => {
  try {
    // Extract userId, sectionId, text, and parentId from the request body
    const { userId, sectionId, text, parentId } = request.body;

    // Create a new comment instance
    const newComment = new Comment({
      userId,
      sectionId,
      text
    });

    // If parentId is provided, it means this is a reply to an existing comment
    if (parentId) {
      // Check if the parent comment exists
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return response.status(404).json({ message: 'Parent comment not found' });
      }
      // Add the ID of the new comment to the parent comment's replies array
      parentComment.replies.push(newComment._id);
      await parentComment.save();
    }

    // Save the new comment (or reply) to the database
    await newComment.save();

    // Return a success response
    return response.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
    // If an error occurs, return an error response
    console.error('Error creating comment:', error);
    return response.status(500).json({ message: 'Failed to create comment', error: error.message });
  }
};

// Controller to update a comment
export const updateComment = async (request, response) => {
    try {
      // Extract commentId and updatedText from the request body
      const { commentId, updatedText } = request.body;
  
      // Find the comment by its ID
      const comment = await Comment.findById(commentId);
  
      // If the comment doesn't exist, return a 404 error
      if (!comment) {
        return response.status(404).json({ message: 'Comment not found' });
      }
  
      // Update the comment text with the updatedText
      comment.text = updatedText;
  
      // Save the updated comment to the database
      await comment.save();
  
      // Return a success response
      response.json({ message: 'Comment updated successfully', comment });
    } catch (error) {
      // If an error occurs, return an error response
      console.error('Error updating comment:', error);
      response.status(500).json({ message: 'Failed to update comment', error: error.message });
    }
  };

// Controller to delete a comment
export const deleteComment = async (request, response) => {
  try {
    // Extract commentId from the request body
    const { commentId } = request.body;

    // Find the comment by its ID
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    // If the comment doesn't exist, return a 404 error
    if (!deletedComment) {
      return response.status(404).json({ message: 'Comment not found' });
    }

    // Function to recursively delete replies
    const deleteReplies = async (replyIds) => {
      for (const replyId of replyIds) {
        const reply = await Comment.findByIdAndDelete(replyId);
        if (reply) {
          // If the deleted reply has sub-replies, delete them recursively
          if (reply.replies.length > 0) {
            await deleteReplies(reply.replies);
          }
        }
      }
    };

    // If the deleted comment has replies, delete them recursively
    if (deletedComment.replies.length > 0) {
      await deleteReplies(deletedComment.replies);
    }

     // If the deleted comment is a reply, remove its reference from its parent comment's replies array
     const parentComment = await Comment.findOneAndUpdate(
      { replies: commentId }, // Query to find parent comment
      { $pull: { replies: commentId } }, // Remove the ID of the deleted comment from replies array
      { new: true } // Return the updated parent comment
    );

    // Return a success response
    response.json({ message: 'Comment deleted successfully', deletedComment });
  } catch (error) {
    // If an error occurs, return an error response
    console.error('Error deleting comment:', error);
    response.status(500).json({ message: 'Failed to delete comment', error: error.message });
  }
};


// Controller to get all comments of a section with replies and pagination
export const getAllCommentsWithRepliesInSection = async (request, response) => {
  try {
    // Extract sectionId, page number, and limit from the request parameters and query parameters
    const { sectionId } = request.params;
    const page = parseInt(request.query.page) || 1; // Default to page 1 if no page parameter is provided
    const limit = parseInt(request.query.limit) || 10; // Default to 10 comments per page if no limit parameter is provided

    // Calculate the index of the first comment to retrieve based on the page number and limit
    const startIndex = (page - 1) * limit;

    // Find all comments associated with the given sectionId, paginated
    const comments = await Comment.find({ sectionId })
      .skip(startIndex)
      .limit(limit);

    // Function to recursively populate nested replies
    const populateNestedReplies = async (comments) => {
      for (let comment of comments) {
        const populatedComment = await Comment.populate(comment, { path: 'replies' }); // Populate replies of the current comment
        if (populatedComment.replies.length > 0) {
          await populateNestedReplies(populatedComment.replies); // Recursively populate nested replies
        }
      }
    };

    // Populate the replies field of each parent comment with the corresponding reply documents
    await populateNestedReplies(comments);

    const arrayId = [];

    // If the comment is a reply, store its ID in arrayId
    for (let comment of comments) {
      const parentComment = await Comment.findOne(
        { replies: comment._id } // Query to find parent comment
      );
      if (parentComment) {
        arrayId.push(comment._id);
      }
    }

    const filteredComments = comments.filter(comment => {
      const commentId = comment._id;
      return !arrayId.includes(commentId);
    });
    
    // Return the comments with their replies, along with pagination metadata
    response.json({ filteredComments, currentPage: page, totalPages: Math.ceil(comments.length / limit) });
  } catch (error) {
    // If an error occurs, return an error response
    console.error('Error fetching comments with replies:', error);
    response.status(500).json({ message: 'Failed to fetch comments with replies', error: error.message });
  }
};


// Controller to get all comments of a section of an user
export const filtreBySectionAndUser = async (request, response) => {
    try {
      // Extract sectionId from the request parameters
      const { userId, sectionId } = request.body;
  
      // Find all comments associated with the given sectionId
      const comments = await Comment.find({ sectionId, userId });
      
      // Function to recursively populate nested replies
      const populateNestedReplies = async (comments) => {
        for (let comment of comments) {
          const populatedComment = await Comment.populate(comment, { path: 'replies' }); // Populate replies of the current comment
          if (populatedComment.replies.length > 0) {
            await populateNestedReplies(populatedComment.replies); // Recursively populate nested replies
          }
        }
      };

      // Populate the replies field of each parent comment with the corresponding reply documents
      await populateNestedReplies(comments);

      const arrayId = [];

      // If the comment is a reply, store its ID in arrayId
      for (let comment of comments) {
        const parentComment = await Comment.findOne(
          { replies: comment._id } // Query to find parent comment
        );
        if (parentComment) {
          arrayId.push(comment._id);
        }
      }

      const filteredComments = comments.filter(comment => {
        const commentId = comment._id;
        return !arrayId.includes(commentId);
      });
  
      // Return the comment texts as a JSON response
      response.json({ filteredComments });
    } catch (error) {
      // If an error occurs, return an error response
      console.error('Error fetching comments:', error);
      response.status(500).json({ message: 'Failed to fetch comments', error: error.message });
    }
  };