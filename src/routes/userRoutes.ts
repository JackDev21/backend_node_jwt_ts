import express, { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/usersController"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "default-secret"

// Middleware to authenticate the token
const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden" })
    }
    next()
  })
}

router.post("/", createUser)
router.get("/", authenticateToken, getAllUsers)
router.get("/:id", authenticateToken, getUserById)
router.put("/:id", authenticateToken, updateUser)
router.delete("/:id", authenticateToken, deleteUser)

export default router
