const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');

const connectDB = require('./src/config/db');

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const doctorAuthRoutes = require("./src/routes/doctorAuthRoutes");


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://getadoc.onrender.com", //
    credentials: true,               // allow cookies
  })
);

//connect DB
connectDB();

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor", doctorAuthRoutes);

app.get('/',(req, res)=>{
    res.send({success : true, message : "Welcome to Getadoc"});
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("App running on the port", PORT);
});
