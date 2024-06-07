import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const trainingModuleSchema = new Schema({
    title: String,
    sections: [{
        type: Schema.Types.ObjectId,
        ref: 'Section'
    }],
    quiz : {
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
      },
});

const TrainingModule = mongoose.model('TrainingModule', trainingModuleSchema)

export default TrainingModule;