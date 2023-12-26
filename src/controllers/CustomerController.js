import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function register(req, res) {
  const { email, password, city, country } = req.body;
  try {
    const findCustomer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });
    if (findCustomer) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCustomer = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        city,
        country,
      },
    });
    res.json(newCustomer);
  } catch (error) {
    console.log(error);
    res.json({ error: "Unable to register" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const findCustomer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });
    if (!findCustomer) {
      return res.status(400).json({ error: "Wrong Email !" });
    }
    const isMatch = await bcrypt.compare(password, findCustomer.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Wrong Password !" });
    }
    const token = jwt.sign({ id: findCustomer.id }, process.env.TOKEN_SECRET, {
      expiresIn: "30d",
    });
    res.json({
      message: "Login successful",
      findCustomer: {
        id: findCustomer.id,
        email: findCustomer.email,
        city: findCustomer.city,
        country: findCustomer.country,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({ error: "Unable to login" });
  }
}

export { register, login };
