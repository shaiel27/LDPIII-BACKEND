import { petModel } from "../Models/pet.model.js"
import { verifyToken, verifyAdmin } from "../Middlewares/jwt.middleware.js"
import { db } from "../database/connection.database.js"

const register = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const { name, fk_breed, color, sex, date_birth } = req.body
      const userId = req.user.id  // Asegúrate de que esto esté disponible desde el middleware de autenticación

      if (!name || !fk_breed || !color || !sex || !date_birth) {
        return res.status(400).json({
          ok: false,
          msg: "Todos los campos son requeridos: name, fk_breed, color, sex, date_birth",
        })
      }

      // Iniciar transacción
      await db.query("BEGIN")

      try {
        const newPet = await petModel.create({
          name,
          fk_breed,
          color,
          sex,
          date_birth: new Date(date_birth),
        })

        if (!newPet || !newPet.id) {
          throw new Error("Error al crear la mascota")
        }

        // Obtener el siguiente ID para pet_owners
        const nextPetOwnerId = await petModel.getNextPetOwnerId()

        const petOwner = await petModel.createPetOwner({
          id: nextPetOwnerId,
          user_id: userId,  // Usar el ID del usuario logueado
          pet_id: newPet.id,  // Usar el ID de la mascota recién creada
        })

        if (!petOwner) {
          throw new Error("Error al asociar la mascota con el usuario")
        }

        // Confirmar transacción
        await db.query("COMMIT")

        return res.status(201).json({
          ok: true,
          msg: "Mascota registrada y asociada exitosamente",
          pet: newPet,
          petOwner: petOwner,
        })
      } catch (error) {
        // Revertir transacción en caso de error
        await db.query("ROLLBACK")
        throw error
      }
    })
  } catch (error) {
    console.error("Error en register:", error)
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getAllPets = async (req, res) => {
  try {
    verifyAdmin(req, res, async () => {
      const pets = await petModel.getAllPets()
      return res.json({
        ok: true,
        pets,
      })
    })
  } catch (error) {
    console.error("Error in getAllPets:", error)
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getPetDetailsById = async (req, res) => {
  try {
    verifyAdmin(req, res, async () => {
      const { id } = req.params
      const petDetails = await petModel.getPetDetailsById(id)

      if (!petDetails) {
        return res.status(404).json({
          ok: false,
          msg: "Mascota no encontrada",
        })
      }

      return res.json({
        ok: true,
        pet: petDetails,
      })
    })
  } catch (error) {
    console.error("Error in getPetDetailsById:", error)
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getMedicalHistory = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const userId = req.user.id
      const medicalHistory = await petModel.getMedicalHistoryByUserId(userId)

      return res.status(200).json({
        ok: true,
        medicalHistory,
      })
    })
  } catch (error) {
    console.error("Error en getMedicalHistory:", error)
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getAllMedicalHistories = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const allMedicalHistories = await petModel.getAllMedicalHistories()

      return res.status(200).json({
        ok: true,
        allMedicalHistories,
      })
    })
  } catch (error) {
    console.error("Error en getAllMedicalHistories:", error)
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getUserPets = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const userId = req.user.id
      const pets = await petModel.getPetsByUserId(userId)
      return res.json({ ok: true, pets })
    })
  } catch (error) {
    console.error("Error in getUserPets:", error)
    return res.status(500).json({ ok: false, msg: "Server error" })
  }
}

export const petController = {
  register,
  getMedicalHistory,
  getAllMedicalHistories,
  getUserPets,
  getAllPets,
  getPetDetailsById,
}

