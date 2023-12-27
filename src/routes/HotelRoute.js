import Router from "express";
import { isAuthorized } from "../middleware.js";
import { getAllCustomers, getMainPageHotelInfo } from "../controllers/HotelController.js";

const router = Router();
router.use(isAuthorized);

router.get("/", getAllCustomers);
router.get("/main", getMainPageHotelInfo);

export default router;
