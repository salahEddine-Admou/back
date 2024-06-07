import mongoose from "mongoose";

const userQuizSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz' // Reference to the Quiz model
  },
  grade: {
    type: Number,
    required: true
  }
});

const UserQuiz = mongoose.model("UserQuiz", userQuizSchema);

export default UserQuiz;
