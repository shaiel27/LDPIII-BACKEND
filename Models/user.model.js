import { db } from "../database/connection.database.js"

const create = async ({ first_name, last_name, telephone_number, email, password, location, security_word }) => {
  try {
    const getMaxIdQuery = {
      text: 'SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM "user"',
    }
    const {
      rows: [{ next_id }],
    } = await db.query(getMaxIdQuery)

    const query = {
      text: `
            INSERT INTO "user" (id, first_name, last_name, telephone_number, email, password, permissions, location, security_word)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, email, first_name, last_name, telephone_number, location, permissions
            `,
      values: [next_id, first_name, last_name, telephone_number, email, password, 3, location, security_word],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in create:", error)
    throw error
  }
}

const findOneByEmail = async (email) => {
  try {
    const query = {
      text: `
        SELECT u.*, p.permission_name
        FROM "user" u
        LEFT JOIN permissions p ON u.permissions = p.id
        WHERE u.email = $1
      `,
      values: [email],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in findOneByEmail:", error)
    throw error
  }
}

const findOneById = async (id) => {
  try {
    const query = {
      text: `
            SELECT u.*, p.permission_name
            FROM "user" u
            LEFT JOIN permissions p ON u.permissions = p.id
            WHERE u.id = $1
            `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in findOneById:", error)
    throw error
  }
}

const findAll = async () => {
  try {
    const query = {
      text: `
            SELECT u.id, u.first_name, u.last_name, u.email, 
                   u.telephone_number, u.location, u.created_at,
                   p.permission_name
            FROM "user" u
            LEFT JOIN permissions p ON u.permissions = p.id
            ORDER BY u.id
            `,
    }
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error in findAll:", error)
    throw error
  }
}

const updatePassword = async (id, hashedPassword) => {
  try {
    const query = {
      text: `
            UPDATE "user"
            SET password = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, email
            `,
      values: [hashedPassword, id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in updatePassword:", error)
    throw error
  }
}

const updateProfile = async (id, { first_name, last_name, telephone_number, location, security_word }) => {
  try {
    const query = {
      text: `
              UPDATE "user"
              SET first_name = COALESCE($1, first_name),
                  last_name = COALESCE($2, last_name),
                  telephone_number = COALESCE($3, telephone_number),
                  location = COALESCE($4, location),
                  security_word = COALESCE($5, security_word),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $6
              RETURNING id, first_name, last_name, email, telephone_number, location, security_word
              `,
      values: [first_name, last_name, telephone_number, location, security_word, id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in updateProfile:", error)
    throw error
  }
}

//para el dashboard
const getUserCount = async () => {
  try {
    const query = {
      text: `SELECT COUNT(*) as user_count FROM "user" WHERE permissions = 3`,
    }
    const { rows } = await db.query(query)
    return rows[0].user_count
  } catch (error) {
    console.error("Error in getUserCount:", error)
    throw error
  }
}

const findOneByEmailAndSecurityWord = async (email, security_word) => {
  try {
    const query = {
      text: `
            SELECT u.*, p.permission_name
            FROM "user" u
            LEFT JOIN permissions p ON u.permissions = p.id
            WHERE u.email = $1 AND u.security_word = $2
            `,
      values: [email, security_word],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in findOneByEmailAndSecurityWord:", error)
    throw error
  }
}

const removeUser = async (id) => {
  try {
    const query = {
      text: `
        DELETE FROM "user"
        WHERE id = $1
        RETURNING id
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in removeUser:", error)
    throw error
  }
}

const searchByName = async (name) => {
  try {
    const query = {
      text: `
        SELECT u.id, u.first_name, u.last_name, u.email, 
               u.telephone_number, u.location, u.created_at,
               p.permission_name
        FROM "user" u
        LEFT JOIN permissions p ON u.permissions = p.id
        WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1
        ORDER BY u.id
      `,
      values: [`%${name}%`],
    }
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error in searchByName:", error)
    throw error
  }
}

const saveLoginToken = async (id, token, expiration) => {
  try {
    const query = {
      text: 'UPDATE "user" SET user_token = $1, login_token_expiration = $2 WHERE id = $3',
      values: [token, expiration, id],
    }
    await db.query(query)
  } catch (error) {
    console.error("Error in saveLoginToken:", error)
    throw error
  }
}

const findUserByLoginToken = async (token) => {
  try {
    const query = {
      text: `
        SELECT u.*, p.permission_name
        FROM "user" u
        LEFT JOIN permissions p ON u.permissions = p.id
        WHERE u.user_token = $1 AND u.login_token_expiration > NOW()
      `,
      values: [token],
    }
    const { rows } = await db.query(query)
    return rows[0]
  } catch (error) {
    console.error("Error in findUserByLoginToken:", error)
    throw error
  }
}


const clearLoginToken = async (id) => {
  try {
    const query = {
      text: 'UPDATE "user" SET user_token = NULL, login_token_expiration = NULL WHERE id = $1',
      values: [id],
    }
    await db.query(query)
  } catch (error) {
    console.error("Error in clearLoginToken:", error)
    throw error
  }
}
const findUserById = async (id) => {
  try {
    const query = {
      text: `
        SELECT u.*, p.permission_name
        FROM "user" u
        LEFT JOIN permissions p ON u.permissions = p.id
        WHERE u.id = $1
      `,
      values: [id],
    }
    const { rows } = await db.query(query)
    console.log("Query result:", rows); // Añade este log
    return rows[0]
  } catch (error) {
    console.error("Error in findUserById:", error)
    throw error
  }
}

export const UserModel = {
    create,
    findOneByEmail,
    findOneById,
    findAll,
    updatePassword,
    updateProfile,
    getUserCount,
    findOneByEmailAndSecurityWord,
    removeUser,
    searchByName,
    saveLoginToken,
    findUserByLoginToken,
    clearLoginToken,
    findUserById,
  }

