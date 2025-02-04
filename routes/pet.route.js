import { Router } from "express"
import { petController } from "../controllers/pet.controller.js"
import { verifyToken, verifyAdmin } from "../Middlewares/jwt.middleware.js"

const router = Router()

// Rutas existentes
router.post("/register", verifyToken, petController.register)
router.get("/medical-history", verifyToken, petController.getMedicalHistory)
router.get("/all-medical-histories", verifyToken, petController.getAllMedicalHistories)
router.get("/user-pets", verifyToken, petController.getUserPets)

// Nuevas rutas para administradores
router.get("/all", verifyAdmin, petController.getAllPets)
router.get("/:id", verifyAdmin, petController.getPetDetailsById)

export default router

