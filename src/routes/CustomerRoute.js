import Router from "express";
import { register, login, checkUser } from "../controllers/CustomerController.js";

const router = Router();

router.get("/check", checkUser);
router.post("/login", login);
router.post("/register", register);

export default router;
