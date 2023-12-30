import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addHotel(req, res) {
  const { name, address, city, country, price, capacity, image, memberPrice, specialPrice } = req.body;
  try {
    let newPrice = price;
    if (specialPrice) {
      newPrice = price * (42 / 100);
    }
    const newHotel = await prisma.hotel.create({
      data: {
        name,
        address,
        city,
        country,
        price: newPrice,
        capacity,
        image,
        memberPrice,
        specialPrice,
      },
    });
    res.json(newHotel);
  } catch (error) {
    console.log(error);
    res.json({ error: "Unable to create hotel" });
  }
}

export { addHotel };
