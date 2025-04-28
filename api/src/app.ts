import express from "express";
import setRoutes from "./routes/index.js";
import dotenv from "dotenv";
import ErrorHandler from "./middlewares/ErrorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
setRoutes(app);
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
