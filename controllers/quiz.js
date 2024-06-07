import Quiz from '../modules/quiz.js'
import createOrUpdateUserQuiz from './userQuiz.js';
import { markUserTrainingAsCompleted } from './usertraining.js';
import { createAndStoreCertificate } from './certificate.js';
import { Training } from '../modules/training.js';
import TrainingModule from '../modules/trainingModule.js';


// Controller function to create a quiz
export const createQuiz = async (request, response) => {
  try {
    const { title, questions, trainingId } = request.body;

    // Validate if title and questions are provided
    if (!title || !questions || questions.length === 0) {
      return response.status(400).json({ message: "Title and questions are required." });
    }

    // Create new quiz object
    const newQuiz = new Quiz({
      title,
      questions,
      training: trainingId
    });

    // Save the quiz to the database
    const savedQuiz = await newQuiz.save();

    response.status(201).json(savedQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    response.status(500).json({ message: "Failed to create quiz." });
  }
};

// Controller to update a quiz
export const updateQuiz = async (request, response) => {
  try {
    const { id } = request.params;
    const { title, questions } = request.body;

    // Validate if title and questions are provided
    if (!title || !questions || questions.length === 0) {
      return response.status(400).json({ message: "Title and questions are required." });
    }

    // Find the quiz by ID
    const quiz = await Quiz.findById(id);

    // If quiz not found
    if (!quiz) {
      return response.status(404).json({ message: "Quiz not found." });
    }

    // Update the quiz object
    quiz.title = title;
    quiz.questions = questions;

    // Save the updated quiz to the database
    const updatedQuiz = await quiz.save();

    response.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    response.status(500).json({ message: "Failed to update quiz." });
  }
};

// Controller to delete a quiz
export const deleteQuiz = async (request, response) => {
  try {
    const { id } = request.params;

    // Remove the quiz ID from any TrainingModule documents
    await TrainingModule.updateMany(
      { quiz: id },
      { $unset: { quiz: "" } }
    );

    // Remove the quiz ID from any Training documents
    await Training.updateMany(
      { quiz: id },
      { $unset: { quiz: "" } }
    );

    // Find the quiz by ID and delete it
    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    // If quiz not found
    if (!deletedQuiz) {
      return response.status(404).json({ message: "Quiz not found." });
    }

    response.status(200).json({ message: "Quiz deleted successfully.", deletedQuiz });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    response.status(500).json({ message: "Failed to delete quiz." });
  }
};

// Controller to get a quiz by ID
export const findQuizById = async (request, response) => {
  try {
    const { id } = request.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return response.status(400).json({ message: "Quiz not found" });
    }

    // Remove the isCorrect field from each answer
    const filteredQuiz = JSON.parse(JSON.stringify(quiz)); // Deep copy to avoid modifying the original object
    filteredQuiz.questions.forEach(question => {
      question.answer.forEach(answer => {
        delete answer.isCorrect;
      });
    });

    response.status(201).json({ quiz: filteredQuiz });

  } catch (error) {
    response.status(400).json({ message: error.message });
  }
};

// Controller to find quiz by module
export const findQuizzesByTraining = async (request, response) => {
  try {
    const { moduleId } = request.body;

    // Find quizzes by training ID
    const quizzes = await Quiz.find({ module: moduleId });

    response.status(200).json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    response.status(500).json({ message: "Failed to fetch quizzes." });
  }
};

// Controller to correct a quiz and return the score
export const correctQuiz = async (request, response) => {
  try {

    const {id, userId, answers, trainindId, type } = request.body;

    // Check if answers are provided
    if (!answers || !Array.isArray(answers)) {
      return response.status(400).json({ message: "Please provide valid answers." });
    }

    // Find the quiz by ID
    const quiz = await Quiz.findById(id);

    // If the quiz is not found
    if (!quiz) {
      return response.status(404).json({ message: "Quiz not found." });
    }

    // Check the answers
    let score = 0;
    let incorrectIndices = [];
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswers = question.answer.filter(answer => answer.isCorrect).map(answer => answer.text);
      if (arraysEqual(userAnswer, correctAnswers)) {
        score++;
      } else {
        incorrectIndices.push(index + 1);
      }
    });

    // Calculate the score percentage
    const totalQuestions = quiz.questions.length;
    const percentageScore = (score / totalQuestions) * 100;

    await createOrUpdateUserQuiz(userId, quiz._id, percentageScore);

    if (percentageScore > 50 && type == 'final') {
            console.log(userId);
            console.log(trainindId);
            await markUserTrainingAsCompleted(userId, trainindId);
            await createAndStoreCertificate(userId, trainindId);
            console.log('end of if proceess');
        
    }

    // Return the score
    response.status(200).json({ score: percentageScore, incorrectIndices });
  } catch (error) {
    console.error("Error correcting the quiz:", error);
    response.status(500).json({ message: "Failed to correct the quiz." });
  }
};

// Function to compare two arrays regardless of order
const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  
  // Sort both arrays and then compare element by element
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) return false;
  }
  
  return true;
};


