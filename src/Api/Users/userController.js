const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(express.json());

require("./userModel");
require("./../User_Image/user_imageModel");
const User = mongoose.model("user");
const userImage = mongoose.model("userImage");
const Roles = require("../../Enums/Enums");

const {
  newSession,
  getSession,
  closeSession,
  close_All_Sessions,
} = require("../Tokens/TokenController");

const registerUser = async (req, res) => {
  const { name, cellphone, password, email, role } = req.body;
  console.log("Registro: ", name.name);

  try {
    const salt = await bcrypt.genSalt(12);
    const pepper = process.env.PEPPER;
    // const enPassword = await bcrypt.hash(pepper + password + salt, 12);
    const enPassword = await bcrypt.hash(pepper + password + salt, 12);
    const oldEmail = await User.findOne({ email: email });

    console.log("Contraseña registrada: " + pepper + password + salt);

    if (oldEmail) {
      res.status(400).json({
        status: "correo",
        data: "El correo ya está registrado!",
      });
      console.log("El correo ya está registrado!");
    } else {
      await User.create({
        name: {
          name: name.name,
          paternal_surname: name.paternal_surname,
          maternal_surname: name.maternal_surname,
        },
        email,
        cellphone: cellphone,
        salt: salt,
        password: enPassword,
        role: role,
        favrestaurants: [],
      });
      await userImage.create({
        email: email,
        image: "",
        bgimage: "",
      });
      res.status(201).json({ status: "ok", data: "Usuario creado" });
      console.log("Usuario creado exitosamente");
    }
  } catch (error) {
    console.error("error: " + error);
    res
      .status(500)
      .json({ status: "error", data: "Error interno del servidor" });
  }
};

const loginUser = async (req, res) => {
  const { email, password, remember } = req.body;
  const ip = req.connection.remoteAddress;
  console.log("user login: " + email);

  try {
    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", data: "Usuario no registrado" });
    }
    const { salt } = user;
    const pepper = process.env.PEPPER;
    // const passwordComplete = pepper + password + salt;
    const fullPassword = pepper + password + salt;
    const isPasswordValid = await bcrypt.compare(
      // pepper + password + salt,
      fullPassword,
      user.password
    );

    console.log("Contraseña login: " + fullPassword);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "wrong password", data: "Contraseña incorrecta" });
    }

    // Generar token JWT
    let token;
    const payload = {
      email: user.email,
      name: user.name,
      cellphone: user.cellphone,
      role: user.role,
      favrestaurants: user.favrestaurants,
    };
    if (!remember) {
      token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
    } else {
      const session = email + ip;
      token = jwt.sign(payload, process.env.JWT_SECRET, {});
      const dbToken = await newSession(email, token, session);
      console.log("token guardado: " + dbToken);
    }

    return res.status(200).json({
      status: "ok",
      user_name: user.name,
      user_email: user.email,
      user_cellphone: user.cellphone,
      user_role: user.role,
      user_favrestaurants: user.favrestaurants,
      token: token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res
      .status(500)
      .json({ status: "error", data: "Error interno del servidor" });
  }
};

const userData = async (req, res) => {
  const user = req.user;

  console.log("data del usuario");
  console.log(user);

  try {
    User.findOne({ email: user.email })
      .then((user) => {
        return res.status(200).json({ status: "ok", data: user });
      })
      .catch((err) => {
        // Manejo de errores si la promesa falla
        console.error("Error de búsqueda:", err);
        return res.status(500).send({ error: "Error interno del servidor" });
      });
  } catch (error) {
    console.error("Error we: ", error);
    return res.send({ error: error });
  }
};

const updateUser = async (req, res) => {
  const { image, username, email, password, newPassword } = req.body;
  try {
    if (!password) {
      await BC_U.updateOne(
        { username: username },
        {
          $set: {
            email,
          },
        }
      );
      await User.updateOne(
        { username: username },
        {
          $set: {
            email,
          },
        }
      );
    } else {
      const enPassword = await bcrypt.hash(newPassword, 12);

      const username = await User.findOne({ username: username });
      if (await bcrypt.compare(password, username.pass)) {
        await BC_U.updateOne(
          { username: username },
          {
            $set: {
              email,
              pass: enPassword,
            },
          }
        );
        await User.updateOne(
          { username: username },
          {
            $set: {
              email,
              pass: enPassword,
            },
          }
        );
      } else {
        res.send({ status: "error", data: "La contraseña actual no coincide" });
      }
    }
    res.send({ status: "ok", data: "Updated" });
  } catch (error) {
    return res.send({ error: error });
  }
};

const getAllUsers = async (req, res) => {
  let skip = parseInt(req.query.skip) || 0;

  try {
    const data = await User.find({}).skip(parseInt(skip)).limit(parseInt(10));

    const totalDocs = await User.countDocuments();
    const pages = {
      docs: data.length,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / 10),
    };

    res.status(200).send({ status: "ok", data: data, pages: pages });
  } catch (error) {
    return res.send({ error: error });
  }
};

const deleteUser = async (req, res) => {
  const { username } = req.body;
  try {
    await userImage.deleteOne({ username: username });
    await User.deleteOne({ username: username });

    res.send({ status: "ok", data: "User Deleted" });
  } catch (error) {
    console.error("No se borro el usuarioo");
    return res.send({ error: error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  userData,
  updateUser,
  getAllUsers,
  deleteUser,
};
