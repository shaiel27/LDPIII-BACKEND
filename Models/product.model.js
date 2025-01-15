import { db } from '../database/connection.database.js'

const create = async ({ name, expiration_date, description, price, category_id }) => {
    try {
        const query = {
            text: `
            INSERT INTO product (name, expiration_date, description, price, category_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            values: [name, expiration_date, description, price, category_id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in create product:', error)
        throw error
    }
}

const findAll = async () => {
    try {
        const query = {
            text: `
            SELECT p.*, c.name as category_name, i.quantity, i.status
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            `
        }
        const { rows } = await db.query(query)
        return rows
    } catch (error) {
        console.error('Error in findAll products:', error)
        throw error
    }
}

const findById = async (id) => {
    try {
        const query = {
            text: `
            SELECT p.*, c.name as category_name, i.quantity, i.status
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.id = $1
            `,
            values: [id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in findById product:', error)
        throw error
    }
}

const update = async (id, { name, expiration_date, description, price, category_id }) => {
    try {
        const query = {
            text: `
            UPDATE product
            SET name = COALESCE($2, name),
                expiration_date = COALESCE($3, expiration_date),
                description = COALESCE($4, description),
                price = COALESCE($5, price),
                category_id = COALESCE($6, category_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
            `,
            values: [id, name, expiration_date, description, price, category_id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in update product:', error)
        throw error
    }
}

const remove = async (id) => {
    try {
        const query = {
            text: 'DELETE FROM product WHERE id = $1 RETURNING *',
            values: [id]
        }
        const { rows } = await db.query(query)
        return rows[0]
    } catch (error) {
        console.error('Error in remove product:', error)
        throw error
    }
}

const updateInventory = async (id, quantity, status) => {
    try {
        // Primero, verificamos si ya existe un registro de inventario para este producto
        const checkQuery = {
            text: 'SELECT * FROM inventory WHERE product_id = $1',
            values: [id]
        }
        const { rows } = await db.query(checkQuery)

        let result;
        if (rows.length > 0) {
            // Si existe, actualizamos el registro
            const updateQuery = {
                text: `
                UPDATE inventory
                SET quantity = $2,
                    status = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE product_id = $1
                RETURNING *
                `,
                values: [id, quantity, status]
            }
            result = await db.query(updateQuery)
        } else {
            // Si no existe, creamos un nuevo registro
            const insertQuery = {
                text: `
                INSERT INTO inventory (product_id, quantity, status)
                VALUES ($1, $2, $3)
                RETURNING *
                `,
                values: [id, quantity, status]
            }
            result = await db.query(insertQuery)
        }

        return result.rows[0]
    } catch (error) {
        console.error('Error in updateInventory:', error)
        throw error
    }
}

export const productModel = {
    create,
    findAll,
    findById,
    update,
    remove,
    updateInventory
}

