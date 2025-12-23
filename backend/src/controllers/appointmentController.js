const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// Book a new appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check for existing double booking (excluding rejected ones)
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: "rejected" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked",
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user.userId, // This is the User ID
      doctorId,                   // This is the Doctor Profile ID
      date,
      time,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointments based on role (Fixed Doctor filtering)
exports.getMyAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter.patientId = req.user.userId;
    }

    if (req.user.role === "doctor") {
      // FIX: Find the Doctor profile associated with the logged-in User ID
      const doctorProfile = await Doctor.findOne({ userId: req.user.userId });

      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      // Filter by the profile ID found in the Doctor collection
      filter.doctorId = doctorProfile._id;
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete appointment (Fixed Doctor check)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // --- PATIENT AUTHORIZATION ---
    if (req.user.role === "patient") {
      // Use toString() on both sides to avoid Object vs String comparison issues
      const patientIdInDb = appointment.patientId.toString();
      const userIdFromToken = req.user.userId.toString();

      if (patientIdInDb !== userIdFromToken) {
        return res.status(403).json({
          success: false,
          message: "Not authorized: You do not own this appointment"
        });
      }
    }

    // --- DOCTOR AUTHORIZATION ---
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: req.user.userId });

      if (!doctorProfile) {
        return res.status(404).json({ success: false, message: "Doctor profile not found" });
      }

      const doctorIdInAppt = appointment.doctorId.toString();
      const doctorProfileId = doctorProfile._id.toString();

      if (doctorIdInAppt !== doctorProfileId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized: This appointment is not assigned to you"
        });
      }
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete Appointment and Add Prescription
exports.completeAppointment = async (req, res) => {
  try {
    const { appointmentId, prescriptionContent, medicines } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot complete a rejected appointment"
      });
    }

    const doctorProfile = await Doctor.findOne({ userId: req.user.userId });
    if (!doctorProfile || appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this appointment",
      });
    }

    appointment.status = "completed";
    appointment.visited = true;
    appointment.prescription = {
      content: prescriptionContent,
      medicines: medicines,
    };
    appointment.prescribedAt = Date.now();

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment marked as completed and prescription saved",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Updated updateAppointmentStatus to allow 'completed'
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Allow 'completed' in the status check
    if (!["approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const doctorProfile = await Doctor.findOne({ userId: req.user.userId });
    if (!doctorProfile || appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }

    appointment.status = status;
    // Automatically mark visited if status is set to completed here
    if (status === "completed") {
      appointment.visited = true;
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};