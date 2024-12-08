import { db } from '../database/connection.database.js'

const create = async ({ first_name, last_name, role_id, telephone_number, location, email, password, status, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth }) => {
    const query = {
        text: `
        INSERT INTO workers (first_name, last_name, role_id, telephone_number, location, email, password, status, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING email, first_name, last_name, uid, role_id
        `,
        values: [first_name, last_name, role_id, telephone_number, location, email, password, status, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth]
    }

    const { rows } = await db.query(query)
    return rows[0]
}

const findOneByEmail = async (email) => {
    const query = {
        text: `
        SELECT * FROM workers
        WHERE email = $1
        `,
        values: [email]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const findAll = async () => {
    const query = {
        text: `
        SELECT * FROM workers
        `
    }
    const { rows } = await db.query(query)
    return rows
}

const findOneByUid = async (uid) => {
    const query = {
        text: `
        SELECT * FROM workers
        WHERE uid = $1
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const updateRoleVet = async (uid) => {
    const query = {
        text: `
        UPDATE workers
        SET role_id = 2
        WHERE uid = $1
        RETURNING *
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

export const workerModel = {
    create,
    findOneByEmail,
    findAll,
    findOneByUid,
    updateRoleVet
}

