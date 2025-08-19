const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());

require("./restaurantModel");
require("./restaurantDetailsModel");
require("./restaurantDesignModel");
const Restaurant = mongoose.model("restaurant");
const RestaurantDetails = mongoose.model("restaurant_details");
const RestaurantDesign = mongoose.model("restaurant_design");

function createID(owner, name) {
  const init = owner.toString().slice(0, 3);
  const end = name.toString().slice(0, 3);
  const mid = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(8, "0");

  const id = init + mid + end;
  return id;
}

const storageRestaurants = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Storage/Images/restaurants"); // Carpeta específica para restaurantes
  },
  filename: (req, file, cb) => {
    const restaurantname = req.body.name;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(
      null,
      "restaurant-" +
        restaurantname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const uploadRestaurant = multer({ storage: storageRestaurants });

const uploadRestaurantImages = uploadRestaurant.fields([
  { name: "logo", maxCount: 1 }, //Logo
  { name: "mainImage", maxCount: 1 }, // imagen principal
  { name: "images", maxCount: 5 }, // hasta 5 imágenes adicionales
]);

// Registrar un nuevo restaurante
const registerRestaurant = async (req, res) => {
  const { name, description, owner, email, countryCode, number, category } =
    req.body;

  const logo = req.files?.logo ? req.files.logo[0].path : null;
  const mainImage = req.files?.mainImage ? req.files.mainImage[0].path : null;
  const images = req.files?.images
    ? req.files.images.map((file) => file.path)
    : [];

  try {
    const id = createID(owner, name);

    // Verificar si ya existe un restaurante con el mismo email
    const existingRestaurant = await Restaurant.findOne({
      id: id,
    });

    if (existingRestaurant) {
      res.status(400).json({
        status: "error",
        data: "Ya existe un restaurante así! contacte a soporte por favor",
      });
    } else {
      await Restaurant.create({
        id,
        name,
        description,
        owner,
        contact: {
          email,
          phone: {
            countryCode,
            number,
          },
        },
        category,
        foods: [],
      });

      await RestaurantDetails.create({
        id,
        name,
        logo,
        mainImage,
        images,
        workingDays: [],
        maxCapacity: 10,
        currentCapacity: 0,
        foods: [],
        state: "available",
        status: "active",
      });

      await RestaurantDesign.create({ restaurant: id });

      res
        .status(201)
        .json({ status: "ok", data: "Restaurante creado exitosamente" });
      console.log("Restaurante creado exitosamente");
    }
  } catch (error) {
    console.error("error: " + error);
    res
      .status(500)
      .json({ status: "error", data: "Error interno del servidor" });
  }
};

// Obtener datos del restaurante
const getRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findOne({ id: id });
    const restaurantDetails = await RestaurantDetails.findOne({ id: id});
    const restaurantDesign = await RestaurantDesign.findOne({ restaurant: id });

    if (!restaurant) {
      return res
        .status(404)
        .json({ status: "error", data: "Restaurante no encontrado" });
    }
    res.status(200).json({ status: "ok", data: restaurant, dataDetails: restaurantDetails, dataDesign: restaurantDesign });
  } catch (error) {
    console.error("Error: ", error);
    return res.send({ error: error });
  }
};

