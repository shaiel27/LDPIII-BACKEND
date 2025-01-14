import { db } from '../database/connection.database.js'

const create = async ({ id, role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications }) => {
    const query = {
        text: `
        INSERT INTO worker (id, role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
        `,
        values: [id, role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications]
    }

    try {
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in create worker:', error);
        throw error;
    }
}

const findOneById = async (id) => {
    const query = {
        text: `
        SELECT w.*, u.first_name, u.last_name, u.email, u.telephone_number, 
               u.permissions, u.location as user_location, u.created_at as user_created_at, 
               u.updated_at as user_updated_at, p.permission_name, r.role_name
        FROM worker w
        JOIN "user" u ON w.id = u.id
        LEFT JOIN permissions p ON u.permissions = p.id
        LEFT JOIN role r ON w.role_id = r.id
        WHERE w.id = $1
        `,
        values: [id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const findOneByEmail = async (email) => {
    const query = {
        text: `
        SELECT w.*, u.first_name, u.last_name, u.email, u.telephone_number, p.permission_name, r.role_name
        FROM worker w
        JOIN "user" u ON w.id = u.id
        LEFT JOIN permissions p ON u.permissions = p.id
        LEFT JOIN role r ON w.role_id = r.id
        WHERE u.email = $1
        `,
        values: [email]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const findAll = async () => {
    const query = {
        text: `
        SELECT w.*, u.first_name, u.last_name, u.email, u.telephone_number, p.permission_name, r.role_name
        FROM worker w
        JOIN "user" u ON w.id = u.id
        LEFT JOIN permissions p ON u.permissions = p.id
        LEFT JOIN role r ON w.role_id = r.id
        `
    }
    const { rows } = await db.query(query)
    return rows
}

const updateRoleVet = async (id) => {
    const query = {
        text: `
        UPDATE worker
        SET role_id = (SELECT id FROM role WHERE role_name = 'Vet')
        WHERE id = $1
        RETURNING *
        `,
        values: [id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const update = async (id, { role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications }) => {
    try {
        const query = {
            text: `
            UPDATE worker
            SET role_id = COALESCE($2, role_id),
                status = COALESCE($3, status),
                date_birth = COALESCE($4, date_birth),
                location = COALESCE($5, location),
                gender = COALESCE($6, gender),
                license_number = COALESCE($7, license_number),
                years_experience = COALESCE($8, years_experience),
                education = COALESCE($9, education),
                certifications = COALESCE($10, certifications),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
            `,
            values: [id, role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in update worker:', error);
        throw error;
    }
}

const remove = async (id) => {
    try {
        // Start a transaction
        await db.query('BEGIN')

        // Delete from worker table
        const workerQuery = {
            text: 'DELETE FROM worker WHERE id = $1 RETURNING id',
            values: [id]
        }
        const workerResult = await db.query(workerQuery)

        if (workerResult.rows.length === 0) {
            throw new Error('Worker not found')
        }

        // Delete from user table
        const userQuery = {
            text: 'DELETE FROM "user" WHERE id = $1',
            values: [id]
        }
        await db.query(userQuery)

        // Commit the transaction
        await db.query('COMMIT')

        return { id: workerResult.rows[0].id }
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK')
        console.error('Error in remove worker:', error);
        throw error;
    }
}

export const workerModel = {
    create,
    findOneById,
    findOneByEmail,
    findAll,
    updateRoleVet,
    update,
    remove
}

