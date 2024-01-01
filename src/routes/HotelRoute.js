import Router from "express";
import {
  getMainPageHotelInfo,
  searchHotel,
  bookingHotel,
  getAvailableHotelsForWeekend,
  cancelBookingHotel,
  getHotelById,
} from "../controllers/HotelController.js";

const router = Router();

router.get("/main", getMainPageHotelInfo);
router.get("/search", searchHotel);
router.get("/weekend", getAvailableHotelsForWeekend);
router.get("/:id", getHotelById);
router.post("/booking", bookingHotel);
router.delete("/booking", cancelBookingHotel);

export default router;
