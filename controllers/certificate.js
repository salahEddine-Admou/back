import { Certificate } from "../modules/certificate.js"; // Adjusted path
import cloudinary from "../utils/cloudinary.js";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util'; // Updated import
import puppeteer from 'puppeteer';
import hb from 'handlebars';
import Clerk from '@clerk/clerk-sdk-node/esm/instance';
import { Training } from "../modules/training.js";
import UserQuiz from "../modules/userQuiz.js";
 
dotenv.config();

const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const readFile = promisify(fs.readFile);



async function getTemplateHtml() {

    try {
        const certificatePath = path.resolve("./test/certificateTemplate.html");
        console.log("Resolved template path:", certificatePath); // Add logging
        return await readFile(certificatePath, 'utf8');
    } catch (err) {
        console.error("Error loading html template:", err); // Add error logging
        throw new Error("Could not load html template");
    }
}

async function generatePdf(data) {
    try {
        const templateHtml = await getTemplateHtml();
        console.log("Compiling the template with Handlebars");
        const template = hb.compile(templateHtml, { strict: true });
        const html = template(data);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ printBackground: true, format: 'A4', landscape: true }); // Generate PDF buffer
        await browser.close();
        console.log("PDF Generated");
        return pdfBuffer; // Return the PDF buffer
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error to handle it in the caller function
    }
}

async function uploadToCloudinaryimage(pdfBuffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ 
            resource_type: 'auto', // Change to 'auto' or 'image' to store as a PDF file
            folder: 'certificates',
            format: 'png'
        }, (error, result) => {
            if (error) {
                console.error("Error uploading to Cloudinary", error);
                reject(error);
            } else {
                console.log("File uploaded to Cloudinary");
                resolve(result.secure_url);
            }
        });

        // Write the PDF buffer to the Cloudinary upload stream
        uploadStream.end(pdfBuffer);
    });
}

async function uploadToCloudinarypdf(pdfBuffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ 
            resource_type: 'auto', // Change to 'auto' or 'image' to store as a PDF file
            folder: 'certificates',
            format: 'pdf'
        }, (error, result) => {
            if (error) {
                console.error("Error uploading to Cloudinary", error);
                reject(error);
            } else {
                console.log("File uploaded to Cloudinary");
                resolve(result.secure_url);
            }
        });

        // Write the PDF buffer to the Cloudinary upload stream
        uploadStream.end(pdfBuffer);
    });
}


export async function createAndStoreCertificate(userId, trainingId) {
    const date = new Date().toISOString().split('T')[0]; // Format the date as YYYY-MM-DD

    try {
        // Check if the certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, trainingId });
        if (existingCertificate) {
            console.log('Certificate already exists for this user and training.');
            return existingCertificate; // Return the existing certificate if found
        }

        const user = await clerkClient.users.getUser(userId);
        const username = user.username;

        const training = await Training.findById(trainingId);
        const courseName = training.title;

        const data = { username, date, courseName };

        // Generate the PDF
        const pdfBuffer = await generatePdf(data);

        // Upload the PDF buffer to Cloudinary
        const cloudinaryUrl = await uploadToCloudinarypdf(pdfBuffer);
        const cloudinaryUrlImage = await uploadToCloudinaryimage(pdfBuffer);

        // Ensure cloudinaryUrl is valid
        if (!cloudinaryUrl) {
            throw new Error("Error uploading document to Cloudinary");
        }

        if (!cloudinaryUrlImage) {
            throw new Error("Error uploading document to Cloudinary");
        }

        // Create and save the certificate record in MongoDB
        const newCertificate = new Certificate({
            trainingId: trainingId, // Adjust as necessary
            userId: userId,
            issueDate: new Date(),
            document: cloudinaryUrl, // Use the secure URL provided by Cloudinary
            image: cloudinaryUrlImage
        });

        await newCertificate.save();
        console.log("Certificate saved to MongoDB");
        return newCertificate; // Return the new certificate
    } catch (err) {
        console.error("Error creating and storing certificate", err);
    }
}

// Controller to get all certificates by user ID
export const getCertificatesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Fetch all certificates for the given userId
        const certificates = await Certificate.find({ userId });

        if (!certificates || certificates.length === 0) {
            return res.status(404).json({ message: "No certificates found for this user." });
        }

        // Fetch all training titles with associated quizId
        const trainingIdsWithQuizIds = certificates.map(cert => cert.trainingId);
        const trainings = await Training.find({ _id: { $in: trainingIdsWithQuizIds } }, 'title quiz');
        
        // Create a mapping of trainingId to quizId
        const trainingQuizMap = {};
        trainings.forEach(training => {
            trainingQuizMap[training._id] = { title: training.title, quiz: training.quiz };
        });

        // Fetch grades for each training based on userId
        const certificatesWithGrades = await Promise.all(certificates.map(async cert => {
            const { title, quiz } = trainingQuizMap[cert.trainingId];
            const quizId = quiz;
            const userQuiz = await UserQuiz.findOne({ userId, quizId });
            const grade = userQuiz ? userQuiz.grade : null;
            return {
                ...cert.toObject(),
                trainingTitle: title, // Add training title
                trainingQuizId: quizId,
                grade: grade
            };
        }));

        res.status(200).json(certificatesWithGrades);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        res.status(500).json({ message: "Server error while fetching certificates." });
    }
};

export const getCertificateIdByTrainingIdAndUserId = async (req, res) => {
    try {
        const { trainingId, userId } = req.params;

        // Find the certificate by trainingId and userId
        const certificate = await Certificate.findOne({ trainingId, userId });

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found." });
        }

        // Respond with the certificate ID
        res.status(200).json({ certificateId: certificate._id });
    } catch (error) {
        console.error("Error fetching certificate:", error);
        res.status(500).json({ message: "Server error while fetching certificate." });
    }
};