// Actualizar datos del restaurante
const updateRestaurant = async (req, res) => {
  const {
    id,
    name,
    description,
    owner,
    email,
    countryCode,
    number,
    category,
    workingDays,
    maxCapacity,
    currentCapacity,
    foods,
    state,
    status,
  } = req.body;

  const {
    backgroundType,
    backgroundColor,
    style,
    divisions,
    header,
    headerText,
    mainColor,
    secondaryColor,
    moreColors,
    font,
  } = req.body;

  const logo = req.files.logo ? req.files.logo[0].path : null;
  const mainImage = req.files.mainImage ? req.files.mainImage[0].path : null;
  const images = req.files.images
    ? req.files.images.map((file) => file.path)
    : [];

  const bgImage = req.files.backgroundImage
    ? req.files.backgroundImage[0].path
    : null;

  try {
    await Restaurant.updateOne(
      { id: id },
      {
        $set: {
          name,
          description,
          owner,
          contact: {
            email,
            phone: {
              countryCode,
              number,
            },
          },
          category,
        },
      }
    );

    // Parsear workingDays y foods si vienen como string JSON
    let parsedWorkingDays = workingDays;
    if (typeof workingDays === "string") {
      try {
        parsedWorkingDays = JSON.parse(workingDays);
      } catch (err) {
        console.warn("⚠️ workingDays no es JSON válido, se usa crudo");
      }
    }

    let parsedFoods = foods;
    if (typeof foods === "string") {
      try {
        parsedFoods = JSON.parse(foods);
      } catch (err) {
        parsedFoods = [foods]; // fallback
      }
    }

    await RestaurantDetails.findOneAndUpdate(
      {
        id: id,
      },
      {
        name,
        logo,
        mainImage,
        images,
        workingDays: parsedWorkingDays,
        maxCapacity,
        currentCapacity,
        foods: parsedFoods,
        state,
        status,
      }
    );

    await RestaurantDesign.findOneAndUpdate(
      { restaurant: id },
      {
        background: {
          typee: backgroundType,
          color: backgroundColor,
          image: bgImage,
        },
        style: style,
        divisions: divisions,
        header: header,
        headerText: headerText,
        mainColor: mainColor,
        secondaryColor: secondaryColor,
        moreColors: moreColors,
        font: font,
      }
    );

    res
      .status(200)
      .json({ status: "ok", data: "Restaurante actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los restaurantes (con paginación)
const getAllRestaurants = async (req, res) => {
  let skip = parseInt(req.query.skip) || 0;
  let limit = parseInt(req.query.limit) || 10;

  try {
    const data = await Restaurant.find().skip(skip).limit(limit);

    const totalDocs = await Restaurant.countDocuments();
    const pages = {
      docs: data.length,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      currentPage: Math.floor(skip / limit) + 1,
    };

    res.status(200).send({ status: "ok", data: data, pages: pages });
  } catch (error) {
    console.error("Error al obtener restaurantes:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Buscar restaurantes por nombre
const searchRestaurants = async (req, res) => {
  const { query } = req.query;
  let skip = parseInt(req.query.skip) || 0;
  let limit = parseInt(req.query.limit) || 10;

  try {
    const data = await Restaurant.find({
      name: { $regex: query, $options: "i" },
    })
      .skip(skip)
      .limit(limit);

    const totalDocs = await Restaurant.countDocuments({
      name: { $regex: query, $options: "i" },
    });

    const pages = {
      docs: data.length,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
    };

    res.status(200).send({ status: "ok", data: data, pages: pages });
  } catch (error) {
    console.error("Error en búsqueda:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar restaurante
const deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const restaurant = await Restaurant.findOne({ id: id, owner: user.email });

    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        data: "Restaurante no encontrado",
      });
    }

    await Restaurant.deleteOne({ id: id, owner: user.email });

    res
      .status(200)
      .json({ status: "ok", data: "Restaurante eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar restaurante:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener estadísticas del restaurante
const getRestaurantStats = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const restaurant = await Restaurant.findOne({ id: id, owner: user.email });

    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        data: "Restaurante no encontrado",
      });
    }

    const stats = {
      totalFoods: restaurant.foods.length,
      category: restaurant.category,
      createdAt: restaurant.date,
      // Aquí podrías agregar más estadísticas como órdenes, ventas, etc.
    };

    res.status(200).json({ status: "ok", data: stats });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener restaurantes favoritos
const getFavRestaurants = async (req, res) => {
  const user = req.user;

  try {
    const restaurants = await Promise.all(
      user.favrestaurants.map(async (restaurantId) => {
        return await Restaurant.findOne({ id: restaurantId });
      })
    );

    res.status(200).json({ status: "ok", data: restaurants });
  } catch (error) {
    console.error("Error al obtener restaurantes favoritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  registerRestaurant,
  getRestaurant,
  updateRestaurant,
  getAllRestaurants,
  searchRestaurants,
  deleteRestaurant,
  getRestaurantStats,
  getFavRestaurants,
  uploadRestaurantImages
};
