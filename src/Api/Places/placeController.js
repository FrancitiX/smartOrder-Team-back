const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
app.use(express.json());

require("./placeModel");
const Place = mongoose.model("place");

function createID(restaurant) {
  return "place_" + restaurant + "_" + new Date().getTime();
}

const storagePlaces = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Storage/Images/places"); // Carpeta específica para lugares
  },
  filename: (req, file, cb) => {
    const placename = req.body.name;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(
      null,
      "place-" + placename + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadPlace = multer({ storage: storagePlaces });

const uploadPlaceImages = uploadPlace.fields([
  { name: "images", maxCount: 5 }, // hasta 5 imágenes
]);

// Crear lugar
const createPlace = async (req, res) => {
  try {
    const { restaurant, name, description } = req.body;
    const id = createID();

    const images = req.files.images ? req.files.images.map((file) => file.path) : [];

    const newPlace = new Place({
      id,
      restaurant,
      name,
      description,
      images,
    });

    await newPlace.save();

    res.status(201).json({ status: "ok", data: newPlace });
  } catch (error) {
    console.error("Error al crear lugar:", error);
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Obtener lugar por restaurante
const getPlace = async (req, res) => {
  const { restaurant } = req.params;
  try {
    const place = await Place.findOne({ restaurant: restaurant });
    if (!place) {
      return res
        .status(404)
        .json({ status: "error", message: "No encontrado" });
    }
    res.status(200).json({ status: "ok", data: place });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Obtener lugar por id
const getPlaceByCustomId = async (req, res) => {
  const { restaurant, id } = req.params;
  try {
    const place = await Place.findOne({ id: id, restaurant: restaurant });
    if (!place) {
      return res
        .status(404)
        .json({ status: "error", message: "No encontrado" });
    }
    res.status(200).json({ status: "ok", data: place });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Actualizar lugar
const updatePlace = async (req, res) => {
  const { restaurant, id } = req.params;
  const { name, description } = req.body;
  const images = req.files.images ? req.files.images.map((file) => file.path) : [];
  try {
    const updated = await Place.findOneAndUpdate(
      { id, restaurant },
      { $set: { name, description, images } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Lugar no encontrado para actualizar",
      });
    }

    res.status(200).json({ status: "ok", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Eliminar lugar
const deletePlace = async (req, res) => {
  const { restaurant, id } = req.params;
  try {
    const deleted = await Place.findOneAndDelete({ id, restaurant });

    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "No encontrado" });
    }

    res.status(200).json({ status: "ok", message: "Lugar eliminado" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

module.exports = {
  createPlace,
  //   getAllPlaces,
  getPlace,
  getPlaceByCustomId,
  updatePlace,
  deletePlace,
  uploadPlace
};
