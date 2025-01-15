import { db } from '../database/connection.database.js'

const create = async ({ service_id, pet_owner_id, schedule_id, problem, date_request }) => {
    try {
        const query = {
            text: `
            INSERT INTO appointment (service_id, pet_owner_id, schedule_id, problem, date_request)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            values: [service_id, pet_owner_id, schedule_id, problem, date_request]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in create appointment:', error);
        throw error;
    }
}

const findAll = async () => {
    try {
        const query = {
            text: `
            SELECT a.*, s.name as service_name, 
                   po.user_id, u.first_name, u.last_name,
                   sc.date as schedule_date
            FROM appointment a
            LEFT JOIN service s ON a.service_id = s.id
            LEFT JOIN pet_owners po ON a.pet_owner_id = po.id
            LEFT JOIN "user" u ON po.user_id = u.id
            LEFT JOIN schedule sc ON a.schedule_id = sc.id
            ORDER BY a.date_request DESC
            `
        }
        const { rows } = await db.query(query)
        return rows
    } catch (error) {
        console.error('Error in findAll appointments:', error);
        throw error;
    }
}

const findOneById = async (id) => {
    try {
        const query = {
            text: `
            SELECT a.*, s.name as service_name, 
                   po.user_id, u.first_name, u.last_name,
                   sc.date as schedule_date
            FROM appointment a
            LEFT JOIN service s ON a.service_id = s.id
            LEFT JOIN pet_owners po ON a.pet_owner_id = po.id
            LEFT JOIN "user" u ON po.user_id = u.id
            LEFT JOIN schedule sc ON a.schedule_id = sc.id
            WHERE a.id = $1
            `,
            values: [id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in findOneById appointment:', error);
        throw error;
    }
}

const update = async (id, { service_id, pet_owner_id, schedule_id, problem, date_request }) => {
    try {
        const query = {
            text: `
            UPDATE appointment
            SET service_id = COALESCE($2, service_id),
                pet_owner_id = COALESCE($3, pet_owner_id),
                schedule_id = COALESCE($4, schedule_id),
                problem = COALESCE($5, problem),
                date_request = COALESCE($6, date_request)
            WHERE id = $1
            RETURNING *
            `,
            values: [id, service_id, pet_owner_id, schedule_id, problem, date_request]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in update appointment:', error);
        throw error;
    }
}

const remove = async (id) => {
    try {
        const query = {
            text: 'DELETE FROM appointment WHERE id = $1 RETURNING *',
            values: [id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in remove appointment:', error);
        throw error;
    }
}

const findByUserId = async (userId) => {
    try {
        const query = {
            text: `
            SELECT a.*, s.name as service_name, 
                   po.user_id, u.first_name, u.last_name,
                   sc.date as schedule_date
            FROM appointment a
            LEFT JOIN service s ON a.service_id = s.id
            LEFT JOIN pet_owners po ON a.pet_owner_id = po.id
            LEFT JOIN "user" u ON po.user_id = u.id
            LEFT JOIN schedule sc ON a.schedule_id = sc.id
            WHERE po.user_id = $1
            ORDER BY a.date_request DESC
            `,
            values: [userId]
        }
        const { rows } = await db.query(query)
        return rows
    } catch (error) {
        console.error('Error in findByUserId appointments:', error);
        throw error;
    }
}
const getWorkerAppointments = async (req, res) => {
    try {
        const workerId = req.user.id
        const appointments = await appointmentModel.findByWorkerId(workerId)
        
        res.json({
            ok: true,
            appointments
        })
    } catch (error) {
        console.error('Error en getWorkerAppointments:', error)
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

const confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const workerId = req.user.id

        const confirmedAppointment = await appointmentModel.confirmAppointment(id, workerId)

        if (!confirmedAppointment) {
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada o ya confirmada'
            })
        }

        // Crear una nueva consulta basada en la cita confirmada
        const newConsultation = await consultationModel.create({
            appointment_id: confirmedAppointment.id,
        })

        res.json({
            ok: true,
            msg: 'Cita confirmada y consulta creada exitosamente',
            appointment: confirmedAppointment,
            consultation: newConsultation
        })
    } catch (error) {
        console.error('Error en confirmAppointment:', error)
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

export const appointmentModel = {
    create,
    findAll,
    findOneById,
    update,
    remove,
    findByUserId,
    confirmAppointment,
    getWorkerAppointments
}

