import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { 
  Users, 
  Search,
  Trash2,
  Stethoscope,
  User,
  Calendar,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("doctor"); // 'doctor', 'patient', or 'booking'
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, apptRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/appointments")
      ]);
      setUsers(usersRes.data.users || []);
      setAppointments(apptRes.data.appointments || []);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm("Delete this user? This removes all associated data.")) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success("User deleted");
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Logic for Users and Appointments filtering
  const filteredUsers = users.filter((u) => 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())) && u.role === activeTab
  );

  const filteredAppointments = appointments.filter((a) => 
    a.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.doctorId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <span className="loading loading-infinity loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Control Center</h1>
            <p className="text-slate-500">Global system management & monitoring.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}s...`} 
              className="input input-bordered w-full md:w-80 pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- LEFT SIDEBAR: DIRECTORY --- */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4 px-2">Directory</h3>
              <div className="space-y-1">
                <TabButton active={activeTab === 'doctor'} onClick={() => setActiveTab("doctor")} icon={<Stethoscope size={18}/>} label="Specialists" />
                <TabButton active={activeTab === 'patient'} onClick={() => setActiveTab("patient")} icon={<User size={18}/>} label="Patients" />
                <TabButton active={activeTab === 'booking'} onClick={() => setActiveTab("booking")} icon={<Calendar size={18}/>} label="Bookings" />
              </div>
            </div>

            <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
               <TrendingUp size={40} className="mb-2 text-indigo-300 opacity-50" />
               <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Success Rate</p>
               <h2 className="text-4xl font-black">94%</h2>
               <p className="text-[10px] text-indigo-200 mt-2">Based on completed appointments</p>
            </div>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              
              {activeTab === 'booking' ? (
                /* --- BOOKINGS VIEW --- */
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-slate-50/50 text-black">
                        <th className="py-4">Appointment</th>
                        <th>Doctor</th>
                        <th>Schedule</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAppointments.map((a) => (
                        <tr key={a._id} className="hover:bg-slate-50/30">
                          <td className="py-4">
                            <div className="font-bold text-slate-700">{a.patientId?.name || "User"}</div>
                            <div className="text-xs text-slate-400 italic">ID: {a._id.slice(-6)}</div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Stethoscope size={14} className="text-primary" />
                              <span className="text-sm font-medium text-slate-400">Dr. {a.doctorId?.userId?.name || "Specialist"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-sm font-bold text-slate-600">{a.date}</div>
                            <div className="text-xs text-slate-400">{a.slot}</div>
                          </td>
                          <td>
                            <StatusBadge status={a.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* --- USERS VIEW (Doctor/Patient) --- */
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-slate-50/50 text-black">
                        <th className="py-4">Identity</th>
                        <th>Joined</th>
                        <th className="text-right px-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/30">
                          <td className="py-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-100 text-blue-600 rounded-xl w-10 h-10 flex items-center justify-center font-bold">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-700">{u.name}</div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-sm text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-right px-6">
                            <button onClick={() => handleDeleteUser(u._id)} className="btn btn-ghost btn-sm text-slate-300 hover:text-error">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${active ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
  >
    {icon} {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    completed: "bg-blue-100 text-blue-700"
  };
  
  const icons = {
    pending: <Clock size={12} />,
    approved: <CheckCircle2 size={12} />,
    cancelled: <XCircle size={12} />,
    completed: <Activity size={12} />
  };

  return (
    <span className={`badge badge-sm border-none py-3 px-3 gap-1.5 font-bold uppercase text-[10px] ${styles[status] || styles.pending}`}>
      {icons[status]} {status}
    </span>
  );
};

export default AdminDashboard;