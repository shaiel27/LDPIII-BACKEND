import jwt from "jsonwebtoken"
import { UserModel } from "../Models/user.model.js"

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" })
  }

  const [bearer, token] = authHeader.split(" ")

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de Authorization inválido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await UserModel.findUserByLoginToken(token)

    if (!user) {
      return res.status(401).json({ error: "Token inválido o expirado" })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error("Error in verifyToken:", error)
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" })
    }
    res.status(500).json({ error: "Error en la verificación del token" })
  }
}

export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" })
  }
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Acceso denegado. Solo para administradores." })
  }
  next()
}

export const verifyWorker = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" })
  }
  if (req.user.role !== "Vet") {
    return res.status(403).json({ error: "Acceso denegado. Solo para trabajadores." })
  }
  next()
}

