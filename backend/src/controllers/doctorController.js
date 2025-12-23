const Doctor = require("../models/Doctor");
const User = require("../models/User");

exports.createDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { specialization, experience, fees, availableSlots } = req.body;

    if (!specialization || !experience || !fees) {
      return res.status(400).json({
        success: false,
        message: "Missing professional details",
      });
    }
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists",
      });
    }

    const doctor = await Doctor.create({
      userId,
      specialization,
      experience,
      fees,
      availableSlots: availableSlots || [],
    });

    res.status(201).json({
      success: true,
      message: "Doctor profile Created",
      doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "name email");

    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    doctor.availableSlots = availableSlots;
    await doctor.save();

    res.json({
      success: true,
      message: "Availability updated",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
