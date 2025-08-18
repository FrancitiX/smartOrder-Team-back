const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(express.json());


require("./orderModel");
require("../Restaurant/restaurantModel");
require("../Foods/foodModel");

const Order = mongoose.model("order");
const Restaurant = mongoose.model("restaurant");
const Food = mongoose.model("food");

// Crear una nueva orden
const createOrder = async (req, res) => {
    const { restaurant, customer, items, price } = req.body;

    try {
        // Verificar que el restaurante existe
        const restaurantExists = await Restaurant.findOne({ id: restaurant });
        if (!restaurantExists) {
            return res.status(404).json({
                status: "error",
                data: "Restaurante no encontrado"
            });
        }

        // Verificar que todos los items existen
        const itemNames = items.map(i => i.name);
        const foods = await Food.find({ name: { $in: itemNames }, restaurant });

        if (foods.length !== items.length) {
            const missing = itemNames.filter(n => !foods.some(f => f.name === n));
            return res.status(404).json({
                status: "error",
                data: `Platillos no encontrados: ${missing.join(", ")}`
            });
        }

        // Generar ID único para la orden
        const orderId = `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        const newOrder = await Order.create({
            id: orderId,
            restaurant,
            customer,
            items,
            price,
        });

        res.status(201).json({
            status: "ok",
            data: "Orden creada exitosamente",
            order: newOrder
        });
    } catch (error) {
        console.error("Error al crear orden:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

// Obtener una orden específica por ID
const getOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findOne({ id: id });

        if (!order) {
            return res.status(404).json({
                status: "error",
                data: "Orden no encontrada"
            });
        }

        res.status(200).json({
            status: "ok",
            data: order
        });
    } catch (error) {
        console.error("Error al obtener orden:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

// Obtener todas las órdenes de un restaurante
const getOrdersByRestaurant = async (req, res) => {
    const restaurant = req.params.id;

    try {
        const orders = await Order.find({ restaurant: restaurant }).sort({ createdAt: -1 })
        .exec();

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                status: "error",
                data: "No se encontraron órdenes para este restaurante"
            });
        }

        res.status(200).json({
            status: "ok",
            data: orders
        });
    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

// Obtener las ordenes pendientes de un restaurante
const getPendingOrders = async (req, res) => {
    const restaurant = req.params.id;
    
    try {
        const orders = await Order.find({ restaurant: restaurant, status: "pending" });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                status: "error",
                data: "No se encontraron órdenes pendientes para este restaurante"
            });
        }

        res.status(200).json({
            status: "ok",
            data: orders
        });
    } catch (error) {
        console.error("Error al obtener órdenes pendientes:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

// Obtener todas las órdenes de un cliente
const getOrdersByCustomer = async (req, res) => {
    const customer = req.param.gmail;

    try {
        const orders = await Order.find({ customer: customer }).sort({ createdAt: -1 })
        .exec();

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                status: "error",
                data: "No se encontraron órdenes para este cliente"
            });
        }

        res.status(200).json({
            status: "ok",
            data: orders
        });
    } catch (error) {
        console.error("Error al obtener órdenes del cliente:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

// Actualizar el estado de una orden
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Verificar que la orden existe
        const order = await Order.findOne({ id: id });

        if (!order) {
            return res.status(404).json({
                status: "error",
                data: "Orden no encontrada"
            });
        }

        // Verificar que el estado es válido
        const validStatuses = ["pending", "in_progress", "completed", "canceled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: "error",
                data: "Estado no válido. Estados permitidos: pending, in_progress, completed, canceled"
            });
        }

        await Order.updateOne(
            { id: id },
            { $set: { status: status } }
        );

        res.status(200).json({
            status: "ok",
            data: "Estado de la orden actualizado exitosamente",
        });
    } catch (error) {
        console.error("Error al actualizar estado de la orden:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

// Eliminar una orden
const deleteOrder = async (req, res) => {
    const id = req.params;

    try {
        const order = await Order.findOne({ id: id });

        if (!order) {
            return res.status(404).json({
                status: "error",
                data: "Orden no encontrada"
            });
        }

        // Solo permitir eliminar órdenes canceladas o completadas
        if (order.status === "pending" || order.status === "in_progress") {
            return res.status(400).json({
                status: "error",
                data: "No se puede eliminar una orden que está pendiente o en progreso"
            });
        }

        await Order.deleteOne({ id: id });

        res.status(200).json({
            status: "ok",
            data: "Orden eliminada exitosamente"
        });
    } catch (error) {
        console.error("Error al eliminar orden:", error);
        res.status(500).json({
            status: "error",
            data: "Error interno del servidor"
        });
    }
};

module.exports = {
    createOrder,
    getOrder,
    getOrdersByRestaurant,
    getOrdersByCustomer,
    updateOrderStatus,
    deleteOrder,
    getPendingOrders
};
