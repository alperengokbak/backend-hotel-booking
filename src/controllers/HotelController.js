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
  let { city, guestCount, entryDate, exitDate } = req.body;

  // Convert date strings to ISO format
  const isoEntryDate = new Date(entryDate).toISOString();
  const isoExitDate = new Date(exitDate).toISOString();
  city = city.toLowerCase();

  try {
    const availableHotels = await prisma.hotel.findMany({
      where: {
        city,
        capacity: {
          gte: guestCount,
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

    res.json(availableHotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve hotels" });
  }
}

async function bookingHotel(req, res) {
  const { hotelId, entryDate, exitDate, guestCount } = req.body;
  const { id } = req.user;

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
            id,
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

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to book hotel" });
  }
}

async function cancelBookingHotel(req, res) {
  const { bookingId } = req.body;
  const { id } = req.user;

  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return res.status(400).json({ error: "Booking does not exist" });
    }

    if (booking.customerId !== id) {
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

export { getMainPageHotelInfo, searchHotel, bookingHotel, getAvailableHotelsForWeekend, cancelBookingHotel };
