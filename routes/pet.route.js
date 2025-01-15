import { Router } from "express"
import { petController } from "../controllers/pet.controller.js"
import { verifyToken, verifyAdmin } from "../Middlewares/jwt.middleware.js"

const router = Router()

router.post('/register', verifyToken, petController.register)
router.get('/medical-history', verifyToken, petController.getMedicalHistory)
router.get('/all-medical-histories', verifyToken, verifyAdmin, petController.getAllMedicalHistories)
router.get('/user', verifyToken, petController.getUserPets)

export default router

