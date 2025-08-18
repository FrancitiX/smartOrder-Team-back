const express = require("express");
const router = express.Router();

const userController = require("../src/Api/Users/userController");
const rolesController = require("../src/Api/Role/RolesController");
const restaurantController = require("../src/Api/Restaurant/restaurantController");
const foodController = require("../src/Api/Foods/foodController");
const orderController = require("../src/Api/Order/orderController");

const authMiddleware = require("../src/middleware/authMiddleware");

// Rutas para autenticación de usuarios
router.post("/newUser", authMiddleware, userController.registerUser);
router.get("/userData", authMiddleware, userController.userData);
router.put("/updateUser", authMiddleware, userController.updateUser);
router.get("/get-All-User", authMiddleware, userController.getAllUsers);
router.delete("/deleteUser", authMiddleware, userController.deleteUser);

// Rutas para roles
router.post("/newRole", authMiddleware, rolesController.newRole);
router.get("/roles/:id", authMiddleware, rolesController.getRole);
router.get("/roles", authMiddleware, rolesController.getAllRoles);
router.delete("/roles/:id", authMiddleware, rolesController.deleteRole);

// Rutas para restaurantes
router.post("/addRestaurant", authMiddleware, restaurantController.registerRestaurant);
router.put("/updateRestaurant", authMiddleware, restaurantController.updateRestaurant);
router.delete("/deleteRestaurant/:restaurant", authMiddleware, restaurantController.deleteRestaurant);
router.get("/:restaurant/stats", authMiddleware, restaurantController.getRestaurantStats);
router.get("/favRestaurants", authMiddleware, restaurantController.getFavRestaurants);

// Rutas para platillos
router.post("/addFood", authMiddleware, foodController.createFood);
router.put("/updateFood", authMiddleware, foodController.updateFood);
router.put("/updateFoodSales", authMiddleware, foodController.updateFoodSales);
router.delete("/deleteFood/:restaurant/:food", authMiddleware, foodController.deleteFood);
router.get("/:restaurant/foods/search/:query", authMiddleware, foodController.searchFoods);

// Rutas para ordenes
router.post("/addOrder", authMiddleware, orderController.createOrder);
router.get("/restaurant/:id/orders", authMiddleware, orderController.getOrdersByRestaurant);
router.get("/customer/:gmail/orders", authMiddleware, orderController.getOrdersByCustomer);
router.get("/orders/:id", authMiddleware, orderController.getOrder);
router.put("/updateOrder/:id", authMiddleware, orderController.updateOrderStatus);
router.get("/restaurant/:id/pendingOrders", authMiddleware, orderController.getPendingOrders);
router.delete("/deleteOrder/:id", authMiddleware, orderController.deleteOrder);

module.exports = router;