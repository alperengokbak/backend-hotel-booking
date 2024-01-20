import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addHotel(req, res) {
  const {
    name,
    address,
    city,
    country,
    price,
    capacity,
    image,
    rating,
    memberPrice,
    specialPrice,
    description,
    features,
  } = req.body;
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
        rating,
        memberPrice,
        specialPrice,
        description,
        features,
      },
    });
    res.json(newHotel);
  } catch (error) {
    console.log(error);
    res.json({ error: "Unable to create hotel" });
  }
}

async function deleteHotel(req, res) {
  const { id } = req.body;
  try {
    const hotel = await prisma.hotel.findUnique({
      where: {
        id,
      },
    });
    if (!hotel) {
      return res.status(400).json({ error: "Hotel does not exist" });
    }
    await prisma.hotel.delete({
      where: {
        id,
      },
    });
    res.json({ hotel, status: "success" });
  } catch (error) {
    console.log(error);
    res.json({ error: "Unable to delete hotel" });
  }
}

export { addHotel, deleteHotel };
