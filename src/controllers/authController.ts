import { Request, Response } from "express"
import { comparePasswords, hashPassword } from "../services/password.service"
import prisma from "../models/user"
import { generateToken } from "../services/auth.services"

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email) {
    res.status(400).json({ error: "Email is required" })
    return
  }

  try {
    if (!password) {
      throw new Error("Password is required")
    }
    if (!email) {
      throw new Error("Email is required")
    }

    const hashedPassword = await hashPassword(password)
    console.log(hashedPassword)

    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    const token = generateToken(user)
    res.status(201).json({ token })
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already exists" })
      return
    }

    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    const user = await prisma.findUnique({ where: { email } })
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" })
      return
    }

    const passwordMatch = await comparePasswords(password, user.password)

    if (!passwordMatch) {
      res.status(401).json({ error: "Password and user does not match" })
      return
    }

    const token = generateToken(user)
    res.status(201).json({ token })
  } catch (error: any) {
    if (!email) {
      res.status(400).json({ error: "Email is required" })
      return
    }
    if (!password) {
      res.status(400).json({ error: "Password is required" })
      return
    }
  }
}
