const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

require("./configModel");
const Configuration = mongoose.model("configuration");

const createConfig = async (req, res) => {
  try {
    const newConfig = new Configuration(req.body);
    await newConfig.save();

    res.status(201).json({
      status: "ok",
      data: newConfig,
    });
  } catch (error) {
    console.error("Error al crear la configuración:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// Obtener todas las configuraciones
// const getAllConfigs = async (req, res) => {
//   try {
//     const configs = await Configuration.find({});
//     res.status(200).json({ status: "ok", data: configs });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Error interno" });
//   }
// };

// Obtener configuración
const getConfig = async (req, res) => {
    const { user } = req.params;
  try {
    const config = await Configuration.findOne({ user });
    if (!config) {
      return res.status(404).json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", data: config });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};


// Actualizar configuración
const updateConfig = async (req, res) => {
    const { user } = req.params;
  try {
    const updated = await Configuration.findOneAndUpdate(
      { user },
      req.body,
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

// Eliminar configuración
const deleteConfig = async (req, res) => {
    const { user } = req.params;
  try {
    const deleted = await Configuration.findOneAndDelete({ user });
    if (!deleted) {
      return res.status(404).json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", message: "Eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

module.exports = {
  createConfig,
  // getAllConfigs,
  getConfig,
  // getConfigByUser,
  updateConfig,
  deleteConfig,
};