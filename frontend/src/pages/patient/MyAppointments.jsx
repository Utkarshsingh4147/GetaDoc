import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Search, 
  Pill, 
  ClipboardList, 
  Printer,
  Stethoscope
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my-appointments");
      setAppointments(res.data.appointments || []);
    } catch (error) {
      toast.error("Failed to load your appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800">My Appointments</h1>
          <p className="text-slate-500">Track your bookings and view medical prescriptions</p>
        </div>

        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100">
              <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No appointments found.</p>
            </div>
          ) : (
            appointments.map((appt) => (
              <div 
                key={appt._id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Stethoscope size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Dr. {appt.doctorId?.userId?.name || "Doctor"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">{appt.doctorId?.specialization}</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1 text-xs font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-slate-600">
                        <Calendar size={12} /> {appt.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-slate-600">
                        <Clock size={12} /> {appt.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-4 md:pt-0">
                  <span className={`badge badge-md font-bold px-4 py-3 border-none ${
                    appt.status === "completed" ? "bg-blue-100 text-blue-700" :
                    appt.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    appt.status === "rejected" ? "bg-rose-100 text-rose-700" : 
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {appt.status}
                  </span>

                  {appt.status === "completed" && (
                    <button 
                      onClick={() => {
                        setSelectedAppt(appt);
                        document.getElementById("view_prescription_modal").showModal();
                      }}
                      className="btn btn-primary btn-sm gap-2 rounded-xl"
                    >
                      <FileText size={16} /> View Prescription
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- PRESCRIPTION MODAL --- */}
      <dialog id="view_prescription_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-3xl p-0 bg-white overflow-x-scroll">
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg text-white">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-xl text-black">Medical Prescription</h3>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost bg-red-500">✕</button>
            </form>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8" id="printable-prescription">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Doctor Details</p>
                <h4 className="text-lg font-medium text-gray-500">Dr. {selectedAppt?.doctorId?.userId?.name}</h4>
                <p className="text-sm text-slate-600">{selectedAppt?.doctorId?.specialization}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Date</p>
                <p className="font-medium text-gray-500">{selectedAppt?.date}</p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Diagnosis */}
            <div>
              <h5 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                <ClipboardList size={18} className="text-primary" /> Diagnosis & Clinical Notes
              </h5>
              <p className="text-slate-700 bg-slate-50 p-5 rounded-2xl italic leading-relaxed">
                {selectedAppt?.prescription?.content || "No specific notes provided."}
              </p>
            </div>

            {/* Medicines */}
            <div>
              <h5 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <Pill size={18} className="text-primary" /> Prescribed Medication
              </h5>
              <div className="overflow-x-auto border rounded-2xl border-slate-100">
                <table className="table w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-600">
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAppt?.prescription?.medicines?.map((med, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="font-bold text-primary">{med.name}</td>
                        <td>{med.dosage}</td>
                        <td><span className="badge badge-ghost font-medium">{med.frequency}</span></td>
                        <td>{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t flex justify-end">
            <button 
              className="btn btn-outline btn-primary gap-2"
              onClick={() => window.print()}
            >
              <Printer size={18} /> Print Records
            </button>
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

export default MyAppointments;