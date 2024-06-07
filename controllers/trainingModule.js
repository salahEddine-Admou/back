import TrainingModule from '../modules/trainingModule.js';
import { Training } from '../modules/training.js';
import Section from '../modules/section.js';

// Controller to create new training module
export const createTrainingModule = async (request, response) => {
    try {

        const trainingId = request.body.trainingId;
        console.log(request.body);
        // Find the training
        const training = await Training.findById(trainingId);
        if (!training) {
            return response.status(404).json({ success: false, message: 'Training not found' });
        }

        // Create a new module
        const newModule = new TrainingModule({
            title: request.body.title,
            sections: []
        });
        await newModule.save();

        // Add the module to the training
        training.modules.push(newModule._id);
        await training.save();

        response.json({ success: true, message: 'Module added to training', moduleId: newModule._id });
    } catch (error) {
        console.error('Error adding module to training:', error);
        response.status(500).json({ success: false, message: 'Error adding module to training' });
    }
}

// Controller for updating the title of a module
export const updateModule = async (request, response) => {
    try {
      const { id } = request.params;
      const { title, quiz } = request.body;
  
      // Find the module by ID
      const module = await TrainingModule.findById(id);
  
      if (!module) {
        return response.status(404).send("Module not found");
      }
  
      // Update the fields if they are provided in the request body
      if (title !== undefined) {
        module.title = title;
      }
      if (quiz !== undefined) {
        module.quiz = quiz;
      }
  
      // Save the updated module
      await module.save();
  
      return response.status(200).send("Module updated successfully");
    } catch (error) {
      response.status(500).send({ message: error.message });
    }
  };

// Controller for deleting a module and its associated sections
export const deleteModuleAndSections = async (request, response) => {
    try {
        const { id } = request.params;

        // Find the module by ID
        const module = await TrainingModule.findById(id);

        if (!module) {
            return response.status(404).send("Module not found");
        }

        // Delete all sections associated with the module
        await Section.deleteMany({ _id: { $in: module.sections } });

        // Delete the module itself
        await module.deleteOne();

        // Remove the module ID from the 'modules' array in the Training document
        await Training.updateMany({ modules: module._id }, { $pull: { modules: module._id } });

        return response.status(200).send("Module and associated sections were deleted successfully");
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
};