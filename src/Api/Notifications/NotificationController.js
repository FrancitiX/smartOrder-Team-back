const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const app = express();
app.use(express.json());

require("./NotificationSchema");
const Notification = mongoose.model("notifications");

const idNotification = (title, type) => {
  if (!type) {
    throw new Error("La notificación debe tener un tipo.");
  }
  const random = crypto.randomBytes(10).toString("hex");

  if (title > 2) {
    const firstLetter =
      title[0].toUpperCase() + title[1].toUpperCase() + type[0].toUpperCase();

    return `${firstLetter}-${type}${random}`;
  } else {
    const firstLetter = type[0].toUpperCase();

    return `${firstLetter}-${type}${random}`;
  }
};

const newNotification = async (req, res) => {
  try {
    const {
      department,
      tower,
      title,
      short,
      description,
      images,
      type,
      recipients,
    } = req.body;
    console.log("Se añadio una Notificacion ", req.body);


    if (!title || !short || !type || !recipients) {
      return res
        .status(501)
        .json({ message: "Error al generar la notidficación" });
    }

    const id = idNotification(title, type);

    const notification = await Notification.create({
      id,
      department,
      tower,
      title,
      short,
      description,
      images,
      type,
      recipients,
    });

    res.status(200).json({ status: "ok", data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar la multa" });
  }
};

const getNotification = async (req, res) => {
  const { user, id } = req.body;

  try {
    const notificacion = await Notification.find({
      id: id,
      "recipients.user": user,
    });

    res.status(202).send({ status: "ok", data: notificacion });
  } catch (error) {
    console.error("Error al obtener la multa: ", error);
    res.status(500).json({ error: "Error al obtener la multa" });
  }
};

const updateNotification = async (req, res) => {
  const { id, user } = req.body;

  try {
    const updatedNotification = await Notification.findOneAndUpdate(
      { id: id, "recipients.user": user },
      { $set: { "recipients.$.read": true } },
      { new: true }
    );

    if (!updatedNotification) {
      console.log("Notificación no encontrada");
      return res
        .status(404)
        .json({ status: "error", message: "Notificación no encontrada" });
    }

    res.status(200).json({ status: "ok", data: updatedNotification });
  } catch (error) {
    console.error("Error al actualizar la notificación:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

const getNotifications = async (req, res) => {
  const { user } = req.body;
  let skip = parseInt(req.query.skip) || 0;
  let limit = parseInt(req.query.limit) || 10;

  if (limit === 0) {
    limit = 10;
  }

  try {
    const notifications = await Notification.find({ "recipients.user": user })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalDocs = await Notification.countDocuments();
    const pages = {
      docs: notifications.length,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
    };

    res.status(200).send({ status: "ok", data: notifications, pages: pages });
  } catch (error) {
    console.error("Error al obtener las multas:", error);
    res.status(500).json({ error: "Error al obtener las multas" });
  }
};

const getPushNotifications = async (req, res) => {
  const { user } = req.body;
  
  try {
    const notifications = await Notification.find({ "recipients.user": user });
    
    res.status(200).send({ status: "ok", data: notifications });
  } catch (error) {
    console.error("Error al obtener las multas:", error);
    res.status(500).json({ error: "Error al obtener las multas" });
  }
};

const deleteNotification = async (req, res) => {
  const { user, id } = req.body;

  try {
    const updatedNotification = await Notification.findOneAndUpdate(
      { id: id },
      { $pull: { recipients: { user: user } } },
      { new: true }
    );

    if (!updatedNotification) {
      return res
        .status(404)
        .json({ status: "error", message: "Notificación no encontrada" });
    }

    if (updatedNotification.recipients.length === 0) {
      await Notification.findOneAndDelete(id);
      return res.status(200).json({
        status: "ok",
        message: "Notificación eliminada completamente",
      });
    }

    res.status(200).json({ status: "ok", data: updatedNotification });
  } catch (error) {
    console.error("Error al eliminar usuario de la notificación:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

module.exports = {
  newNotification,
  getPushNotifications,
  getNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
};
