const express = require("express");
const router = express.Router();

const userController = require("../src/Api/Users/userController");
const rolesController = require("../src/api/Role/RolesController");

const authMiddleware = require("../src/Middleware/authMiddleware");

// Rutas para autenticación de usuarios
router.get("/userData", authMiddleware, userController.userData);
router.put("/updateUser", authMiddleware, userController.updateUser);
router.get("/get-All-User", authMiddleware, userController.getAllUsers);
router.delete("/deleteUser", authMiddleware, userController.deleteUser);

// Rutas para roles
router.post("/newRole", authMiddleware, rolesController.newRole);
router.get("/roles/:id", authMiddleware, rolesController.getRole);
router.get("/roles", authMiddleware, rolesController.getAllRoles);
router.delete("/roles/:id", authMiddleware, rolesController.deleteRole);

module.exports = router;