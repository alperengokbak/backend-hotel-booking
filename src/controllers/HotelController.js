import { PrismaClient } from "@prisma/client";
import e from "express";

const prisma = new PrismaClient();

async function getAllCustomers(req, res) {
  try {
    const allCustomers = await prisma.customer.findMany();
    res.json(allCustomers);
  } catch (error) {
    res.json({ error: "Unable to retrieve customers" });
  }
}

export { getAllCustomers };
