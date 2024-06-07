import mongoose from "mongoose";

const Schema = mongoose.Schema;

const certificateSchema = new Schema({
    trainingId: {type: String, required: true},
    userId : {type: String, required: true},
    issueDate: {type: Date, default: Date.now},
    document : {type: String, required: true},
    image : {type: String, required: false},
    
});

export const Certificate = mongoose.model('Certificate', certificateSchema);    