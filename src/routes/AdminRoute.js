import Router from "express";
import { isAdmin } from "../middleware.js";
import { addHotel, deleteHotel } from "../controllers/AdminController.js";

const router = Router();
router.use(isAdmin);

router.post("/add-hotel", addHotel);
router.delete("/delete-hotel", deleteHotel);

export default router;
