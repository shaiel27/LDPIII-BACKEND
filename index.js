import express from "express"
import cors from "cors"
import "dotenv/config"

import userRouter from "./routes/user.route.js"
import petRouter from "./routes/pet.route.js"
import workerRouter from "./routes/worker.route.js"
import appointmentRouter from "./routes/appointment.route.js"
import consultationRouter from "./routes/consultation.route.js"
import productRouter from "./routes/product.route.js"
import scheduleRouter from "./routes/schedule.route.js"

const app = express()

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
}

// Apply CORS middleware
app.use(cors(corsOptions))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/pets", petRouter)
app.use("/api/v1/workers", workerRouter)
app.use("/api/v1/appointments", appointmentRouter)
app.use("/api/v1/consultations", consultationRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/schedules", scheduleRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`))

