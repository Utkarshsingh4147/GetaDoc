const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    
    // Updated enum to include 'completed'
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },

    // New Fields for Visit and Prescription
    visited: {
      type: Boolean,
      default: false,
    },
    prescription: {
      content: { type: String }, // General notes or diagnosis
      medicines: [
        {
          name: { type: String },
          dosage: { type: String },   // e.g., "500mg"
          frequency: { type: String }, // e.g., "Twice a day"
          duration: { type: String },  // e.g., "5 days"
        },
      ],
    },
    prescribedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);