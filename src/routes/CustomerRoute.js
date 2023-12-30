import Router from "express";
import { register, login, checkUser } from "../controllers/CustomerController.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/check", checkUser);

export default router;
