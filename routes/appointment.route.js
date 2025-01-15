import express from 'express'
import { appointmentController } from '../controllers/appointment.controller.js'
import { verifyToken, verifyAdmin, verifyWorker } from '../Middlewares/jwt.middleware.js'

const router = express.Router()

// Rutas protegidas (requieren autenticación)
router.use(verifyToken)

// Crear una cita (cualquier usuario autenticado puede crear una cita)
router.post('/', appointmentController.createAppointment)

// Obtener todas las citas (solo admin)
router.get('/', verifyAdmin, appointmentController.getAllAppointments)

// Obtener una cita por ID (el usuario autenticado solo puede ver sus propias citas, el admin puede ver todas)
router.get('/:id', appointmentController.getAppointmentById)

// Obtener todas las citas del usuario autenticado
router.get('/user/all', appointmentController.getUserAppointments)

// Obtener todas las citas del trabajador autenticado
router.get('/worker/all', verifyWorker, appointmentController.getWorkerAppointments)

// Confirmar una cita (solo trabajadores)
router.put('/:id/confirm', verifyWorker, appointmentController.confirmAppointment)

// Actualizar una cita (el usuario autenticado solo puede actualizar sus propias citas, el admin puede actualizar todas)
router.put('/:id', appointmentController.updateAppointment)

// Eliminar una cita (solo admin)
router.delete('/:id', verifyAdmin, appointmentController.deleteAppointment)

export default router

