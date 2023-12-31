import express from "express";
import customerRoute from "./src/routes/CustomerRoute.js";
import hotelRoute from "./src/routes/HotelRoute.js";
import adminRoute from "./src/routes/AdminRoute.js";
import cors from "cors";
import { corsOptions } from "./src/config/corsOptions.js";

const app = express();
const port = 3000;

app.use(cors(corsOptions));
app.use(express.json());

app.use("/customer", customerRoute);
app.use("/hotel", hotelRoute);
app.use("/admin", adminRoute);

app.listen(port, () => {
  console.log("App listening on port 3000");
});
