import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Reference to the user who posted the comment
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }, // Reference to the section or video the comment belongs to
  text: { type: String, required: true }, // The content of the comment
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the comment was created
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // Array of comment IDs for replies
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;