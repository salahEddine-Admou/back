import mongoose from "mongoose";

const Schema = mongoose.Schema;

const trainingSchema = new Schema({
  title : {type: 'String', required: true},
  description : {type: 'String', required: true},
  prerequisites : {type: [String], required: false},
  objectives : {type: Schema.Types.Mixed, required: false}, // Represented as a dictionary
  duration : {type: Number, required: true},
  image : {type: 'String', required: false},
  category : {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  quiz : {
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  modules: [{
    type: Schema.Types.ObjectId,
    ref: 'TrainingModule',
  }]
});

export const Training = mongoose.model('Training', trainingSchema);