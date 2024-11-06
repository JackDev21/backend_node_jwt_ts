import { Request, Response } from "express"
import { hashPassword } from "../services/password.service"
import prisma from "../models/user"

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email) {
      res.status(400).json({ error: "Email is required" })
      return
    }
    if (!password) {
      res.status(400).json({ error: "Password is required" })
      return
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    res.status(201).json(user)
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already exists" })
      return
    }

    res.status(500).json({ error: "Internal Server Error, check later" })
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.findMany()
    res.status(200).json(users)
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error, check later" })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id)

  try {
    const user = await prisma.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    res.status(200).json(user)
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error, check later" })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id)
  const { password, email } = req.body

  try {
    let dataToUpdate: any = { ...req.body }

    if (password) {
      const hashedPassword = await hashPassword(password)
      dataToUpdate.password = hashedPassword
    }

    if (email) {
      dataToUpdate.email = email
    }

    const user = await prisma.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
    })

    res.status(200).json(user)
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({ error: "Email already exists" })
      return
    } else if (error?.code === "P2025") {
      res.status(404).json({ error: "User not found" })
      return
    } else {
      res.status(500).json({ error: "Internal Server Error, check later" })
    }
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id)

  try {
    await prisma.delete({
      where: {
        id: userId,
      },
    })

    res.status(200).json({ message: "User deleted" }).end()
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error, check later" })
  }
}
