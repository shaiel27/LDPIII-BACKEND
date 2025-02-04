import { db } from "../database/connection.database.js"

const getNextPetOwnerId = async () => {
  try {
    const query = {
      text: "SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM pet_owners",
    }
    const {
      rows: [{ next_id }],
    } = await db.query(query)
    return next_id
  } catch (error) {
    console.error("Error in getNextPetOwnerId:", error)
    throw error
  }
}

const create = async ({ name, fk_breed, color, sex, date_birth }) => {
  try {
    const query = {
      text: `
        INSERT INTO pet (name, fk_breed, color, sex, date_birth)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      values: [name, fk_breed, color, sex, date_birth],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in create:", error)
    throw error
  }
}

const createPetOwner = async ({ id, user_id, pet_id }) => {
  try {
    console.log("Executing createPetOwner query with values:", [id, user_id, pet_id])
    const query = {
      text: `
        INSERT INTO pet_owners (id, user_id, pet_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      values: [id, user_id, pet_id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in createPetOwner:", error)
    throw error
  }
}

const getAllPets = async () => {
  try {
    const query = `
      SELECT 
        p.*,
        b.name as breed_name,
        s.name as species_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        po.user_id as owner_id
      FROM pet p
      LEFT JOIN breed b ON p.fk_breed = b.id
      LEFT JOIN specie s ON b.fk_specie = s.id
      LEFT JOIN pet_owners po ON p.id = po.pet_id
      LEFT JOIN "user" u ON po.user_id = u.id
      ORDER BY p.created_at DESC
    `
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error in getAllPets:", error)
    throw error
  }
}

const getPetDetailsById = async (id) => {
  try {
    const query = {
      text: `
        SELECT 
          p.*,
          b.name as breed_name,
          s.name as species_name,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name,
          u.email as owner_email,
          u.telephone_number as owner_phone,
          po.user_id as owner_id
        FROM pet p
        LEFT JOIN breed b ON p.fk_breed = b.id
        LEFT JOIN specie s ON b.fk_specie = s.id
        LEFT JOIN pet_owners po ON p.id = po.pet_id
        LEFT JOIN "user" u ON po.user_id = u.id
        WHERE p.id = $1
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in getPetDetailsById:", error)
    throw error
  }
}

const findOneById = async (id) => {
  try {
    const query = {
      text: `
        SELECT p.*, po.user_id as owner_id
        FROM pet p
        LEFT JOIN pet_owners po ON p.id = po.pet_id
        WHERE p.id = $1
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in findOneById:", error)
    throw error
  }
}

const getMedicalHistoryByUserId = async (userId) => {
  try {
    const query = {
      text: `
        SELECT 
          mh.*,
          p.name as pet_name,
          p.color as pet_color,
          p.sex as pet_sex,
          b.name as breed_name,
          s.name as species_name,
          c.diagnosis,
          c.medical_exams,
          c.remarks,
          c.price,
          a.date_request
        FROM medical_history mh
        JOIN pet p ON mh.pet_id = p.id
        JOIN breed b ON p.fk_breed = b.id
        JOIN specie s ON b.fk_specie = s.id
        JOIN consultation c ON mh.consultation_id = c.id
        JOIN appointment a ON c.appointment_id = a.id
        JOIN pet_owners po ON p.id = po.pet_id
        WHERE po.user_id = $1
        ORDER BY a.date_request DESC
      `,
      values: [userId],
    }
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error in getMedicalHistoryByUserId:", error)
    throw error
  }
}

const getPetsByUserId = async (userId) => {
  try {
    const query = {
      text: `
        SELECT 
          p.*,
          b.name as breed_name,
          s.name as species_name
        FROM pet p
        JOIN pet_owners po ON p.id = po.pet_id
        JOIN breed b ON p.fk_breed = b.id
        JOIN specie s ON b.fk_specie = s.id
        WHERE po.user_id = $1
        ORDER BY p.created_at DESC
      `,
      values: [userId],
    }
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error in getPetsByUserId:", error)
    throw error
  }
}

const getPetOwner = async (userId, petId) => {
  try {
    const query = {
      text: `
        SELECT po.*
        FROM pet_owners po
        WHERE po.user_id = $1 AND po.pet_id = $2
      `,
      values: [userId, petId],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in getPetOwner:", error)
    throw error
  }
}

const getPetOwnerById = async (id) => {
  try {
    const query = {
      text: `
        SELECT po.*, u.first_name, u.last_name, u.email
        FROM pet_owners po
        JOIN "user" u ON po.user_id = u.id
        WHERE po.id = $1
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in getPetOwnerById:", error)
    throw error
  }
}

export const petModel = {
  create,
  createPetOwner,
  getNextPetOwnerId,
  getAllPets,
  getPetDetailsById,
  findOneById,
  getMedicalHistoryByUserId,
  getPetsByUserId,
  getPetOwner,
  getPetOwnerById,
}

