import Notification from '../modules/notification.js'; // Import the Notification model
import dotenv from 'dotenv';
import Clerk from '@clerk/clerk-sdk-node/esm/instance';
 
dotenv.config();

const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Function to send notif
export const sendNotificationOnCreateTraining = async (newTraining) => {
    try {
        console.log('Received courseAdded event. New training:', newTraining);
        // Retrieve User List
        const users = await clerkClient.users.getUserList();

        // Create Notification
        const notificationMessage = `New course "${newTraining.title}" has been added!`;
        const notifications = users.map(user => ({
            recipient: user.id, // Assuming Clerk provides user IDs
            message: notificationMessage
        }));

        // Save Notifications to the database
        await Notification.insertMany(notifications);

    } catch (error) {
        console.error('Error handling courseAdded event:', error);
    }
}

export const showNotifications = async (request, response) => {
    try {
        const userId = request.body.userId; // Assuming userId is in the request parameters
        
        const notifications = await Notification.find({ recipient: userId });
        response.json({ notifications }); // Return the notifications as JSON response

    } catch (error) {
        console.error('Error retrieving notifications by userId:', error);
        response.status(500).json({ message: 'Error retrieving notifications.' }); // Send an error response
    }
};
