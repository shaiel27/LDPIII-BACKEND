import {Router} from "express"
import { workerController } from "../controllers/worker.controller.js"
import { verifytoken } from "../Middlewares/jwt.middleware.js"

const router = Router()
router.post('/register', workerController.register)
router.post('/login',workerController.login)
router.get('/profile',verifytoken,workerController.profile)

export default router;