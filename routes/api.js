const express = require("express");
const router = express.Router();

const userController = require("../src/Api/Users/userController");
const user_imageController = require("../src/Api/User_Image/user_imageController");
const notificationController = require("../src/Api/Notifications/NotificationController");
const restaurantController = require("../src/Api/Restaurant/restaurantController");
const foodController = require("../src/Api/Foods/foodController");

// Solicitudes de usuario

router.post("/signIn", userController.registerUser);
router.post("/login", userController.loginUser);

//Solicitudes a la base de datos para imagenes de usuario

router.put(
  "/:user/updateUser-Image",
  user_imageController.uploadUsers.fields([
    { name: "image", maxCount: 1 },
    { name: "bgImage", maxCount: 1 },
  ]),
  user_imageController.updateUserImages
);

//Solicitudes de notificaciones
router.post("/newNotification", notificationController.newNotification);
router.get("/get-All-Notifications", notificationController.getNotifications);
router.post("/notifications", notificationController.getPushNotifications);
router.get("/getNotification", notificationController.getNotification);
router.put("/getNotification", notificationController.updateNotification);
router.delete("/getNotification", notificationController.deleteNotification);

//Solicitudes de restaurantes
router.get("/restaurants/:id", restaurantController.getRestaurant);
router.get("/restaurants/search", restaurantController.searchRestaurants);
router.get("/restaurants", restaurantController.getAllRestaurants);

//Solicitudes de alimentos
router.get("/restaurants/:id/foods", foodController.getFoodsByRestaurant);
router.get("/restaurants/:id/foods/:food", foodController.getFood);
router.get(
  "/restaurants/:id/foods/category/:category",
  foodController.getFoodsByCategory
);
router.get("/restaurants/:id/foods/search/:query", foodController.searchFoods);

module.exports = router;
