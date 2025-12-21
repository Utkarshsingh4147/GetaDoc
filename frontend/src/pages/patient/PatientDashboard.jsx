import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Stethoscope,
  Clock,
  IndianRupee,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const navigate = useNavigate();

  const availableSpecializations = [
    "All",
    ...new Set(doctors.map((doc) => doc.specialization)),
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.userId?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDropdown =
      selectedSpecialization === "All" ||
      doc.specialization === selectedSpecialization;

    return matchesSearch && matchesDropdown;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, apptRes] = await Promise.all([
          api.get("/doctors"),
          api.get("/appointments/my-appointments"),
        ]);
        setDoctors(docRes.data.doctors || []);
        setMyAppointments(apptRes.data.appointments || []);
      } catch (error) {
        toast.error("Failed to sync dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <span className="loading loading-bars loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100"> {/* Darker background for more contrast */}
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* --- WELCOME HEADER --- */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">
              Hello, <span className="text-primary">{user?.name || "Patient"}</span>! 👋
            </h1>
            <p className="text-slate-600 text-lg mt-2 font-medium">
              Manage your health, view your schedule, and book new consultations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT: DOCTOR DISCOVERY --- */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="text-primary" size={28} /> Available Specialists
              </h2>
              <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                {filteredDoctors.length} Doctors
              </span>
            </div>

            {/* --- FILTER SECTION --- */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="input input-bordered w-full pl-12 bg-slate-50 border-slate-300 text-slate-900 focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full md:w-72">
                <select
                  className="select select-bordered w-full bg-slate-50 border-slate-300 text-slate-900 font-bold focus:border-primary"
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                >
                  {availableSpecializations.map((spec, index) => (
                    <option key={index} value={spec} className="text-slate-900">
                      {spec === "All" ? "🔍 All Specializations" : spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- DOCTOR LIST --- */}
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-300 shadow-inner">
                <p className="text-slate-500 font-semibold text-lg">No doctors match your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor._id} className="group card bg-white hover:shadow-2xl transition-all duration-300 border border-slate-200 overflow-hidden shadow-sm">
                    <div className="card-body p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <User size={32} />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors">
                            Dr. {doctor.userId?.name}
                          </h3>
                          <p className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg inline-block mt-1">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Experience</span>
                          <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <Clock size={16} className="text-primary" />
                            <span>{doctor.experience} Yrs</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Fee</span>
                          <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-lg">
                            <IndianRupee size={16} />
                            <span>{doctor.fees}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary w-full rounded-xl gap-3 mt-6 text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform"
                        onClick={() => navigate(`/dashboard/patient/book/${doctor._id}`)}
                      >
                        Book Appointment <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: APPOINTMENTS --- */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sticky top-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Calendar className="text-rose-600" size={24} /> My Schedule
              </h2>

              <div className="space-y-4">
                {myAppointments.length > 0 ? (
                  myAppointments.slice(0, 5).map((appt) => (
                    <div key={appt._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          appt.status === "approved" ? "bg-emerald-500 text-white" : 
                          appt.status === "rejected" ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                        }`}>
                          {appt.status}
                        </span>
                        <p className="text-xs text-slate-500 font-bold">{appt.time}</p>
                      </div>
                      <p className="font-bold text-slate-900 text-base truncate">Dr. {appt.doctorId?.userId?.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{appt.date}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-400 font-bold">No upcoming visits found.</p>
                  </div>
                )}
                <button 
                  className="btn btn-ghost btn-block btn-sm text-primary font-bold mt-4 hover:bg-primary/5" 
                  onClick={() => navigate("/dashboard/patient/appointments")}
                >
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PatientDashboard;