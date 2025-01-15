import { db } from '../database/connection.database.js'

const findByUserId = async (userId) => {
    try {
        const query = {
            text: `
            SELECT c.*, a.date_request, p.name as pet_name, p.color as pet_color, p.sex as pet_sex, 
                   b.name as breed_name, s.name as species_name,
                   u.first_name as vet_first_name, u.last_name as vet_last_name,
                   t.name as treatment_name, t.details as treatment_details, t.price as treatment_price,
                   sv.name as service_name
            FROM consultation c
            JOIN appointment a ON c.appointment_id = a.id
            JOIN pet_owners po ON a.pet_owner_id = po.id
            JOIN pet p ON po.pet_id = p.id
            JOIN breed b ON p.fk_breed = b.id
            JOIN specie s ON b.fk_specie = s.id
            JOIN schedule sc ON a.schedule_id = sc.id
            JOIN worker w ON sc.worker_id = w.id
            JOIN "user" u ON w.id = u.id
            LEFT JOIN treatment t ON c.treatment_id = t.id
            JOIN service sv ON a.service_id = sv.id
            WHERE po.user_id = $1
            ORDER BY a.date_request DESC
            `,
            values: [userId]
        }
        const { rows } = await db.query(query)
        return rows
    } catch (error) {
        console.error('Error in findByUserId:', error)
        throw error
    }
}

const findById = async (id) => {
    try {
        const query = {
            text: `
            SELECT c.*, a.date_request, p.name as pet_name, p.color as pet_color, p.sex as pet_sex, 
                   b.name as breed_name, s.name as species_name,
                   u.first_name as vet_first_name, u.last_name as vet_last_name,
                   t.name as treatment_name, t.details as treatment_details, t.price as treatment_price
            FROM consultation c
            JOIN appointment a ON c.appointment_id = a.id
            JOIN pet_owners po ON a.pet_owner_id = po.id
            JOIN pet p ON po.pet_id = p.id
            JOIN breed b ON p.fk_breed = b.id
            JOIN specie s ON b.fk_specie = s.id
            JOIN schedule sc ON a.schedule_id = sc.id
            JOIN worker w ON sc.worker_id = w.id
            JOIN "user" u ON w.id = u.id
            LEFT JOIN treatment t ON c.treatment_id = t.id
            WHERE c.id = $1
            `,
            values: [id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in findById:', error)
        throw error
    }
}

const create = async ({ appointment_id, diagnosis = null, medical_exams = null, remarks = null, treatment_id = null, price = null, utensils = null }) => {
    try {
        const query = {
            text: `
            INSERT INTO consultation (appointment_id, diagnosis, medical_exams, remarks, treatment_id, price, utensils)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
            values: [appointment_id, diagnosis, medical_exams, remarks, treatment_id, price, utensils]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in create consultation:', error)
        throw error
    }
}

const update = async (id, { diagnosis, medical_exams, remarks, treatment_id, price, utensils }) => {
    try {
        const query = {
            text: `
            UPDATE consultation
            SET diagnosis = COALESCE($2, diagnosis),
                medical_exams = COALESCE($3, medical_exams),
                remarks = COALESCE($4, remarks),
                treatment_id = COALESCE($5, treatment_id),
                price = COALESCE($6, price),
                utensils = COALESCE($7, utensils)
            WHERE id = $1
            RETURNING *
            `,
            values: [id, diagnosis, medical_exams, remarks, treatment_id, price, utensils]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in update consultation:', error)
        throw error
    }
}

export const consultationModel = {
    findByUserId,
    findById,
    create,
    update
}

