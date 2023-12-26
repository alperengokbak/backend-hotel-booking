import Router from "express";
import { isAuthorized } from "../middleware.js";
import { getAllCustomers } from "../controllers/HotelController.js";

const router = Router();
router.use(isAuthorized);

router.get("/", getAllCustomers);

export default router;
