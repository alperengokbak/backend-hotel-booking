import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function isAuthorized(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Not authorized" });
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      const findCustomer = await prisma.customer.findUnique({
        where: {
          id: decoded.id,
        },
      });
      if (findCustomer) {
        req.user = findCustomer;
        next();
      } else {
        return res.status(401).json({ error: "Not authorized" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Not authorized" });
    }
  }
}

export { isAuthorized };
