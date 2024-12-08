import { db } from '../database/connection.database.js'

const create = async ({id, first_name, last_name, telephone_number, email, location, password }) => {
    try {
        const query = {
            text: `
            INSERT INTO "user" (id,first_name, last_name, telephone_number, email, location, password)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, first_name, last_name
            `,
            values: [id,first_name, last_name, telephone_number, email, location, password]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in create:', error);
        throw error;
    }
}

const findOneByEmail = async (email) => {
    try {
        const query = {
            text: `
            SELECT * FROM "user"
            WHERE email = $1
            `,
            values: [email]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error en findOneByEmail:', error);
        throw error;
    }
}

export const UserModel = {
    create,
    findOneByEmail
}

