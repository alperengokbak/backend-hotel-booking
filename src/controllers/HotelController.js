import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getAllCustomers(req, res) {
  try {
    const allCustomers = await prisma.customer.findMany();
    res.json(allCustomers);
  } catch (error) {
    res.json({ error: "Unable to retrieve customers" });
  }
}

async function getMainPageHotelInfo(req, res) {
  try {
    const mainPageHotel = await prisma.hotel.findMany();
    res.json(mainPageHotel);
  } catch (error) {
    res.json({ error: "Unable to retrieve customers" });
  }
}

export { getAllCustomers, getMainPageHotelInfo };
