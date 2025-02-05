import { db } from "../database/connection.database.js"

const create = async (workerId, schedule) => {
  try {
    const query = {
      text: `INSERT INTO schedule (worker_id, monday, tuesday, wednesday, thursday, friday)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      values: [workerId, schedule.monday, schedule.tuesday, schedule.wednesday, schedule.thursday, schedule.friday],
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error("No schedule was created")
    }
    return rows[0]
  } catch (error) {
    console.error("Error in create schedule:", error)
    throw error
  }
}

const getAll = async () => {
  try {
    const query = {
      text: "SELECT * FROM schedule",
    }
    const { rows } = await db.query(query)
    return rows
  } catch (error) {
    console.error("Error getting all schedules:", error)
    throw error
  }
}

const getById = async (id) => {
  try {
    const query = {
      text: "SELECT * FROM schedule WHERE id = $1",
      values: [id],
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error(`Schedule with ID ${id} not found`)
    }
    return rows[0]
  } catch (error) {
    console.error(`Error getting schedule with ID ${id}:`, error)
    throw error
  }
}

const updateById = async (id, schedule) => {
  try {
    const query = {
      text: `UPDATE schedule SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5
             WHERE id = $6
             RETURNING *`,
      values: [schedule.monday, schedule.tuesday, schedule.wednesday, schedule.thursday, schedule.friday, id],
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error(`Schedule with ID ${id} not found`)
    }
    return rows[0]
  } catch (error) {
    console.error(`Error updating schedule with ID ${id}:`, error)
    throw error
  }
}

const deleteById = async (id) => {
  try {
    const query = {
      text: "DELETE FROM schedule WHERE id = $1",
      values: [id],
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error(`Schedule with ID ${id} not found`)
    }
    return rows[0]
  } catch (error) {
    console.error(`Error deleting schedule with ID ${id}:`, error)
    throw error
  }
}

export const scheduleModel = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
}

