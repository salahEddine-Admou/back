import UserQuiz from "../modules/userQuiz.js";

// Fonction to create or update grades of a user
const createOrUpdateUserQuiz = async (userId, quizId, score) => {
    try {
      // Check if the user has previously attempted this quiz
      let userQuiz = await UserQuiz.findOne({ userId, quizId });
  
      if (!userQuiz) {
        // If no attempt exists, create a new UserQuiz document
        userQuiz = new UserQuiz({
          userId,
          quizId,
          grade: score
        });
      } else {
        // If attempt exists, update the grade
        if (userQuiz.grade < score) {
          userQuiz.grade = score;
        }
      }
  
      // Save the UserQuiz document to the database
      await userQuiz.save();
  
      // Return the updated UserQuiz document
      return userQuiz;
    } catch (error) {
      console.error("Error creating or updating user quiz:", error);
      throw new Error("Failed to create or update user quiz.");
    }
  };
  
  export default createOrUpdateUserQuiz;