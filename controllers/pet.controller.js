import { petModel } from "../Models/pet.model.js";

const register = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        ok: false,
        msg: 'Usuario no autenticado'
      });
    }

    const { name, fk_breed, color, sex, date_birth } = req.body;
    const userId = req.user.id;

    // Validación de campos requeridos
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

export const petController = {
  register
};

