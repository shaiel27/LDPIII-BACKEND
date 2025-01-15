import express from 'express'
import { UserController } from '../controllers/user.controller.js'
import { verifyToken, verifyAdmin } from '../Middlewares/jwt.middleware.js'

const router = express.Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/logout', verifyToken, UserController.logout)
router.get('/profile', verifyToken, UserController.profile)
router.get('/list', verifyToken, verifyAdmin, UserController.listUsers)
router.put('/profile', verifyToken, UserController.updateProfile)
router.get('/pets', verifyToken, UserController.getUserPets)

export default router

