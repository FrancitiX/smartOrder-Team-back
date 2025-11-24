const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
app.use(express.json());
require("dotenv").config();

app.use(express.json());

require("./reservationModel");
const Reservation = mongoose.model("reservation");

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

const registerReservation = async (req, res) => {
  const { restaurant, customer, site, people, status, time, price } = req.body;

  try {
    const newReservation = new Reservation({
      id: generateId(),
      restaurant,
      customer,
      site,
      people,
      status,
      time,
      price,
    });

    await newReservation.save();

    res.status(201).json({
      status: "ok",
      data: newReservation,
    });
  } catch (error) {
    console.error("Error al registrar la reserva:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// Obtener una reservación por id
const getReservation = async (req, res) => {
    const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res
        .status(404)
        .json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", data: reservation });
  } catch (error) {
    console.error("Error al obtener la reservación:", error);
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Obtener todas las reservaciones por restaurante
const getAllReservations = async (req, res) => {
  const { restaurant } = req.body;
  try {
    const reservations = await Reservation.find({ restaurant });
    res.status(200).json({ status: "ok", data: reservations });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

const getAllReservationsByCustomer = async (req, res) => {
  const { customer } = req.body;
  try {
    const reservations = await Reservation.find({ customer });
    res.status(200).json({ status: "ok", data: reservations });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Actualizar reservación
const updateReservation = async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

// Eliminar reservación
const deleteReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Reservation.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "No encontrada" });
    }
    res.status(200).json({ status: "ok", message: "Eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error interno" });
  }
};

module.exports = {
  registerReservation,
  getReservation,
  getAllReservations,
  updateReservation,
  deleteReservation,
};
