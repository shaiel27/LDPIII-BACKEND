import express from 'express'
import { consultationController } from '../controllers/consultation.controller.js'
import { verifyToken, verifyWorker } from '../Middlewares/jwt.middleware.js'

const router = express.Router()

// Obtener todas las consultas del usuario autenticado
router.get('/user', verifyToken, consultationController.getUserConsultations)

// Obtener una consulta específica por ID
router.get('/:id', verifyToken, consultationController.getConsultationById)

// Actualizar una consulta (solo trabajadores)
router.put('/:id', verifyToken, verifyWorker, consultationController.updateConsultation)

export default router

