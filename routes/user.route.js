import {Router} from "express"
import { UserController } from "../controllers/user.controller.js"
import { verifyToken } from "../Middlewares/jwt.middleware.js"

const router = Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/profile', verifyToken, UserController.profile)
router.get('/list', verifyToken, UserController.listUsers)

export default router;

