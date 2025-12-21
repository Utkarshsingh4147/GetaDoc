const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllUsers, getAllAppointments, deleteUser } = require("../controllers/adminController");

router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);

router.get("/appointments", authMiddleware, roleMiddleware("admin"), getAllAppointments);

router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

module.exports = router;