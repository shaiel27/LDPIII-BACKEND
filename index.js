import 'dotenv/config'
import express from 'express'

import userRouter from './routes/user.route.js'
import petRouter from './routes/pet.route.js'
import workerRouter from './routes/worker.route.js'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/v1/users', userRouter) 
app.use('/api/v1/pets', petRouter)    
app.use('/api/v1/workers', workerRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`))