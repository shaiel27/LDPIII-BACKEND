import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from "../Models/user.model.js"
import { workerModel } from "../Models/worker.model.js"
import { petModel } from "../Models/pet.model.js"

const register = async (req, res) => {
  try {
    const { first_name, last_name, telephone_number, email, location, password } = req.body

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        ok: false,
        msg: 'Missing required fields: first_name, last_name, email and password are mandatory'
      })
    }
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        msg: 'Password must be at least 6 characters long'
      })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = await UserModel.create({
      first_name,
      last_name,
      telephone_number,
      email,
      location,
      password: hashedPassword
    })

    if (!newUser) {
      return res.status(500).json({
        ok: false,
        msg: 'Error creating user'
      })
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return res.status(201).json({
      ok: true,
      token
    })
  } catch (error) {
    console.error('Error in register:', error)
    if (error.constraint === 'user_email_key') {
      return res.status(409).json({
        ok: false,
        msg: 'Email already exists'
      })
    }
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    })
  }
}



const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields: email, password" });
    }

    console.log(`Login attempt for email: ${email}`);

    console.log('Attempting to find user:', email);
    let user = await UserModel.findOneByEmail(email);
    console.log('User found:', user);
    let isWorker = false

    if (!user) {
      console.log(`User not found in users table, searching in workers table`);
      user = await workerModel.findOneByEmail(email)
      isWorker = true
    }

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`User found: ${user.id}`);

    if (user) {
      console.log('Comparing passwords');
      const isMatch = await bcryptjs.compare(password, user.password);
      console.log('Password match:', isMatch);
      if (!isMatch) {
        console.log(`Incorrect password for user: ${user.id}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }


    console.log(`Successful login for user: ${user.id}`);

    let role;
    if (user.permission_name === 'Admin') {
      role = 'admin';
    } else if (user.permission_name === 'Vet' || isWorker) {
      role = 'worker';
    } else {
      role = 'user';
    }

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email, 
        role: role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    console.log('Generated token:', token);
    console.log('User role:', role);

    return res.json({
      ok: true,
      token,
      role: role,
      permissions: user.permissions
    })
  } catch (error) {
    console.error("Error in login:", error)
    return res.status(500).json({ ok: false, msg: 'Server error' })
  }
}

const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    res.clearCookie('role');
    res.clearCookie('permissions');

    return res.json({
      ok: true,
      msg: 'Logout successful'
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await UserModel.findOneById(req.user.id)
    if (!user) {
      const worker = await workerModel.findOneById(req.user.id)
      if (!worker) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ ok: true, user: worker, role: 'worker' })
    }
    return res.json({ ok: true, user, })
  } catch (error) {
    console.error("Error in profile:", error)
    return res.status(500).json({ ok: false, msg: 'Server error' })
  }
}

const listUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll()
    return res.json({ ok: true, users })
  } catch (error) {
    console.error('Error in listUsers:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
      error: error.message
    })
  }
}

const getUserPets = async (req, res) => {
  try {
    const userId = req.user.id;
    const pets = await petModel.getPetsByUserId(userId);
    return res.json({ ok: true, pets });
  } catch (error) {
    console.error("Error in getUserPets:", error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
}
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, telephone_number, location } = req.body;

    const updatedUser = await UserModel.updateProfile(userId, {
      first_name,
      last_name,
      telephone_number,
      location
    });

    if (!updatedUser) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    return res.json({
      ok: true,
      msg: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
      error: error.message
    });
  }
}


export const UserController = {
  register,
  login,
  logout,
  profile,
  listUsers,
  getUserPets,
  updateProfile
}

