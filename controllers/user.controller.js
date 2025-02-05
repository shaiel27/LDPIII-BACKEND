import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserModel } from "../Models/user.model.js"
import { workerModel } from "../Models/worker.model.js"
import { petModel } from "../Models/pet.model.js"

const register = async (req, res) => {
  try {
    const { first_name, last_name, telephone_number, email, location, password, security_word } = req.body

    if (!first_name || !last_name || !email || !password || !security_word) {
      return res.status(400).json({
        ok: false,
        msg: "Missing required fields: first_name, last_name, email, password and security_word are mandatory",
      })
    }
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        msg: "Password must be at least 6 characters long",
      })
    }

    const existingUser = await UserModel.findOneByEmail(email)
    if (existingUser) return res.status(400).json({ ok: false, message: "Email already exists" })

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = await UserModel.create({
      first_name,
      last_name,
      telephone_number,
      email,
      location,
      password: hashedPassword,
      security_word,
    })

    if (!newUser) {
      return res.status(500).json({
        ok: false,
        msg: "Error creating user",
      })
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    const expiration = new Date(Date.now() + 3600000) // 1 hour from now
    await UserModel.saveLoginToken(newUser.id, token, expiration)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    })

    const { password: _, ...userWithoutPassword } = newUser
    return res.status(201).json({
      ok: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Error in register:", error)
    return res.status(500).json({
      ok: false,
      msg: "Server error",
      error: error.message,
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await UserModel.findOneByEmail(email)
    if (!user) {
      return res.status(400).json({ ok: false, message: "Email o contraseña inválidos" })
    }

    const validPassword = await bcryptjs.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ ok: false, message: "Email o contraseña inválidos" })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    )

    const expiration = new Date(Date.now() + 3600000) // 1 hora desde ahora
    await UserModel.saveLoginToken(user.id, token, expiration)

    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header("Access-Control-Allow-Credentials", "true")

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        permissions: user.permissions,
        permission_name: user.permission_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ ok: false, message: "Error del servidor" })
  }
}

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: "No token provided" })
    }

    const [bearer, token] = authHeader.split(" ")
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, message: "Invalid token format" })
    }

    const user = await UserModel.findUserByLoginToken(token)

    if (!user) {
      return res.status(403).json({ ok: false, message: "Invalid token" })
    }

    await UserModel.clearLoginToken(user.id)

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })

    return res.json({ ok: true, message: "Sesión cerrada exitosamente" })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return res.status(500).json({ ok: false, message: "Error al cerrar sesión" })
  }
}

const profile = async (req, res) => {
  try {
    const userId = req.user.id
    console.log("Fetching profile for user ID:", userId)

    const user = await UserModel.findUserById(userId)
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" })
    }

    const { password: _, ...userWithoutPassword } = user
    return res.json({
      ok: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error in profile:", error)
    return res.status(500).json({ ok: false, msg: "Server error" })
  }
}

const listUsers = async (req, res) => {
  try {
    console.log("Fetching list of users")
    const users = await UserModel.findAll()
    console.log("Number of users found:", users.length)
    return res.json({ ok: true, users })
  } catch (error) {
    console.error("Error in listUsers:", error)
    return res.status(500).json({
      ok: false,
      msg: "Server error",
      error: error.message,
    })
  }
}

const getUserPets = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: "No token provided" })
    }

    const [bearer, token] = authHeader.split(" ")
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, message: "Invalid token format" })
    }

    const user = await UserModel.findUserByLoginToken(token)
    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid token" })
    }

    const pets = await petModel.getPetsByUserId(user.id)
    return res.json({ ok: true, pets })
  } catch (error) {
    console.error("Error in getUserPets:", error)
    return res.status(500).json({ ok: false, msg: "Server error" })
  }
}

const updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: "No token provided" })
    }

    const [bearer, token] = authHeader.split(" ")
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, message: "Invalid token format" })
    }

    const user = await UserModel.findUserByLoginToken(token)
    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid token" })
    }

    const { first_name, last_name, telephone_number, location, security_word } = req.body

    const updatedUser = await UserModel.updateProfile(user.id, {
      first_name,
      last_name,
      telephone_number,
      location,
      security_word,
    })

    if (!updatedUser) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      })
    }

    return res.json({
      ok: true,
      msg: "Perfil actualizado exitosamente",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error in updateProfile:", error)
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const recoverPassword = async (req, res) => {
  try {
    const { email, security_word, new_password } = req.body

    if (!email || !security_word || !new_password) {
      return res.status(400).json({
        ok: false,
        msg: "Missing required fields: email, security_word, and new_password are mandatory",
      })
    }

    const user = await UserModel.findOneByEmailAndSecurityWord(email, security_word)

    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "User not found or security word is incorrect",
      })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(new_password, salt)

    await UserModel.updatePassword(user.id, hashedPassword)

    // Clear any existing login token
    await UserModel.clearLoginToken(user.id)

    return res.json({
      ok: true,
      msg: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error in recoverPassword:", error)
    return res.status(500).json({
      ok: false,
      msg: "Server error",
      error: error.message,
    })
  }
}

const removeUser = async (req, res) => {
  try {
    const { id } = req.params
    const removedUser = await UserModel.removeUser(id)
    if (!removedUser) {
      return res.status(404).json({
        ok: false,
        msg: "User not found",
      })
    }
    return res.json({
      ok: true,
      msg: "User removed successfully",
      user: removedUser,
    })
  } catch (error) {
    console.error("Error in removeUser:", error)
    return res.status(500).json({
      ok: false,
      msg: "Server error",
      error: error.message,
    })
  }
}

const searchByName = async (req, res) => {
  try {
    const { name } = req.query
    const users = await UserModel.searchByName(name)
    return res.json({ ok: true, users })
  } catch (error) {
    console.error("Error in searchByName:", error)
    return res.status(500).json({
      ok: false,
      msg: "Server error",
      error: error.message,
    })
  }
}

export const UserController = {
  register,
  login,
  logout,
  profile,
  listUsers,
  getUserPets,
  updateProfile,
  recoverPassword,
  removeUser,
  searchByName,
}

