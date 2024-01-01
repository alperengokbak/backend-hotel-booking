import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getMainPageHotelInfo(req, res) {
  try {
    const mainPageHotel = await prisma.hotel.findMany();
    res.json(mainPageHotel);
  } catch (error) {
    res.json({ error: "Unable to retrieve customers" });
  }
}

async function searchHotel(req, res) {
  let { city, guestCount, entryDate, exitDate } = req.query;

  try {
    const newGuestCount = parseInt(guestCount);

    // Check if entry date is later than today
    const today = new Date();

    if (new Date(entryDate) < today) {
      return res.status(400).json({ error: "Entry date must be later than today" });
    }

    // Check if entry date is same as exit date
    if (entryDate === exitDate) {
      return res.status(400).json({ error: "Entry date cannot be the same as exit date" });
    }

    // Check if exit date is later than entry date
    if (new Date(exitDate) < new Date(entryDate)) {
      return res.status(400).json({ error: "Exit date must be later than entry date" });
    }

    // Check if city is not empty
    if (!city) {
      return res.status(400).json({ error: "City cannot be empty" });
    }

    // Convert date strings to ISO format
    const isoEntryDate = new Date(entryDate).toISOString();
    const isoExitDate = new Date(exitDate).toISOString();

    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const availableHotels = await prisma.hotel.findMany({
      where: {
        city,
        capacity: {
          gte: newGuestCount,
        },
        OR: [
          {
            bookings: {
              some: {
                entryDate: {
                  lte: isoEntryDate,
                },
                exitDate: {
                  gte: isoExitDate,
                },
              },
            },
          },
          {
            bookings: {
              every: {
                OR: [
                  {
                    entryDate: {
                      gte: isoExitDate,
                    },
                  },
                  {
                    exitDate: {
                      lte: isoEntryDate,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    const hotelIds = availableHotels.map((hotel) => hotel.id);
    const commentsCount = await prisma.comment.groupBy({
      by: ["hotelId"],
      where: {
        hotelId: { in: hotelIds },
      },
      _count: true,
    });

    const hotelsWithCommentsCount = availableHotels.map((hotel) => {
      const commentsCountForHotel = commentsCount.find((count) => count.hotelId === hotel.id);
      const count = commentsCountForHotel ? commentsCountForHotel._count : 0;

      return {
        ...hotel,
        commentsCount: count,
      };
    });
    res.json({ hotelsWithCommentsCount, status: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve hotels" });
  }
}

async function bookingHotel(req, res) {
  const { customerId, hotelId, entryDate, exitDate, guestCount } = req.body;

  const isoEntryDate = new Date(entryDate).toISOString();
  const isoExitDate = new Date(exitDate).toISOString();

  try {
    if (!hotelId || !entryDate || !exitDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
    });

    if (!hotel) {
      return res.status(400).json({ error: "Hotel does not exist" });
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        hotelId,
        OR: [
          {
            entryDate: {
              lte: isoExitDate,
            },
            exitDate: {
              gte: isoEntryDate,
            },
          },
        ],
      },
    });

    const totalGuests = existingBookings.reduce((total, booking) => total + booking.guestCount, 0);
    const remainingCapacity = hotel.capacity - totalGuests;

    if (remainingCapacity < guestCount) {
      return res.status(400).json({ error: "Not enough capacity for the booking" });
    }

    const booking = await prisma.booking.create({
      data: {
        guests: guestCount,
        entryDate: isoEntryDate,
        exitDate: isoExitDate,
        hotel: {
          connect: {
            id: hotelId,
          },
        },
        customer: {
          connect: {
            id: customerId,
          },
        },
      },
    });
    await prisma.hotel.update({
      where: {
        id: hotelId,
      },
      data: {
        capacity: {
          decrement: guestCount,
        },
      },
    });

    res.json({ booking, status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to book hotel" });
  }
}

async function cancelBookingHotel(req, res) {
  const { bookingId, customerId } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return res.status(400).json({ error: "Booking does not exist" });
    }

    if (booking.customerId !== customerId) {
      return res.status(400).json({ error: "Booking does not belong to the user" });
    }

    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    await prisma.hotel.update({
      where: {
        id: booking.hotelId,
      },
      data: {
        capacity: {
          increment: booking.guests,
        },
      },
    });

    res.json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to cancel booking" });
  }
}

async function getAvailableHotelsForWeekend(req, res) {
  try {
    const { country } = req.body;

    // Calculate the upcoming weekend dates
    const today = new Date();
    const upcomingFriday = new Date(today);
    upcomingFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
    const upcomingSunday = new Date(upcomingFriday);
    upcomingSunday.setDate(upcomingFriday.getDate() + 2);

    // Convert dates to ISO format
    const isoUpcomingFriday = upcomingFriday.toISOString();
    const isoUpcomingSunday = upcomingSunday.toISOString();

    // Find available hotels for the upcoming weekend in the provided country
    const availableHotels = await prisma.hotel.findMany({
      where: {
        country: country,
        capacity: {
          gte: 3,
        },
        bookings: {
          every: {
            OR: [
              {
                entryDate: {
                  gte: isoUpcomingSunday,
                },
              },
              {
                exitDate: {
                  lte: isoUpcomingFriday,
                },
              },
            ],
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
      take: 3,
    });

    // Fetch the count of comments for each hotel
    const hotelIds = availableHotels.map((hotel) => hotel.id);
    const commentsCount = await prisma.comment.groupBy({
      by: ["hotelId"],
      where: {
        hotelId: { in: hotelIds },
      },
      _count: true,
    });

    // Combine the comments count with the available hotels data
    const hotelsWithCommentsCount = availableHotels.map((hotel) => {
      const commentsCountForHotel = commentsCount.find((count) => count.hotelId === hotel.id);
      const count = commentsCountForHotel ? commentsCountForHotel._count : 0;

      return {
        ...hotel,
        commentsCount: count,
      };
    });

    res.json(hotelsWithCommentsCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve available hotels for the weekend" });
  }
}

async function getHotelById(req, res) {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const comments = await prisma.comment.findMany({
      where: {
        hotelId: parseInt(id),
      },
    });

    const commentsCount = comments.length;

    res.json({ hotel: { ...hotel, commentsCount }, status: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve hotel" });
  }
}

export {
  getMainPageHotelInfo,
  searchHotel,
  bookingHotel,
  getAvailableHotelsForWeekend,
  cancelBookingHotel,
  getHotelById,
};
