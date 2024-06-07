import express from 'express';
import upload from '../utils/multer.js';
import { getCertificateIdByTrainingIdAndUserId, getCertificatesByUserId } from '../controllers/certificate.js';

const certificateRouter = express.Router();

// API to get certificate by user ID and trainind ID
certificateRouter.get('/:trainingId/:userId', getCertificateIdByTrainingIdAndUserId)

// API to get certificate by user ID
certificateRouter.get('/:userId', getCertificatesByUserId)

export default certificateRouter;