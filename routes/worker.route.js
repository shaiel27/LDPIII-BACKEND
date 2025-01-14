import express from 'express'
import { workerController } from '../controllers/worker.controller.js'
import { verifyToken, verifyAdmin } from '../Middlewares/jwt.middleware.js'

const router = express.Router()

router.use(verifyToken, verifyAdmin)
router.post('/register', workerController.register)
router.get('/list', workerController.findAll)
router.get('/:id', workerController.findWorkerById)
router.put('/:id/update-role-vet', workerController.updateRoleVet)
router.put('/:id', workerController.updateWorker)
router.delete('/:id', workerController.deleteWorker)

export default router

