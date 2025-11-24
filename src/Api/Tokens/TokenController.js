const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const app = express();
app.use(express.json());

require("./TokenModel");
const Token = mongoose.model("token");

// Insertar multas
const newSession = async (email, token, session) => {
  try {
    if (!email || !token) {
      console.log("Ocurrio un error al registrar la sesion");
      return false;
    }

    const newToken = await Token.create({
      email,
      token,
      session,
    });

    return newToken;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getSession = async (token, session) => {
  try {
    if (!session || !token) {
      console.log("Ocurrio un error al registrar la sesion");
      return false;
    }

    const Session = await Token.findOne({
      token: token,
      session: session,
    });

    return Session;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const closeSession = async (user, session) => {
  try {
    const foundSession = await Token.findOne({ user, session });

    if (foundSession) {
      await Token.deleteOne({ user, session });
      return true;
    }

    console.log("No se encontro la sesión");

    return false;
  } catch (error) {
    console.error("Error al cerrar sesión: ", error);
    return false;
  }
};

const close_All_Sessions = async (user) => {
  try {
    if (user) {
      const close = await Token.deleteMany({ user: user });
      return close;
    }

    console.log("No se encontro la sesión");

    return false;
  } catch (error) {
    console.error("Error al cerrar sesión: ", error);
    return false;
  }
};

module.exports = {
  newSession,
  getSession,
  closeSession,
  close_All_Sessions,
};
