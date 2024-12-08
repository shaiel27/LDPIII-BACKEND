import { petModel } from "../Models/pet.model.js";

const register = async (req, res) => {
  try {
    const { id, name, fk_breed, color, sex, date_birth } = req.body;

    // Validate required fields
    if (!id || !name || !fk_breed || !color || !sex || !date_birth) {
      return res.status(400).json({
        ok: false,
        msg: 'All fields are required'
      });
    }

    // Check if pet with the given id already exists
    const existingPet = await petModel.findOneById(id);
    if (existingPet) {
      return res.status(409).json({
        ok: false,
        msg: 'Pet with this ID already exists'
      });
    }

    // Create new pet
    const newPet = await petModel.create({
      id,
      name,
      fk_breed,
      color,
      sex,
      date_birth
    });

    // Return success response
    return res.status(201).json({
      ok: true,
      msg: 'Pet registered successfully',
      pet: newPet
    });

  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    });
  }
};

export const petController = {
  register
};

