import mongoose from "mongoose";    

const Schema = mongoose.Schema;

const sectionSchema = new Schema({
    title: String,
    videoUrl: String
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;