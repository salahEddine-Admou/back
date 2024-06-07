import mongoose from "mongoose";

const Schema = mongoose.Schema;

    const quizSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        questions: [
            {
                text: {
                    type: String,
                    required: true
                },
                isMultipleChoice: {
                    type: Boolean,
                    required: true
                },
                answer: [
                    {
                        text: {
                            type: String,
                            required: true
                        },
                        isCorrect: {
                            type: Boolean,
                            required: true
                        }
                    }
                ]
            }
        ],
    });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
