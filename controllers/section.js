import cloudinary from '../utils/cloudinary.js';
import ffmpeg from 'fluent-ffmpeg';
import Section from '../modules/section.js';
import TrainingModule from '../modules/trainingModule.js';


// Helper function to compress and upload video to Cloudinary
const compressAndUploadVideo = async (tempPath, title) => {
    await new Promise((resolve, reject) => {
        ffmpeg(tempPath)
            .fps(10)
            .addOptions(["-crf 35"])
            .saveToFile(`./temp/compressed_${title}.mp4`)
            .on('end', resolve)
            .on('error', reject)
    });

    // Upload the compressed video to Cloudinary
    const videoUpload = await cloudinary.uploader.upload(
        `./temp/compressed_${title}.mp4`,
        {
            resource_type: "video",
        }
    );

    return videoUpload;
};

// Controller to create new section
export const createSection = async (request, response) => {

    const moduleId = request.body.moduleId;

     // Find the module
     const module = await TrainingModule.findById(moduleId);
     if (!module) {
         return response.status(404).json({ success: false, message: 'Module not found' });
     }

    console.log('Start of processing...');
    try {
        // Check if a video file has been uploaded in the request
        if (!request.file) {
            throw new Error('No video file found in the request');
        }
        console.log(request.file);
        // Temporary path for the compressed video
        const tempPath = request.file.path;
        console.log('Temporary file path:', tempPath);

        const videoUpload = await compressAndUploadVideo(tempPath, request.body.title);

        console.log(request.body.title);
        console.log(videoUpload);

        // Create the new section
        const newSection = new Section({
            title: request.body.title,
            videoUrl: videoUpload.secure_url
        });

        await newSection.save();

        // Add the section to the module
        module.sections.push(newSection._id);
        await module.save();

        // Send a response to the client
        response.status(201).json({ message: 'Section created successfully', id: newSection.id });
    } catch (error) {
        console.error('Error creating section:', error);
        response.status(400).json({ message: error.message });
    }
};

// Controller to update a section
export const updateSection = async (request, response) => {
    try {
        const { id } = request.params; // Get the section ID from the request params
        const sectionDataToUpdate = request.body; // Get the updated section data from the request body

        // Check if a new video file has been uploaded in the request
        if (request.file) {
            // Temporary path for the compressed video
            const tempPath = request.file.path;

            // Compress and upload the new video to Cloudinary
            const videoUpload = await compressAndUploadVideo(tempPath, sectionDataToUpdate.title);

            // Update the videoUrl in the section data
            sectionDataToUpdate.videoUrl = videoUpload.secure_url;
        }

        // Update the section
        const updatedSection = await Section.findByIdAndUpdate(id, sectionDataToUpdate, { new: true });

        if (!updatedSection) {
            return response.status(404).json({ success: false, message: 'Section not found' });
        }

        // Send a response to the client
        response.status(200).json({ message: 'Section updated successfully', updatedSection });
    } catch (error) {
        console.error('Error updating section:', error);
        response.status(400).json({ message: error.message });
    }
};

// Controller to delete section
export const deleteSection = async (request, response) => {
    try {
        const { id } = request.params;

        //Find section by ID
        const section = await Section.findById(id);

        if (!section) {
            return response.status(404).send("Section not found");
        }

        // Delete the module itself
        await section.deleteOne();

        // Remove the section ID from the 'section' array in the Module document
        await TrainingModule.updateMany({ sections: section._id }, { $pull: { sections: section._id } });

        return response.status(200).send("Section was deleted successfully");
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
};