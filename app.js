import express, {request, response} from 'express';
import mongoose from 'mongoose';
import trainingRouter from './routes/training.js';
import userRouter from './routes/user.js'
import dotenv from 'dotenv';
import swaggerDocs from './swagger.js';
import usertrainingRouter from './routes/usertraining.js';
import certificateRouter from './routes/certificate.js';
import cors from 'cors';
import sectionRouter from './routes/section.js';
import trainingModuleRouter from './routes/trainingModule.js';
import bodyParser from 'body-parser';;
import quizRouter from './routes/quiz.js';
import userProgressRouter from './routes/userProgress.js';
import commentRouter from './routes/comment.js';
import { eventEmitter } from './utils/eventEmitter.js'; // Import the event emitter
import { sendNotificationOnCreateTraining } from './controllers/notification.js';
import notificationRouter from './routes/notification.js';
import categoryRouter from './routes/category.js';
import contactRouter from './routes/contact.js';



dotenv.config();


const app = express();

app.use(cors());

swaggerDocs(app, process.env.PORT);

app.use(express.json());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))



// Connexion to MongoDB
mongoose.connect(process.env.mongoURI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas', err);
  });

app.use('/training', trainingRouter);
app.use('/user', userRouter);
app.use('/usertraining', usertrainingRouter);
app.use('/certificate', certificateRouter);
app.use('/section', sectionRouter);
app.use('/trainingModule', trainingModuleRouter);
app.use('/quiz', quizRouter);
app.use('/userProgress', userProgressRouter);
app.use('/comment', commentRouter);
app.use('/notification', notificationRouter);
app.use('/category', categoryRouter);
app.use('/contact', contactRouter);


// Configure PORT
const listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${process.env.PORT}`)
})

// Listen for the 'courseAdded' event
eventEmitter.on('courseAdded', async (newTraining) => {
  sendNotificationOnCreateTraining(newTraining);
});
