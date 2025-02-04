import express from "express"
import { workerController } from "../Controllers/worker.controller.js"
import { verifyToken, verifyAdmin, verifyWorker } from "../Middlewares/jwt.middleware.js"

const router = express.Router()

// Rutas que requieren autenticación de administrador
router.post("/register", verifyToken, verifyAdmin, workerController.register)
router.get("/all", verifyToken, verifyAdmin, workerController.findAll)
router.put("/:id/role/vet", verifyToken, verifyAdmin, workerController.updateRoleVet)
router.put("/:id", verifyToken, verifyAdmin, workerController.updateWorker)
router.delete("/:id", verifyToken, verifyAdmin, workerController.deleteWorker)

// Rutas que requieren autenticación de trabajador o administrador
router.get("/:id", verifyToken, verifyWorker, workerController.findWorkerById)
router.get("/info", verifyToken, verifyWorker, workerController.getWorkerInfo)

export default router

