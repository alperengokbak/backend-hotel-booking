import express from "express";
import customerRoute from "./src/routes/CustomerRoute.js";
import hotelRoute from "./src/routes/HotelRoute.js";
/* import cors from "cors"; */

const app = express();
const port = 3000;

/* app.use(cors()); */
app.use(express.json());

app.use("/customer", customerRoute);
app.use("/hotel", hotelRoute);

app.listen(port, () => {
  console.log("App listening on port 3000!");
});
