import { db } from '../database/connection.database.js'

const create = async ({ name, fk_breed, color, sex, date_birth }) => {
  try {
      const query = {
          text: `
          INSERT INTO pet (name, fk_breed, color, sex, date_birth)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
          `,
          values: [name, fk_breed, color, sex, date_birth]
      }
      const { rows } = await db.query(query)
      return rows[0]
  } catch (error) {
      console.error('Error in create:', error);
      throw error;
  }
}

const createPetOwner = async (userId, petId) => {
  try {
      // Primero, obtenemos el máximo id actual
      const getMaxIdQuery = {
          text: 'SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM pet_owners'
      }
      const { rows: [{ next_id }] } = await db.query(getMaxIdQuery)

      const query = {
          text: `
          INSERT INTO pet_owners (id, user_id, pet_id)
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          values: [next_id, userId, petId]
      }
      const { rows } = await db.query(query)
      return rows[0]
  } catch (error) {
      console.error('Error in createPetOwner:', error);
      throw error;
  }
}

const findOneById = async (id) => {
  try {
      const query = {
          text: `
          SELECT p.*, b.name as breed_name, s.name as species_name
          FROM pet p
          JOIN breed b ON p.fk_breed = b.id
          JOIN specie s ON b.fk_specie = s.id
          WHERE p.id = $1
          `,
          values: [id]
      }
      const { rows } = await db.query(query)
      return rows[0]
  } catch (error) {
      console.error('Error in findOneById:', error);
      throw error;
  }
}

const getMedicalHistoryByUserId = async (userId) => {
  try {
      const query = {
          text: `
          SELECT mh.*, p.name as pet_name, p.color as pet_color, p.sex as pet_sex,
                 b.name as breed_name, s.name as species_name,
                 c.diagnosis, c.medical_exams, c.remarks, c.price,
                 a.date_request,
                 u.first_name as vet_first_name, u.last_name as vet_last_name
          FROM medical_history mh
          JOIN pet p ON mh.pet_id = p.id
          JOIN breed b ON p.fk_breed = b.id
          JOIN specie s ON b.fk_specie = s.id
          JOIN consultation c ON mh.consultation_id = c.id
          JOIN appointment a ON c.appointment_id = a.id
          JOIN schedule sc ON a.schedule_id = sc.id
          JOIN worker w ON sc.worker_id = w.id
          JOIN "user" u ON w.id = u.id
          JOIN pet_owners po ON p.id = po.pet_id
          WHERE po.user_id = $1
          ORDER BY a.date_request DESC
          `,
          values: [userId]
      }
      const { rows } = await db.query(query)
      return rows
  } catch (error) {
      console.error('Error in getMedicalHistoryByUserId:', error);
      throw error;
  }
}

const getAllMedicalHistories = async () => {
  try {
      const query = `
          SELECT mh.*, p.name as pet_name, p.color as pet_color, p.sex as pet_sex,
                 b.name as breed_name, s.name as species_name,
                 c.diagnosis, c.medical_exams, c.remarks, c.price,
                 a.date_request,
                 u.first_name as vet_first_name, u.last_name as vet_last_name,
                 o.first_name as owner_first_name, o.last_name as owner_last_name
          FROM medical_history mh
          JOIN pet p ON mh.pet_id = p.id
          JOIN breed b ON p.fk_breed = b.id
          JOIN specie s ON b.fk_specie = s.id
          JOIN consultation c ON mh.consultation_id = c.id
          JOIN appointment a ON c.appointment_id = a.id
          JOIN schedule sc ON a.schedule_id = sc.id
          JOIN worker w ON sc.worker_id = w.id
          JOIN "user" u ON w.id = u.id
          JOIN pet_owners po ON p.id = po.pet_id
          JOIN "user" o ON po.user_id = o.id
          ORDER BY a.date_request DESC
      `
      const { rows } = await db.query(query)
      return rows
  } catch (error) {
      console.error('Error in getAllMedicalHistories:', error);
      throw error;
  }
}

const getPetsByUserId = async (userId) => {
  try {
      const query = {
          text: `
          SELECT p.*, b.name as breed_name, s.name as species_name
          FROM pet p
          JOIN pet_owners po ON p.id = po.pet_id
          JOIN breed b ON p.fk_breed = b.id
          JOIN specie s ON b.fk_specie = s.id
          WHERE po.user_id = $1
          `,
          values: [userId]
      }
      const { rows } = await db.query(query)
      return rows
  } catch (error) {
      console.error('Error in getPetsByUserId:', error);
      throw error;
  }
}

const getPetOwner = async (userId, petId) => {
  try {
    const query = {
      text: `
        SELECT po.id, po.user_id, po.pet_id
        FROM pet_owners po
        WHERE po.user_id = $1 AND po.pet_id = $2
      `,
      values: [userId, petId]
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error('Error in getPetOwner:', error);
    throw error;
  }
}

const getPetOwnerById = async (petOwnerId) => {
  try {
    const query = {
      text: `
        SELECT po.id, po.user_id, po.pet_id
        FROM pet_owners po
        WHERE po.id = $1
      `,
      values: [petOwnerId]
    }
    const { rows } = await db.query(query)
    console.log('getPetOwnerById result:', rows[0]);
    return rows[0]
  } catch (error) {
    console.error('Error in getPetOwnerById:', error);
    throw error;
  }
}

export const petModel = {
  create,
  createPetOwner,
  findOneById,
  getMedicalHistoryByUserId,
  getAllMedicalHistories,
  getPetsByUserId,
  getPetOwner,
  getPetOwnerById
}

