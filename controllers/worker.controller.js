import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { workerModel } from '../Models/worker.model.js'

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role_id, telephone_number, location, status, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth } = req.body

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ ok: false, msg: "Missing required fields: first_name, last_name, email, password" })
        }

        const worker = await workerModel.findOneByEmail(email)
        if (worker) {
            return res.status(409).json({ ok: false, msg: "Email already exists" })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newWorker = await workerModel.create({ 
            first_name, 
            last_name, 
            email, 
            password: hashedPassword, 
            role_id, 
            telephone_number, 
            location, 
            status, 
            gender, 
            emergency_contact_name, 
            emergency_contact_relationship, 
            emergency_contact_number, 
            License_number, 
            Years_experience, 
            education, 
            Certifications, 
            date_birth 
        })

        const token = jwt.sign({ email: newWorker.email, role_id: newWorker.role_id },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )

        return res.status(201).json({
            ok: true,
            msg: {
                token, role_id: newWorker.role_id
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Missing required fields: email, password" });
        }

        const worker = await workerModel.findOneByEmail(email)
        if (!worker) {
            return res.status(404).json({ error: "Worker not found" });
        }

        const isMatch = await bcryptjs.compare(password, worker.password)

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ email: worker.email, role_id: worker.role_id },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )

        return res.json({
            ok: true, msg: {
                token, role_id: worker.role_id
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}

const profile = async (req, res) => {
    try {
        const worker = await workerModel.findOneByEmail(req.email)
        return res.json({ ok: true, msg: worker })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}

const findAll = async (req, res) => {
    try {
        const workers = await workerModel.findAll()
        return res.json({ ok: true, msg: workers })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}

const updateRoleVet = async (req, res) => {
    try {
        const { uid } = req.params

        const worker = await workerModel.findOneByUid(uid)
        if (!worker) {
            return res.status(404).json({ error: "Worker not found" });
        }

        const updatedWorker = await workerModel.updateRoleVet(uid)

        return res.json({
            ok: true,
            msg: updatedWorker
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}

export const workerController = {
    register,
    login,
    profile,
    findAll,
    updateRoleVet
}

