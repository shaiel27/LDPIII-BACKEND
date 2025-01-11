import 'dotenv/config'
import express from 'express';

import userRouter from './routes/user.route.js'

import petRouter from './routes/pet.route.js'

import	workerRouter from './routes/worker.route.js'

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended:true }))

//usuarios
app.use('/api/v1/user',userRouter)

//mascotas
app.use('/api/v1/pet',petRouter)

//tranajadores
app.use('/api/v1/worker',workerRouter)

const PORT= process.env.PORT ||3001;

app.listen(PORT,()=>console.log('Servidor andando en '+PORT))