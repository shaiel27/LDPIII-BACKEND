import {Router} from "express"
import { petController } from "../controllers/pet.controller.js"

const router = Router()

router.post('/register', petController.register)

export default router;