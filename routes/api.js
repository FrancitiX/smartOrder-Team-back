const express = require("express");
const router = express.Router();

const userController = require("../src/Api/Users/userController");
// const user_imageController = require("../src/Api/User_Image/user_imageController");
const notificationController = require("../src/Api/Notifications/NotificationController");


// Solicitudes de usuario

router.post("/singIn", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/get-All-User", userController.getAllUsers);


//Solicitudes a la base de datos para imagenes

// router.put(
//   "/:user/updateUser-Image",
//   user_imageController.upload.single("image"),
//   user_imageController.updateUserImages
// );
// router.post("/:user/userImage", user_imageController.userImage);


//Solicitudes de notificaciones

router.post("/newNotification", notificationController.newNotification);
router.get("/get-All-Notifications", notificationController.getNotifications);
router.post("/notifications", notificationController.getPushNotifications);
router.get("/getNotification", notificationController.getNotification);
router.put("/getNotification", notificationController.updateNotification);
router.delete("/getNotification", notificationController.deleteNotification);

module.exports = router;