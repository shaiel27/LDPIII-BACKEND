import bcryptjs from 'bcryptjs'
import { workerModel } from "../Models/worker.model.js"
import { UserModel } from "../Models/user.model.js"

const register = async (req, res) => {
    try {
        const { id, first_name, last_name, email, password, telephone_number, role_id, status, date_birth, location, gender, license_number, years_experience, education, certifications } = req.body

        if (!id || !first_name || !last_name || !email || !password || !role_id || !status) {
            return res.status(400).json({
                msg: 'Missing required fields'
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        // First, create the user
        const newUser = await UserModel.create({
            id,
            first_name,
            last_name,
            telephone_number,
            email,
            password: hashedPassword,
            permissions: 2, // Assuming 2 is for workers
            location
        })

        if (!newUser) {
            return res.status(500).json({
                msg: 'Error creating user'
            })
        }

        // Then, create the worker
        const newWorker = await workerModel.create({
            id,
            role_id,
            status,
            date_birth,
            location,
            gender,
            license_number,
            years_experience,
            education,
            certifications
        })

        return res.status(201).json({
            msg: 'Worker registered successfully',
            worker: {
                id: newWorker.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role_id: newWorker.role_id
            }
        })
    } catch (error) {
        console.error('Error in register:', error)
        if (error.constraint === 'user_email_key') {
            return res.status(409).json({
                msg: 'Email already exists'
            })
        }
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        })
    }
}

const findAll = async (req, res) => {
    try {
        const workers = await workerModel.findAll()
        return res.json({ ok: true, workers })
    } catch (error) {
        console.error('Error in findAll:', error)
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        })
    }
}

const updateRoleVet = async (req, res) => {
    try {
        const { id } = req.params
        const updatedWorker = await workerModel.updateRoleVet(id)
        if (!updatedWorker) {
            return res.status(404).json({
                msg: 'Worker not found'
            })
        }
        return res.json({
            ok: true,
            msg: 'Worker role updated to veterinarian',
            worker: updatedWorker
        })
    } catch (error) {
        console.error('Error in updateRoleVet:', error)
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        })
    }
}

const updateWorker = async (req, res) => {
    try {
        const { id } = req.params
        const { 
            first_name, last_name, email, telephone_number, location, // User fields
            role_id, status, date_birth, gender, license_number, years_experience, education, certifications // Worker fields
        } = req.body

        // Update user information
        const updatedUser = await UserModel.updateProfile(id, {
            first_name,
            last_name,
            telephone_number,
            location
        })

        if (!updatedUser) {
            return res.status(404).json({
                msg: 'User not found'
            })
        }

        // Update worker information
        const updatedWorker = await workerModel.update(id, {
            role_id,
            status,
            date_birth,
            gender,
            license_number,
            years_experience,
            education,
            certifications
        })

        if (!updatedWorker) {
            return res.status(404).json({
                msg: 'Worker not found'
            })
        }

        return res.json({
            ok: true,
            msg: 'Worker updated successfully',
            worker: {
                ...updatedUser,
                ...updatedWorker
            }
        })
    } catch (error) {
        console.error('Error in updateWorker:', error)
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        })
    }
}

const deleteWorker = async (req, res) => {
    try {
        const { id } = req.params

        const result = await workerModel.remove(id)

        if (!result) {
            return res.status(404).json({
                msg: 'Worker not found'
            })
        }

        return res.json({
            ok: true,
            msg: 'Worker deleted successfully',
            id: result.id
        })
    } catch (error) {
        console.error('Error in deleteWorker:', error)
        return res.status(500).json({
            msg: 'Server error',
            error: error.message
        })
    }
}

const findWorkerById = async (req, res) => {
    try {
        const { id } = req.params
        const worker = await workerModel.findOneById(id)

        if (!worker) {
            return res.status(404).json({
                ok: false,
                msg: 'Trabajador no encontrado'
            })
        }

        // Estructurar la respuesta para separar los datos de worker y user
        const response = {
            ok: true,
            worker: {
                id: worker.id,
                role_id: worker.role_id,
                role_name: worker.role_name,
                status: worker.status,
                date_birth: worker.date_birth,
                location: worker.location,
                gender: worker.gender,
                license_number: worker.license_number,
                years_experience: worker.years_experience,
                education: worker.education,
                certifications: worker.certifications,
                created_at: worker.created_at,
                updated_at: worker.updated_at
            },
            user: {
                id: worker.id,
                first_name: worker.first_name,
                last_name: worker.last_name,
                email: worker.email,
                telephone_number: worker.telephone_number,
                permissions: worker.permissions,
                permission_name: worker.permission_name,
                location: worker.user_location,
                created_at: worker.user_created_at,
                updated_at: worker.user_updated_at
            }
        }

        return res.json(response)
    } catch (error) {
        console.error('Error en findWorkerById:', error)
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}


export const workerController = {
    register,
    findAll,
    updateRoleVet,
    updateWorker,
    deleteWorker,
    findWorkerById
}

