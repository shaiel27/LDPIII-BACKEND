import express from 'express'
import { consultationController } from '../controllers/consultation.controller.js'
import { verifyToken } from '../Middlewares/jwt.middleware.js'

const router = express.Router()

router.get('/user', verifyToken, consultationController.getUserConsultations)
router.get('/:id', verifyToken, consultationController.getConsultationById)

export default router

