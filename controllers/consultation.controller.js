import { consultationModel } from '../Models/consultation.model.js'

const getUserConsultations = async (req, res) => {
    try {
        const userId = req.user.id;
        const consultations = await consultationModel.findByUserId(userId);
        
        if (!consultations || consultations.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron consultas para este usuario'
            });
        }

        // Procesamos las consultas para incluir el estado
        const processedConsultations = consultations.map(consultation => ({
            ...consultation,
            status: getAppointmentStatus(consultation.date_request)
        }));

        res.json({
            ok: true,
            consultations: processedConsultations
        });
    } catch (error) {
        console.error('Error in getUserConsultations:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        });
    }
}

const getConsultationById = async (req, res) => {
    try {
        const { id } = req.params;
        const consultation = await consultationModel.findById(id);
        
        if (!consultation) {
            return res.status(404).json({
                ok: false,
                msg: 'Consulta no encontrada'
            });
        }

        // Verificar si la consulta pertenece al usuario logueado
        if (consultation.user_id !== req.user.id) {
            return res.status(403).json({
                ok: false,
                msg: 'No tienes permiso para ver esta consulta'
            });
        }

        res.json({
            ok: true,
            consultation
        });
    } catch (error) {
        console.error('Error in getConsultationById:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
            error: error.message
        });
    }
}

// Función auxiliar para determinar el estado de la cita
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

export const consultationController = {
    getUserConsultations,
    getConsultationById
}

