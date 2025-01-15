import { appointmentModel } from '../Models/appointment.model.js'
import { petModel } from '../Models/pet.model.js'

const createAppointment = async (req, res) => {
  try {
    const { service_id, pet_id, pet_owner_id, schedule_id, problem, date_request } = req.body
    const userId = req.user.id

    if (!service_id || (!pet_id && !pet_owner_id) || !schedule_id || !date_request) {
      return res.status(400).json({
        ok: false,
        msg: 'Faltan campos requeridos: service_id, (pet_id o pet_owner_id), schedule_id, date_request'
      })
    }

    let petOwnerId = pet_owner_id;

    // Si se proporciona pet_id, obtenemos el pet_owner_id
    if (pet_id && !pet_owner_id) {
      const petOwner = await petModel.getPetOwner(userId, pet_id)
      if (!petOwner) {
        return res.status(404).json({
          ok: false,
          msg: 'No se encontró la relación entre el usuario y la mascota'
        })
      }
      petOwnerId = petOwner.id
    }

    // Verificar que el pet_owner_id pertenece al usuario autenticado
    if (petOwnerId) {
      const petOwner = await petModel.getPetOwnerById(petOwnerId)
      if (!petOwner) {
        return res.status(404).json({
          ok: false,
          msg: 'No se encontró el pet_owner_id especificado'
        })
      }
      
      console.log('petOwner:', petOwner);
      console.log('userId:', userId);
      
      if (petOwner.user_id !== userId) {
        return res.status(403).json({
          ok: false,
          msg: 'No tienes permiso para crear una cita con este pet_owner_id'
        })
      }
    }

    const newAppointment = await appointmentModel.create({
      service_id,
      pet_owner_id: petOwnerId,
      schedule_id,
      problem,
      date_request
    })

    return res.status(201).json({
      ok: true,
      msg: 'Cita creada exitosamente',
      appointment: newAppointment
    })
  } catch (error) {
    console.error('Error en createAppointment:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
      error: error.message
    })
  }
}

const getAllAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.findAll()
        return res.json({
            ok: true,
            appointments
        })
    } catch (error) {
        console.error('Error en getAllAppointments:', error)
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params
        const appointment = await appointmentModel.findOneById(id)

        if (!appointment) {
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada'
            })
        }

        return res.json({
            ok: true,
            appointment
        })
    } catch (error) {
        console.error('Error en getAppointmentById:', error)
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const { service_id, pet_owner_id, schedule_id, problem, date_request } = req.body

        const updatedAppointment = await appointmentModel.update(id, {
            service_id,
            pet_owner_id,
            schedule_id,
            problem,
            date_request
        })

        if (!updatedAppointment) {
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada'
            })
        }

        return res.json({
            ok: true,
            msg: 'Cita actualizada exitosamente',
            appointment: updatedAppointment
        })
    } catch (error) {
        console.error('Error en updateAppointment:', error)
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const deletedAppointment = await appointmentModel.remove(id)

        if (!deletedAppointment) {
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada'
            })
        }

        return res.json({
            ok: true,
            msg: 'Cita eliminada exitosamente',
            appointment: deletedAppointment
        })
    } catch (error) {
        console.error('Error en deleteAppointment:', error)
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

const getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const appointments = await appointmentModel.findByUserId(userId);
        
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron citas para este usuario'
            });
        }
        
        // Process appointments to include status
        const processedAppointments = appointments.map(appointment => ({
            ...appointment,
            status: getAppointmentStatus(appointment.date_request)
        }));

        return res.json({
            ok: true,
            appointments: processedAppointments
        });
    } catch (error) {
        console.error('Error in getUserAppointments:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        });
    }
}

// Helper function to determine appointment status
const getAppointmentStatus = (dateRequest) => {
    const now = new Date();
    const appointmentDate = new Date(dateRequest);
    
    if (appointmentDate > now) {
        return 'Pendiente';
    } else if (appointmentDate.toDateString() === now.toDateString()) {
        return 'En curso';
    } else {
        return 'Completada';
    }
}

const getWorkerAppointments = async (req, res) => {
    try {
        const workerId = req.user.id
        const appointments = await appointmentModel.findByWorkerId(workerId)
        
        res.json({
            ok: true,
            appointments
        })
    } catch (error) {
        console.error('Error en getWorkerAppointments:', error)
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}

const confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const workerId = req.user.id

        const confirmedAppointment = await appointmentModel.confirmAppointment(id, workerId)

        if (!confirmedAppointment) {
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada o ya confirmada'
            })
        }

        // Crear una nueva consulta basada en la cita confirmada
        const newConsultation = await consultationModel.create({
            appointment_id: confirmedAppointment.id,
        })

        res.json({
            ok: true,
            msg: 'Cita confirmada y consulta creada exitosamente',
            appointment: confirmedAppointment,
            consultation: newConsultation
        })
    } catch (error) {
        console.error('Error en confirmAppointment:', error)
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        })
    }
}


export const appointmentController = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getUserAppointments,
  confirmAppointment,
  getWorkerAppointments
}

