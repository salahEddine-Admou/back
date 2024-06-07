import mongoose from "mongoose";

const Schema = mongoose.Schema;

const usertrainingSchema = new Schema({
    userId: {
        type: 'String',
        required: true
      },
      trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Training',
        required: true
      },
      completeTraining: {
        type: Boolean,
        default: false
      },
      timestamp: { 
        type: Date,
        default: Date.now 
      },
      finishDate : {
        type: Date,
        default: null
      }
})

usertrainingSchema.index({ userId: 1, trainingId: 1 }, { unique: true });

export const UserTraining = mongoose.model('UserTraining', usertrainingSchema);