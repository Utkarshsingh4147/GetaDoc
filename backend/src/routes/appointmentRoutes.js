const express = require("express");
const router = express.Router();

const { bookAppointment, getMyAppointments, updateAppointmentStatus, deleteAppointment,completeAppointment } = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, bookAppointment);

router.get("/my-appointments", authMiddleware, getMyAppointments);

router.delete("/:id", authMiddleware, deleteAppointment);

router.put("/:id/status", authMiddleware, updateAppointmentStatus);

router.put("/complete", authMiddleware, completeAppointment);

module.exports = router;