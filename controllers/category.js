import Category from '../modules/category.js'

// Create Category
export const createCategory = async (req, res) => {
  const { title } = req.body;

  try {
    const newCategory = new Category({ title });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating category' });
  }
};

// Find All Categories
export const findAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

// Find Category by ID
export const findCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching category' });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { title }, { new: true, runValidators: true });
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating category' });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting category' });
  }
};
