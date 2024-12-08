import { Router } from "express";
import { workerController } from "../controllers/worker.controller.js";
import { verifyAdmin, verifyToken } from "../Middlewares/jwt.middleware.js";

const router = Router()

// api/v1/workers

router.post('/register', workerController.register)
router.post('/login', workerController.login)
router.get('/profile', verifyToken, workerController.profile)

// Admin
router.get('/', verifyToken, verifyAdmin, workerController.findAll)
router.put('/update-role-vet/:uid', verifyToken, verifyAdmin, workerController.updateRoleVet)

export default router;

