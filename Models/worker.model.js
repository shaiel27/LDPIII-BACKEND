import { db } from '../database/connection.database.js'

const create = async ({id, first_name, last_name, role_id, telephone_number, location, email, password, status, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth }) => {
    try {
        const query = {
            text: `
            INSERT INTO "worker" ("id", "first_name", "last_name", "role_id", "telephone_number", "location", "email", "password", "status", "gender", "emergency_contact_name", "emergency_contact_relationship", "emergency_contact_number", "License_number", "Years_experience", "education", "Certifications", "date_birth")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
            `,
            values: [id, first_name, last_name, role_id, telephone_number, location, email, password, status, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth]
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
            SELECT * FROM "worker"
            WHERE "email" = $1
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

export const workerModel = {
    create,
    findOneByEmail
}

