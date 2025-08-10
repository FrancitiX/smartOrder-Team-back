const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // clave secreta en .env
    req.user = decoded; // guardamos info del usuario para usar después
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido" });
  }
};