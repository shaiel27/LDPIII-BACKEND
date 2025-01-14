import { Router } from "express"
import { petController } from "../controllers/pet.controller.js"
import { verifyToken } from "../Middlewares/jwt.middleware.js"

const router = Router()

router.post('/register', verifyToken, petController.register)

export default router

