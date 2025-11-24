const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const MONGO_URL = process.env.DB_URI;
const PORT = process.env.PORT;

if (!MONGO_URL) {
  console.error("Error: DB_URI no está definido en .env");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// conexion a mongo
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((e) => {
    console.error("Error al conectar a MongoDB", e);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send({ status: "ok" });
});

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");

app.use("/api", apiRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(""), console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Dependencias

// npm install
// npm i express body-parser mongoose multer cors jsonwebtoken bcrypt dotenv mongodb
