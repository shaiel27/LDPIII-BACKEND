import { db } from '../database/connection.database.js'

const create = async ({id, name, fk_breed, color, sex, date_birth}) => {
    try {
        const query = {
            text: `
            INSERT INTO "pet" (id, name, fk_breed, color, sex, date_birth)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            values: [id, name, fk_breed, color, sex, date_birth]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in create:', error);
        throw error;
    }
}

const findOneById = async (id) => {
    try {
        const query = {
            text: `
            SELECT * FROM "pet"
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
    findOneById
}

