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
  { value: "Narayanmiti Durbar(Old Department of Passport)/नारायणहिटी दरबार (पुरानो राहदानी विभाग)", label: "Narayanmiti Durbar(Old Department of Passport)" },
  { value: "DAO Lalitpur/जिल्ला प्रशासन कार्यालय ललितपुर", label: "DAO Lalitpur/जिल्ला प्रशासन कार्यालय ललितपुर" },
  { value: "DAO Jhapa/जिल्ला प्रशासन कार्यालय झापा", label: "DAO Jhapa/जिल्ला प्रशासन कार्यालय झापा" },
  { value: "DAO Morang/जिल्ला प्रशासन कार्यालय मोरङ", label: "DAO Morang/जिल्ला प्रशासन कार्यालय मोरङ" },
  { value: "DAO Sunsari/जिल्ला प्रशासन कार्यालय सुनसरी", label: "DAO Sunsari/जिल्ला प्रशासन कार्यालय सुनसरी" },
  { value: "DAO Dharan/ईलाका प्रशासन कार्यालय धरान", label: "DAO Dharan/ईलाका प्रशासन कार्यालय धरान" },
  { value: "DAO Chitwan/जिल्ला प्रशासन कार्यालय चितवन", label: "DAO Chitwan/जिल्ला प्रशासन कार्यालय चितवन" },
  { value: "DAO Makawanpur/जिल्ला प्रशासन कार्यालय मकवानपुर", label: "DAO Makawanpur/जिल्ला प्रशासन कार्यालय मकवानपुर" },
  { value: "DAO Nuwakot/जिल्ला प्रशासन कार्यालय नुवाकोट", label: "DAO Nuwakot/जिल्ला प्रशासन कार्यालय नुवाकोट" },
  { value: "DAO Gorkha/जिल्ला प्रशासन कार्यालय गोरखा", label: "DAO Gorkha/जिल्ला प्रशासन कार्यालय गोरखा" },
  { value: "AAO Urlabari/ईलाका प्रशासन कार्यालय उर्लाबारी", label: "AAO Urlabari/ईलाका प्रशासन कार्यालय उर्लाबारी" },
  { value: "DAO Parsa/जिल्ला प्रशासन कार्यालय पर्सा", label: "DAO Parsa/जिल्ला प्रशासन कार्यालय पर्सा" },
  { value: "DAO Siraha/जिल्ला प्रशासन कार्यालय सिराहा", label: "DAO Siraha/जिल्ला प्रशासन कार्यालय सिराहा" },
  { value: "AAO Lahan/ईलाका प्रशासन कार्यालय लहान", label: "AAO Lahan/ईलाका प्रशासन कार्यालय लहान" },
  { value: "DAO Kavrepalanchock/जिल्ला प्रशासन कार्यालय काभ्रेपलाञ्चोक", label: "DAO Kavrepalanchock/जिल्ला प्रशासन कार्यालय काभ्रेपलाञ्चोक" },
  { value: "DAO Tanahun/जिल्ला प्रशासन कार्यालय तनहुँ", label: "DAO Tanahun/जिल्ला प्रशासन कार्यालय तनहुँ" }
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
