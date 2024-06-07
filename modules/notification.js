import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, expires: '7d', default: Date.now },
  read: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
