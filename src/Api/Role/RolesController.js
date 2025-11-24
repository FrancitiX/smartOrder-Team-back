const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

require("./RolesModel");
const Role = mongoose.model("roles");

// Insertar roles
const newRole = async (req, res) => {
  try {
    const { number, role } = req.body;

    const newRole = new Role({
      number,
      role,
    });

    await newRole.save();
    res.status(201).json({ status: "ok", data: newRole });
  } catch (error) {
    console.error("Error al crear el rol:", error);
    res.status(500).json({ error: "Error al crear el rol" });
  }
};

const getRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findById({ number: id });
    if (!role) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    res.status(200).json({ status: "ok", data: role });
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    res.status(500).json({ error: "Error al obtener el rol" });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.status(200).json({ status: "ok", data: roles });
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    res.status(500).json({ error: "Error al obtener los roles" });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByIdAndDelete({ number: id });
    if (!role) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    res.status(200).json({ status: "ok", data: role });
  } catch (error) {
    console.error("Error al eliminar el rol:", error);
    res.status(500).json({ error: "Error al eliminar el rol" });
  }
};

module.exports = {
  newRole,
  getRole,
  getAllRoles,
  deleteRole
};
