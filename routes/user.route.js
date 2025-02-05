import express from "express"
import { UserController } from "../controllers/user.controller.js"
import { verifyToken, verifyAdmin } from "../Middlewares/jwt.middleware.js"
import cors from "cors"


const router = express.Router()

router.options("*", cors())

router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.post("/logout", verifyToken, UserController.logout)
router.get("/profile", verifyToken, UserController.profile)
router.get("/list", verifyToken, verifyAdmin, UserController.listUsers)
router.put("/profile", verifyToken, UserController.updateProfile)
router.get("/pets", verifyToken, UserController.getUserPets)
router.post("/recover-password", UserController.recoverPassword)
router.delete("/remove/:id", verifyToken, verifyAdmin, UserController.removeUser)
router.get("/search", verifyToken, verifyAdmin, UserController.searchByName)

export default router

