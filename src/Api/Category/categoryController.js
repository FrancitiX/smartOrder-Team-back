const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

require("./categoryModel");
const Category = mongo.model("category");

// Crear categoría
const createCategory = async (req, res) => {
  const { name, restaurant, description } = req.body;

  try {
    const newCategory = new Category({
      name,
      restaurant,
      description,
    });

    await newCategory.save();

    res.status(201).json({
      status: "ok",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error al crear la categoría:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({ status: "ok", data: categories });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Obtener una categoría por restaurante
const getCategory = async (req, res) => {
    const { restaurant } = req.params;
  try {
    const category = await Category.findOne({ restaurant: restaurant });
    if (!category) {
      return res.status(404).json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", data: category });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
    const { name, restaurant, description } = req.body;
  try {
    const updated = await Category.findOneAndUpdate(
      { restaurant: restaurant, name: name },
      { $set: {
        name: name,
        description: description,
      } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
    const { restaurant, name } = req.body;
  try {
    const deleted = await Category.findOneAndDelete({ restaurant: restaurant, name: name });
    if (!deleted) {
      return res.status(404).json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", message: "Eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
