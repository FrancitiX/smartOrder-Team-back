const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// require("./../Api/Tokens/TokenModel");
const Token = mongoose.model("token");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // clave secreta en .env
    if (!decoded) {
      const token = await Token.findOne({ token: token });
      if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
      }
    }
    req.user = decoded; // guardamos info del usuario para usar después
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido" });
  }
};