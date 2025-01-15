import { petModel } from "../Models/pet.model.js";

const register = async (req, res) => {
  try {
    const { name, fk_breed, color, sex, date_birth } = req.body;
    const userId = req.user.id;

    if (!name || !fk_breed || !color || !sex || !date_birth) {
      return res.status(400).json({
        ok: false,
        msg: 'Todos los campos son requeridos: name, fk_breed, color, sex, date_birth'
      });
    }

    const newPet = await petModel.create({
      name,
      fk_breed,
      color,
      sex,
      date_birth: new Date(date_birth)
    });

    if (!newPet || !newPet.id) {
      throw new Error('Error al crear la mascota');
    }

    const petOwner = await petModel.createPetOwner(userId, newPet.id);

    if (!petOwner) {
      throw new Error('Error al asociar la mascota con el usuario');
    }

    return res.status(201).json({
      ok: true,
      msg: 'Mascota registrada y asociada exitosamente',
      pet: newPet,
      petOwner: petOwner
    });

  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
      error: error.message
    });
  }
};

const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const medicalHistory = await petModel.getMedicalHistoryByUserId(userId);

    return res.status(200).json({
      ok: true,
      medicalHistory
    });

  } catch (error) {
    console.error('Error en getMedicalHistory:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
      error: error.message
    });
  }
};

const getAllMedicalHistories = async (req, res) => {
  try {
    const allMedicalHistories = await petModel.getAllMedicalHistories();

    return res.status(200).json({
      ok: true,
      allMedicalHistories
    });

  } catch (error) {
    console.error('Error en getAllMedicalHistories:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
      error: error.message
    });
  }
};

const getUserPets = async (req, res) => {
  try {
    const userId = req.user.id;
    const pets = await petModel.getPetsByUserId(userId);
    return res.json({ ok: true, pets });
  } catch (error) {
    console.error("Error in getUserPets:", error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

export const petController = {
  register,
  getMedicalHistory,
  getAllMedicalHistories,
  getUserPets
};

