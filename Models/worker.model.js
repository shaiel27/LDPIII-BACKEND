import { db } from "../database/connection.database.js"

const create = async (workerData) => {
  try {
    const query = {
      text: `
        INSERT INTO worker (id, role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
      values: [
        workerData.id,
        workerData.role_id,
        workerData.status,
        workerData.date_birth,
        workerData.location,
        workerData.gender,
        workerData.license_number,
        workerData.years_experience,
        workerData.education,
        workerData.certifications,
      ],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in create worker:", error)
    throw error
  }
}

const findOneById = async (id) => {
  try {
    const query = {
      text: `
        SELECT w.*, u.first_name, u.last_name, u.email, u.telephone_number, u.permissions, 
               u.location as user_location, u.created_at as user_created_at, u.updated_at as user_updated_at,
               r.role_name, p.permission_name
        FROM worker w
        JOIN "user" u ON w.id = u.id
        JOIN role r ON w.role_id = r.id
        JOIN permissions p ON u.permissions = p.id
        WHERE w.id = $1
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in findOneById worker:", error)
    throw error
  }
}

const findAll = async () => {
  try {
    const query = {
      text: `
        SELECT w.*, u.first_name, u.last_name, u.email, u.telephone_number, u.permissions, 
               u.location as user_location, u.created_at as user_created_at, u.updated_at as user_updated_at,
               r.role_name, p.permission_name
        FROM worker w
        JOIN "user" u ON w.id = u.id
        JOIN role r ON w.role_id = r.id
        JOIN permissions p ON u.permissions = p.id
      `,
    }
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error in findAll worker:", error)
    throw error
  }
}

const updateRoleVet = async (id) => {
  try {
    const query = {
      text: `
        UPDATE worker 
        SET role_id = (SELECT id FROM role WHERE role_name = 'Veterinario')
        WHERE id = $1
        RETURNING *
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in updateRoleVet worker:", error)
    throw error
  }
}

const update = async (id, workerData) => {
  try {
    const query = {
      text: `
        UPDATE worker SET 
          role_id = COALESCE($1, role_id),
          status = COALESCE($2, status),
          date_birth = COALESCE($3, date_birth),
          location = COALESCE($4, location),
          gender = COALESCE($5, gender),
          license_number = COALESCE($6, license_number),
          years_experience = COALESCE($7, years_experience),
          education = COALESCE($8, education),
          certifications = COALESCE($9, certifications)
        WHERE id = $10
        RETURNING *
      `,
      values: [
        workerData.role_id,
        workerData.status,
        workerData.date_birth,
        workerData.location,
        workerData.gender,
        workerData.license_number,
        workerData.years_experience,
        workerData.education,
        workerData.certifications,
        id,
      ],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in update worker:", error)
    throw error
  }
}

const remove = async (id) => {
  try {
    const query = {
      text: "DELETE FROM worker WHERE id = $1 RETURNING id",
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in remove worker:", error)
    throw error
  }
}

export const workerModel = {
  create,
  findOneById,
  findAll,
  updateRoleVet,
  update,
  remove,
}

