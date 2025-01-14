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
            SELECT * FROM pet
            WHERE id = $1
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

export const petModel = {
    create,
    createPetOwner,
    findOneById
}

