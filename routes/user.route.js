import {Router} from "express"
import { UserController } from "../controllers/user.controller.js"
import { verifytoken } from "../Middlewares/jwt.middleware.js"

const router = Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/profile', verifytoken, UserController.profile)
router.get('/list', verifytoken, UserController.listUsers)

export default router;

