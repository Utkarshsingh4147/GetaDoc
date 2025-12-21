const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -resetOtp -resetOtpExpire");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: id });
      if (doctorProfile) {
        await Appointment.deleteMany({ doctorId: doctorProfile._id });
        await Doctor.findByIdAndDelete(doctorProfile._id);
      }
    }

    if (user.role === "patient") {
      await Appointment.deleteMany({ patientId: id });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `${user.role} and all associated records deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};