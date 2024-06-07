import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userProgressSchema = new Schema({
    userId: { type: String, required: true },
    trainingId: { type: Schema.Types.ObjectId, ref: 'Training', required: true },
    moduleProgress: [{
        moduleId: { type: Schema.Types.ObjectId, ref: 'TrainingModule', required: true },
        sectionProgress: [{
            sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
            completed: { type: Boolean, default: false }
        }]
    }],
    percentageProgress: {
        type: Number,
        default: 0
    },
    hourSpent: {
        type: Number,
        default: 0
    }
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
