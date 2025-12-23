import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { 
  Check, 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  Filter, 
  ArrowLeft,
  FileText,
  CheckCircle,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PrescriptionForm from "../../components/PrescriptionForm";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, approved, pending, rejected, completed
  const [selectedAppt, setSelectedAppt] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments/my-appointments");
      setAppointments(res.data.appointments || []);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Appointment deleted");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to delete appointment");
    }
  };

  const handlePrescriptionSuccess = () => {
    document.getElementById("appt_prescription_modal").close();
    setSelectedAppt(null);
    toast.success("Prescription saved and visit completed");
    fetchAppointments();
  };

  const filteredAppointments = appointments.filter(appt => 
    filter === "all" ? true : appt.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 lg:p-10">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate("/dashboard/doctor")} 
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800">Appointment Ledger</h1>
            <p className="text-slate-500">View and manage clinical visits and prescriptions</p>
          </div>

          <div className="tabs tabs-boxed bg-white border border-slate-100 p-1 shadow-sm overflow-x-auto">
            {["all", "pending", "approved", "completed", "rejected"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`tab tab-sm md:tab-md capitalize font-medium ${filter === t ? "tab-active bg-primary text-white" : "text-slate-500"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* --- TABLE / LIST --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Records Found</h3>
              <p className="text-slate-500">There are no {filter !== "all" ? filter : ""} appointments to show.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full border-separate border-spacing-y-2 px-6">
                <thead>
                  <tr className="text-slate-400 uppercase text-[11px] tracking-widest border-none">
                    <th className="bg-transparent">Patient</th>
                    <th className="bg-transparent">Date & Time</th>
                    <th className="bg-transparent">Status</th>
                    <th className="bg-transparent text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="before:block before:h-2">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt._id} className="group transition-all">
                      <td className="bg-slate-50/50 rounded-l-2xl border-y border-l border-slate-100 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {appt.patientId?.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{appt.patientId?.name}</span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 border-y border-slate-100">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={14} className="text-slate-400" /> {appt.date}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={14} className="text-slate-400" /> {appt.time}
                          </div>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 border-y border-slate-100">
                        <span className={`badge badge-sm font-bold border-none py-3 px-4 ${
                          appt.status === "completed" ? "bg-blue-600 text-white shadow-sm shadow-blue-200" :
                          appt.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                          appt.status === "rejected" ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="bg-slate-50/50 rounded-r-2xl border-y border-r border-slate-100 text-right">
                        <div className="flex justify-end items-center gap-2 pr-2">
                          {/* --- ACTION: PENDING --- */}
                          {appt.status === "pending" && (
                            <>
                              <button 
                                onClick={() => updateStatus(appt._id, "approved")}
                                className="btn btn-sm btn-circle btn-ghost text-emerald-600 hover:bg-emerald-50"
                                title="Approve"
                              >
                                <Check size={20} />
                              </button>
                              <button 
                                onClick={() => updateStatus(appt._id, "rejected")}
                                className="btn btn-sm btn-circle btn-ghost text-rose-600 hover:bg-rose-50"
                                title="Reject"
                              >
                                <X size={20} />
                              </button>
                            </>
                          )}

                          {/* --- ACTION: APPROVED (Write Prescription) --- */}
                          {appt.status === "approved" && (
                            <button 
                              onClick={() => {
                                setSelectedAppt(appt);
                                document.getElementById("appt_prescription_modal").showModal();
                              }}
                              className="btn btn-primary btn-sm gap-2 rounded-xl"
                            >
                              <FileText size={16} /> Prescribe
                            </button>
                          )}

                          {/* --- ACTION: COMPLETED --- */}
                          {appt.status === "completed" && (
                             <div className="flex items-center gap-1 text-blue-600 font-bold text-xs pr-4">
                                <CheckCircle size={14} /> VISITED
                             </div>
                          )}

                          <button 
                            onClick={() => deleteAppointment(appt._id)}
                            className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Record"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- PRESCRIPTION MODAL --- */}
      <dialog id="appt_prescription_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-4xl p-0 bg-slate-50 overflow-hidden">
          <div className="p-6 bg-white border-b flex justify-between items-center">
            <h3 className="font-bold text-lg text-black flex items-center gap-2">
              <Stethoscope className="text-primary" /> 
              Consultation: {selectedAppt?.patientId?.name}
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost bg-red-500">✕</button>
            </form>
          </div>
          <div className="p-8">
            {selectedAppt && (
              <PrescriptionForm 
                appointmentId={selectedAppt._id} 
                onSuccess={handlePrescriptionSuccess} 
              />
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <Footer />
    </div>
  );
};

export default DoctorAppointments;