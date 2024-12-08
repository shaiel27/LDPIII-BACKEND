import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { workerModel } from '../Models/worker.model.js'

const register = async (req, res) => {
  try {
    const {
      id, first_name, last_name, role_id, telephone_number, location, email, password,
      status, gender, emergency_contact_name, emergency_contact_relationship,
      emergency_contact_number, License_number, Years_experience, education, Certifications, date_birth
    } = req.body

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        ok: false,
        msg: 'Missing required fields: first_name, last_name, email, and password are mandatory'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        msg: 'Password must be at least 6 characters long'
      })
    }

    const existingWorker = await workerModel.findOneByEmail(email)
    if (existingWorker) {
      return res.status(409).json({
        ok: false,
        msg: 'Email already exists'
      })
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Create new worker
    const newWorker = await workerModel.create({
      id, first_name, last_name, role_id, telephone_number, location, email,
      password: hashedPassword, status, gender, emergency_contact_name,
      emergency_contact_relationship, emergency_contact_number,
      License_number, Years_experience, education, Certifications, date_birth
    })

    // Generate JWT token
    const token = jwt.sign(
      { email: newWorker.email },
      process.env.jwt_secret,
      { expiresIn: '1h' }
    )

    return res.status(201).json({
      ok: true,
      msg: 'Worker registered successfully',
      token
    })
  } catch (error) {
    console.error('Error in register:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        msg: 'Missing required fields: email and password'
      })
    }

    const worker = await workerModel.findOneByEmail(email)
    if (!worker) {
      return res.status(404).json({
        ok: false,
        msg: 'Worker not found'
      })
    }

    let isMatch = false;

    // Primero, intenta comparar con bcrypt
    try {
      isMatch = await bcryptjs.compare(password, worker.password)
    } catch (error) {
      // Si falla, es posible que la contraseña no esté hasheada
      console.log('bcrypt comparison failed, trying plain text comparison')
    }

    // Si bcrypt falló, compara directamente (asumiendo que las contraseñas antiguas no están hasheadas)
    if (!isMatch) {
      isMatch = (password === worker.password)
    }

    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        msg: 'Invalid credentials'
      })
    }

    // Si la autenticación fue exitosa pero la contraseña no estaba hasheada, actualízala
    if (password === worker.password) {
      const salt = await bcryptjs.genSalt(10)
      const hashedPassword = await bcryptjs.hash(password, salt)
      await workerModel.updatePassword(worker.id, hashedPassword)
    }

    const token = jwt.sign(
      { email: worker.email, role_id: worker.role_id },
      process.env.jwt_secret,
      { expiresIn: '1h' }
    )

    return res.json({
      ok: true,
      msg: 'Login successful',
      token,
      role_id: worker.role_id
    })
  } catch (error) {
    console.error('Error in login:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    })
  }
}

const profile = async (req, res) => {
  try {
    const worker = await workerModel.findOneByEmail(req.email)
    if (!worker) {
      return res.status(404).json({
        ok: false,
        msg: 'Worker not found'
      })
    }

    const { password, ...workerProfile } = worker

    return res.json({
      ok: true,
      msg: 'Profile retrieved successfully',
      worker: workerProfile
    })
  } catch (error) {
    console.error('Error in profile:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    })
  }
}

export const workerController = {
  register,
  login,
  profile
}

