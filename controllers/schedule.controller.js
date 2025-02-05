import { scheduleModel } from "../Models/schedule.model.js"

const createSchedule = async (req, res) => {
  try {
    const { workerId } = req.params
    const schedule = req.body
    const newSchedule = await scheduleModel.create(workerId, schedule)
    res.status(201).json({ ok: true, schedule: newSchedule })
  } catch (error) {
    console.error("Error in createSchedule:", error)
    res.status(500).json({ ok: false, message: "Error del servidor" })
  }
}

const getSchedule = async (req, res) => {
  try {
    const { workerId } = req.params
    const schedule = await scheduleModel.findByWorkerId(workerId)
    if (!schedule) {
      return res.status(404).json({ ok: false, message: "Horario no encontrado" })
    }
    res.json({ ok: true, schedule })
  } catch (error) {
    console.error("Error in getSchedule:", error)
    res.status(500).json({ ok: false, message: "Error del servidor" })
  }
}

const updateSchedule = async (req, res) => {
  try {
    const { workerId } = req.params
    const schedule = req.body
    const updatedSchedule = await scheduleModel.update(workerId, schedule)
    if (!updatedSchedule) {
      return res.status(404).json({ ok: false, message: "Horario no encontrado" })
    }
    res.json({ ok: true, schedule: updatedSchedule })
  } catch (error) {
    console.error("Error in updateSchedule:", error)
    res.status(500).json({ ok: false, message: "Error del servidor" })
  }
}

export const scheduleController = {
  createSchedule,
  getSchedule,
  updateSchedule,
}

