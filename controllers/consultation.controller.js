import { consultationModel } from "../Models/consultation.model.js"
import { verifyToken, verifyWorker } from "../Middlewares/jwt.middleware.js"

const getUserConsultations = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const userId = req.user.id
      const consultations = await consultationModel.findByUserId(userId)

      if (!consultations || consultations.length === 0) {
        return res.status(404).json({
          ok: false,
          msg: "No se encontraron consultas para este usuario",
        })
      }

      const processedConsultations = consultations.map((consultation) => ({
        ...consultation,
        status: getAppointmentStatus(consultation.date_request),
      }))

      res.json({
        ok: true,
        consultations: processedConsultations,
      })
    })
  } catch (error) {
    console.error("Error in getUserConsultations:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getConsultationById = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const { id } = req.params
      const consultation = await consultationModel.findById(id)

      if (!consultation) {
        return res.status(404).json({
          ok: false,
          msg: "Consulta no encontrada",
        })
      }

      if (consultation.user_id !== req.user.id) {
        return res.status(403).json({
          ok: false,
          msg: "No tienes permiso para ver esta consulta",
        })
      }

      res.json({
        ok: true,
        consultation,
      })
    })
  } catch (error) {
    console.error("Error in getConsultationById:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const updateConsultation = async (req, res) => {
  try {
    verifyWorker(req, res, async () => {
      const { id } = req.params
      const { diagnosis, medical_exams, remarks, treatment_id, price, utensils } = req.body

      const updatedConsultation = await consultationModel.update(id, {
        diagnosis,
        medical_exams,
        remarks,
        treatment_id,
        price,
        utensils,
      })

      if (!updatedConsultation) {
        return res.status(404).json({
          ok: false,
          msg: "Consulta no encontrada",
        })
      }

      res.json({
        ok: true,
        msg: "Consulta actualizada exitosamente",
        consultation: updatedConsultation,
      })
    })
  } catch (error) {
    console.error("Error en updateConsultation:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getAppointmentStatus = (dateRequest) => {
  const now = new Date()
  const appointmentDate = new Date(dateRequest)

  if (appointmentDate > now) {
    return "Pendiente"
  } else if (appointmentDate.toDateString() === now.toDateString()) {
    return "En curso"
  } else {
    return "Completada"
  }
}

export const consultationController = {
  getUserConsultations,
  getConsultationById,
  updateConsultation,
}

