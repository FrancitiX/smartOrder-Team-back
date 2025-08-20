const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(express.json());

require("./foodModel");
require("./foodDetailsModel");
require("../Restaurant/restaurantModel");
const Food = mongoose.model("food");
const FoodDetails = mongoose.model("food_details");
const Restaurant = mongoose.model("restaurant");

const storageFoods = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Storage/Images/foods");
  },
  filename: (req, file, cb) => {
    const foodname = req.body.name;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(
      null,
      "food-" + foodname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadFood = multer({ storage: storageFoods });

const uploadFoodImages = uploadFood.fields([
  { name: "images", maxCount: 10 }, // hasta 10 imágenes
  { name: "imageAdditionals", maxCount: 10 }, // hasta 10 imágenes adicionales
]);

// Crear una nueva comida
const createFood = async (req, res) => {
  const {
    name,
    restaurantID,
    description,
    price,
    category,
    details,
  } = req.body;
  const user = req.user;
  const images = req.files?.images
    ? req.files.images.map((file) => file.path)
    : [];

  try {
    const restaurant = await Restaurant.findOne({
      id: restaurantID,
      owner: user.email,
    });

    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        data: "Restaurante no encontrado",
      });
    }

    // Verificar que el restaurante existe y pertenece al usuario
    const foodExist = await Food.findOne({
      name: name,
      restaurant: restaurantID,
    });

    if (foodExist) {
      return res.status(405).json({
        status: "error",
        data: "Ya existe un platillo con este nombre en el restaurante",
      });
    }

    const newFood = await Food.create({
      name,
      restaurant: restaurantID,
      description,
      price,
      sales: 0,
      category: category.split(",").map((cat) => cat.trim()),
      images,
    });

    const foodDetails = await FoodDetails.create({
      name,
      restaurant: restaurantID,
      prices: [{ price: price, date: new Date().toISOString() }],
    //   additionals: additionals?.map((item) => ({
    //     name: item.name,
    //     description: item.description,
    //     imageAdditionals: imageAdditionals[index] || "",
    //     price: item.price,
    //     selections: 0,
    //   })),
      //   combinations: [],
      details,
    });

    res.status(201).json({
      status: "ok",
      data: "Platillo creado exitosamente",
      food: newFood,
    });
  } catch (error) {
    console.error("Error al crear platillo:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Obtener todas las comidas de un restaurante
const getFoodsByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const foods = await Food.find({ restaurant: id });

    if (!foods || foods.length === 0) {
      return res.status(404).json({
        status: "error",
        data: "No se encontraron comidas para este restaurante",
      });
    }

    res.status(200).json({
      status: "ok",
      data: foods,
    });
  } catch (error) {
    console.error("Error al obtener comidas:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Obtener una comida específica por ID
const getFood = async (req, res) => {
  const name = req.params.food;
  const restaurant = req.params.id;

  try {
    const food = await Food.findOne({ name: name, restaurant: restaurant });
    const foodDetails = await FoodDetails.findOne({
      name: name,
      restaurant: restaurant,
    });

    if (!food) {
      return res.status(404).json({
        status: "error",
        data: "Platillo no encontrado",
      });
    }

    res.status(200).json({
      status: "ok",
      data: food,
      details: foodDetails,
    });
  } catch (error) {
    console.error("Error al obtener comida:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Actualizar un platillo
const updateFood = async (req, res) => {
  const {
    name,
    restaurantID,
    description,
    price,
    category,
    color,
  } = req.body;
  const user = req.user;
  const images = req.files?.images
    ? req.files.images.map((file) => file.path)
    : null;

  try {
    const restaurant = await Restaurant.findOne({
      id: restaurantID,
      owner: user.email,
    });

    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        data: "Restaurante no encontrado",
      });
    }

    const food = await Food.findOne({ name: name, restaurant: restaurantID });
    const foodDetails = await FoodDetails.findOne({
      name: name,
      restaurant: restaurantID,
    });

    let newPrices = foodDetails.prices;
    if (price && price !== food.price) {
      newPrices = [
        ...foodDetails.prices,
        { price: price, date: new Date().toISOString() },
      ];
    }

    if (!food) {
      return res.status(404).json({
        status: "error",
        data: "Comida no encontrada",
      });
    }

    const updatedFood = await Food.updateOne(
      { name: name, restaurant: restaurantID },
      {
        $set: {
          name: name || food.name,
          description: description || food.description,
          price: price || food.price,
          category: category || food.category,
          ...(images ? { images } : {}),
        },
      },
      { new: true }
    );

    const updatedFoodDetails = await FoodDetails.updateOne(
      { name: name, restaurant: restaurantID },
      {
        $set: {
          details: details || foodDetails.details,
          prices: newPrices || foodDetails.prices,
          color: color || foodDetails.color,
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: "ok",
      data: "Platillo actualizado exitosamente",
      food: updatedFood,
    });
  } catch (error) {
    console.error("Error al actualizar comida:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Eliminar una comida
const deleteFood = async (req, res) => {
  const { name, restaurant } = req.params;
  const user = req.user;
  const imagesDetails = req.files?.images
    ? req.files.images.map((file) => file.path)
    : null;

  try {
    const restaurantExist = await Restaurant.findOne({
      id: restaurant,
      owner: user.email,
    });

    if (!restaurantExist) {
      return res.status(404).json({
        status: "error",
        data: "Restaurante no encontrado",
      });
    }

    const food = await Food.findOne({ name: name, restaurant: restaurant });

    if (!food) {
      return res.status(404).json({
        status: "error",
        data: "Platillo no encontrado",
      });
    }

    await Food.deleteOne({ name: name, restaurant: restaurant });

    res.status(200).json({
      status: "ok",
      data: "Platillo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar comida:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Obtener comidas por categoría
const getFoodsByCategory = async (req, res) => {
  const { restaurant, category } = req.params;

  try {
    const foods = await Food.find({
      restaurant: restaurant,
      category: category,
    });

    if (!foods || foods.length === 0) {
      return res.status(404).json({
        status: "error",
        data: "No se encontraron comidas en esta categoría",
      });
    }

    res.status(200).json({
      status: "ok",
      data: foods,
    });
  } catch (error) {
    console.error("Error al obtener comidas por categoría:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Actualizar ventas de una comida
const updateFoodSales = async (req, res) => {
  const { name, restaurant } = req.params;
  const { sales } = req.body;

  try {
    const food = await Food.findOne({ name: name, restaurant: restaurant });

    if (!food) {
      return res.status(404).json({
        status: "error",
        data: "Comida no encontrada",
      });
    }

    const updatedFood = await Food.updateOne(
      { name: name, restaurant: restaurant },
      { $set: { sales: sales } }
    );

    res.status(200).json({
      status: "ok",
      data: "Ventas actualizadas exitosamente",
      food: updatedFood,
    });
  } catch (error) {
    console.error("Error al actualizar ventas:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

// Buscar comidas por nombre
const searchFoods = async (req, res) => {
  const { restaurant, query } = req.params;

  try {
    const foods = await Food.find({
      restaurant: restaurant,
      name: { $regex: query, $options: "i" }, // Búsqueda case-insensitive
    });

    if (!foods || foods.length === 0) {
      return res.status(404).json({
        status: "error",
        data: "No se encontraron comidas con ese nombre",
      });
    }

    res.status(200).json({
      status: "ok",
      data: foods,
    });
  } catch (error) {
    console.error("Error al buscar comidas:", error);
    res.status(500).json({
      status: "error",
      data: "Error interno del servidor",
    });
  }
};

module.exports = {
  createFood,
  getFoodsByRestaurant,
  getFood,
  updateFood,
  deleteFood,
  getFoodsByCategory,
  updateFoodSales,
  searchFoods,
  updateFood,
  uploadFoodImages,
};
