import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000");
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT} (${NODE_ENV})`);
});
