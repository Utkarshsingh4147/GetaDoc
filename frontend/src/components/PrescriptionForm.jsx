import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { Pill, Plus, Trash2, ClipboardList, Clock, Activity, Save } from "lucide-react";

const PrescriptionForm = ({ appointmentId, onSuccess }) => {
  const [content, setContent] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);

  const handleMedicineChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedicineRow = (index) => {
    const values = [...medicines];
    values.splice(index, 1);
    setMedicines(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentId) {
      return toast.error("Appointment ID is missing");
    }

    try {
      const response = await api.put("/appointments/complete", {
        appointmentId,
        prescriptionContent: content,
        medicines
      });

      if (response.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting prescription", error);
      const errorMsg = error.response?.data?.message || "Server connection failed";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="card w-full bg-base-100 p-4">
      <div className="card-body p-0">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <ClipboardList size={28} />
          <h2 className="card-title text-2xl">Medical Prescription</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Diagnosis Section */}
          <div className="form-control w-full flex">
            <label className="label mx-5">
              <span className="label-text font-semibold flex items-center gap-2">
                <Activity size={16} /> Clinical Notes & Diagnosis
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-28 focus:textarea-primary text-base mx-auto"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed diagnosis, symptoms, and advice..."
              required
            />
          </div>

          <div className="divider text-xs uppercase tracking-widest opacity-50">Recommended Medication</div>

          {/* Medicines List */}
          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div key={index} className="group relative grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-base-200 rounded-xl transition-all hover:bg-base-300/50">

                <div className="md:col-span-4">
                  <label className="label py-0"><span className="label-text-alt flex items-center gap-1"><Pill size={12} /> Medicine Name</span></label>
                  <input
                    name="name"
                    className="input input-sm input-bordered w-full"
                    value={medicine.name}
                    onChange={(e) => handleMedicineChange(index, e)}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label py-0"><span className="label-text-alt">Dosage</span></label>
                  <input
                    name="dosage"
                    placeholder="500mg"
                    className="input input-sm input-bordered w-full"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(index, e)}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="label py-0"><span className="label-text-alt flex items-center gap-1"><Clock size={12} /> Frequency</span></label>
                  <input
                    name="frequency"
                    placeholder="1-0-1 (After Food)"
                    className="input input-sm input-bordered w-full"
                    value={medicine.frequency}
                    onChange={(e) => handleMedicineChange(index, e)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label py-0"><span className="label-text-alt">Duration</span></label>
                  <input
                    name="duration"
                    placeholder="7 Days"
                    className="input input-sm input-bordered w-full"
                    value={medicine.duration}
                    onChange={(e) => handleMedicineChange(index, e)}
                  />
                </div>

                <div className="md:col-span-1 flex items-end justify-center pb-1">
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/20"
                      onClick={() => removeMedicineRow(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={addMedicineRow}
              className="btn btn-outline btn-sm gap-2"
            >
              <Plus size={16} /> Add Medicine
            </button>
            <button type="submit" className="btn btn-primary gap-2 shadow-lg">
              <Save size={18} /> Complete Visit & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;