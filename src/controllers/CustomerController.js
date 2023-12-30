import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function register(req, res) {
  const { firstName, lastName, email, password, city, country } = req.body;
  try {
    const isEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });
    if (existingCustomer) {
      return res.status(400).json({ error: "Email already in use" });
    }
    if (!isEmail) {
      return res.status(400).json({ error: "Your email has to include @ and ." });
    }
    const passwordRegex = /^(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Password at least 8 characters, 1 number and 1 none alphanumeric character" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCustomer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
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
      status: "Success",
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

async function checkUser(req, res) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ status: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const findCustomer = await prisma.customer.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (findCustomer) {
      return res.json({
        user: {
          id: results.rows[0].id,
          firstName: results.rows[0].firstname,
          lastName: results.rows[0].lastname,
          email: results.rows[0].email,
          city: results.rows[0].city,
          country: results.rows[0].country,
        },
      });
    } else {
      return res.status(401).json({ error: "Not authorized" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Not authorized" });
  }
}

export { register, login, checkUser };
