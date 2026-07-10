import React from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";

/** Select dropdown */
function SelectInput({
  label,
  labelNp,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}: {
  label: string;
  labelNp: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; text?: string }[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="form-field">
      <label className="form-field__label">
        {labelNp} / {label}
      </label>
      <select
        className="form-field__input form-field__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const APPOINTMENT_LOCATIONS = [
  { value: "335000C", label: "Narayanhiti Durbar(Old Departmet of Passport)/नारायणहिटी दरबार (पूरानो राहदानी विभाग" },
  { value: "334000A", label: "DAO Lalitpur/जिल्ला प्रशासन कार्यालय ललितपुर" },
  { value: "112000A", label: "DAO Jhapa/जिल्ला प्रशासन कार्यालय झापा" },
  { value: "113000A", label: "DAO Morang/जिल्ला प्रशासन कार्यालय मोरङ" },
  { value: "114000A", label: "DAO Sunsari/जिल्ला प्रशासन कार्यालय सुनसरी" },
  { value: "114000B", label: "DAO Dharan/ईलाका प्रशासन कार्यालय धरान" },
  { value: "331000A", label: "DAO Chitwan/जिल्ला प्रशासन कार्यालय चितवन" },
  { value: "332000A", label: "DAO Makawanpur/जिल्ला प्रशासन कार्यालय मकवानपुर" },
  { value: "329000A", label: "DAO Nuwakot/जिल्ला प्रशासन कार्यालय नुवाकोट" },
  { value: "436000A", label: "DAO Gorkha/जिल्ला प्रशासन कार्यालय गोरखा" },
  { value: "113116A", label: "AAO Urlabari/ईलाका प्रशासन कार्यालय उर्लाबारी" },
  { value: "222000A", label: "DAO Parsa/जिल्ला प्रशासन कार्यालय पर्सा" },
  { value: "216000A", label: "DAO Siraha/जिल्ला प्रशासन कार्यालय सिराहा" },
  { value: "216000B", label: "AAO Lahan/ईलाका प्रशासन कार्यालय लहान" },
  { value: "326000A", label: "DAO Kavrepalanchock/जिल्ला प्रशासन कार्यालय काभ्रेपलाञ्चोक" },
  { value: "438000A", label: "DAO Tanahun/जिल्ला प्रशासन कार्यालय तनहुँ" },
  { value: "335000D", label: "Others/अन्य" }
];

export default function AppointmentTab() {
  const additional = useEnrollmentStore((state) => state.additional);
  const updateAdditionalField = useEnrollmentStore((state) => state.updateAdditionalField);
  const nextStep = useEnrollmentStore((state) => state.nextStep);
  const prevStep = useEnrollmentStore((state) => state.prevStep);

  // Fallback check to prevent crashes if 'additional' is somehow undefined
  if (!additional) return null;

  return (
    <div className="form-tab-panel fade-in">
      <div className="form-section">
        <h3 className="form-section__title">
          Biometric Appointment / बायोमेट्रिक
        </h3>
        
        <div className="form-grid">
          <SelectInput
            label="Appointment Location"
            labelNp="बायोमेट्रिक दिने स्थान"
            value={additional.appointmentLocation || ""}
            onChange={(val) => updateAdditionalField("appointmentLocation", val)}
            options={APPOINTMENT_LOCATIONS}
            required
          />

          <div className="form-field">
            <label className="form-field__label">
              मिति / Preferred Date (YYYY-MM-DD)
            </label>
            <input
              type="text"
              className="form-field__input"
              value={additional.appointmentDate || ""}
              onChange={(e) => updateAdditionalField("appointmentDate", e.target.value)}
              placeholder="e.g. २०८३-०३-२९"
            />
            <small style={{color: "#6b7280", marginTop: "4px", display: "block"}}>Leave blank to pick manually on the portal.</small>
          </div>

          <SelectInput
            label="Time Slot"
            labelNp="समय"
            value={additional.appointmentTimeSlot || "Any"}
            onChange={(val) => updateAdditionalField("appointmentTimeSlot", val)}
            options={[
              { value: "Any", label: "Any Available Slot" },
              { value: "09:00-10:00", label: "09:00-10:00" },
              { value: "10:00-11:00", label: "10:00-11:00" },
              { value: "11:00-12:00", label: "11:00-12:00" },
              { value: "12:00-01:00", label: "12:00-01:00" },
              { value: "01:00-02:00", label: "01:00-02:00" },
              { value: "02:00-03:00", label: "02:00-03:00" },
              { value: "03:00-04:00", label: "03:00-04:00" },
              { value: "04:00-05:00", label: "04:00-05:00" },
            ]}
          />
        </div>
      </div>

      <div className="form-nav">
        <button className="btn btn--secondary" onClick={prevStep}>
          ← Back
        </button>
        <button className="btn btn--primary" onClick={nextStep}>
          Next Step →
        </button>
      </div>
    </div>
  );
}
