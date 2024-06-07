import express from 'express';
import { showNotifications } from '../controllers/notification.js';

const notificationRouter = express.Router();

notificationRouter.get('/', showNotifications);

export default notificationRouter;