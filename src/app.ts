import "dotenv/config"
import express from "express"
import authRoutes from "./routes/authRoutes"
import usersRoutes from "./routes/userRoutes"

const app = express()

app.use(express.json())

// Routes

// Authentication
app.use("/auth", authRoutes)

// User
app.use("/users", usersRoutes)

console.log("Server is running on port 3000")

export default app
