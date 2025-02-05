import express from "express"
import { scheduleController } from "../controllers/schedule.controller.js"
import { verifyToken, verifyAdmin, verifyWorker } from "../Middlewares/jwt.middleware.js"

const router = express.Router()

// Rutas que requieren autenticación de administrador o trabajador
router.get("/:workerId", verifyToken, verifyWorker, scheduleController.getSchedule)
router.put("/:workerId", verifyToken, verifyWorker, scheduleController.updateSchedule)

// Ruta que requiere autenticación de administrador
router.post("/:workerId", verifyToken, verifyAdmin, scheduleController.createSchedule)

export default router

