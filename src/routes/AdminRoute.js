import Router from "express";
import { isAdmin } from "../middleware.js";
import { addHotel } from "../controllers/AdminController.js";

const router = Router();
router.use(isAdmin);

router.post("/add-hotel", addHotel);

export default router;
