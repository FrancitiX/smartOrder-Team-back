const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
app.use(express.json());

require("./user_imageModel");
const User_Image = mongoose.model("userImage");

const storageUsers = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Storage/Images/users"); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const name = req.body.user_name;
    const safeName = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(
      null,
      file.fieldname + safeName + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadUsers = multer({ storage: storageUsers });

const updateUserImages = async (req, res) => {
  const { gmail } = req.body;
  const image = req.file ? req.file.path : null;
  const bgImage = req.file ? req.file.path : null;

  try {
    const updatedUserImage = await User_Image.findOneAndUpdate(
      { gmail: gmail },
      {
        $set: {
          image: image,
          bgimage: bgImage,
        },
      },
      { new: true }
    );

    if (!updatedUserImage) {
      return res.status(404).send({ error: "Usuario no encontrado" });
    }
    return res.status(201).send({ status: "ok" });
  } catch (error) {
    console.error("Error al actualizar la imagen del usuario:", error);
    return res.send({ error: error, data: error });
  }
};

const userImage = async (req, res) => {
  const user = req.user;

  try {
    User_Image.findOne({ gmail: user.gmail })
      .then((data) => {
        fs.access(data.image, fs.constants.F_OK, (err) => {
          if (err) {
            // console.error('La imagen no existe o no se puede acceder:', data.image);
            return res.send({ status: "404", data: data });
          } else {
            return res.send({ status: "ok", data: data });
          }
        });
      })
      .catch((e) => {
        console.error("Error de búsqueda:", e);
        return res.status(500).send({ error: "Error interno del servidor" });
      });
  } catch (error) {
    console.log("Error we: ", error);
    return res.send({ error: error });
  }
};

module.exports = {
  updateUserImages,
  uploadUsers,
  userImage,
};
