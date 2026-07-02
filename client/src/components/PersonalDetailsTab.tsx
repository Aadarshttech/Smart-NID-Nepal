/**
 * PersonalDetailsTab — Editable form for personal information
 * Pre-filled from AI extraction, user can correct any field.
 * Also includes "Additional Information" section for fields
 * not present on the citizenship certificate but required by DoNIDCR.
 */

import { useEnrollmentStore } from "../store/enrollmentStore";
import type { NameField, ExtractionResult } from "../types/extraction";
import {
  MARITAL_STATUS_OPTIONS,
  CC_TYPE_OPTIONS,
  EDUCATION_OPTIONS,
  PROFESSION_OPTIONS,
  CASTE_OPTIONS,
  RELIGION_OPTIONS,
} from "../types/extraction";

/** Bilingual name input (nepali + english side by side) */
function NameInput({
  label,
  labelNp,
  value,
  onChange,
}: {
  label: string;
  labelNp: string;
  value: NameField;
  onChange: (val: NameField) => void;
}) {
  return (
    <div className="form-field">
      <label className="form-field__label">
        {labelNp} / {label}
      </label>
      <div className="form-field--bilingual">
        <div className="form-field__input-group">
          <span className="form-field__input-tag">नेपाली</span>
          <input
            type="text"
            className="form-field__input form-field__input--np"
            value={value.nepali}
            onChange={(e) => onChange({ ...value, nepali: e.target.value })}
            placeholder={`${labelNp}`}
          />
        </div>
        <div className="form-field__input-group">
          <span className="form-field__input-tag">English</span>
          <input
            type="text"
            className="form-field__input"
            value={value.english}
            onChange={(e) => onChange({ ...value, english: e.target.value })}
            placeholder={`${label}`}
          />
        </div>
      </div>
    </div>
  );
}

/** Simple text input */
function TextInput({
  label,
  labelNp,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  labelNp: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="form-field">
      <label className="form-field__label">
        {labelNp} / {label}
      </label>
      <input
        type="text"
        className="form-field__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    </div>
  );
}

/** Select dropdown */
function SelectInput({
  label,
  labelNp,
  value,
  onChange,
  options,
}: {
  label: string;
  labelNp: string;
  value: string;
  onChange: (val: string) => void;
  options: { val: string; text: string }[];
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
      >
        {options.map((opt) => (
          <option key={opt.val} value={opt.val}>
            {opt.text}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PersonalDetailsTab() {
  const { draft, additional, updateDraftField, updateAdditionalField, nextStep } =
    useEnrollmentStore();

  if (!draft) return null;

  const handleNameChange = (field: keyof ExtractionResult) => (val: NameField) => {
    updateDraftField(field, val as ExtractionResult[typeof field]);
  };

  const canProceed =
    draft.firstName.english.trim() !== "" &&
    draft.lastName.english.trim() !== "" &&
    draft.dobBS.trim() !== "" &&
    draft.gender !== "";

  return (
    <div className="form-tab-panel fade-in">
      {/* ── AI-Extracted Personal Info ── */}
      <div className="form-section">
        <h3 className="form-section__title">
          👤 व्यक्तिगत विवरण / Personal Information
        </h3>
        <p className="form-section__hint">
          AI ले तपाईंको नागरिकताबाट निकालेको डाटा तल देखाइएको छ। कृपया जाँच गर्नुहोस् र आवश्यक भएमा सम्पादन गर्नुहोस्।
        </p>

        <div className="form-grid">
          <NameInput
            label="First Name"
            labelNp="पहिलो नाम"
            value={draft.firstName}
            onChange={handleNameChange("firstName")}
          />
          <NameInput
            label="Middle Name"
            labelNp="बीचको नाम"
            value={draft.middleName}
            onChange={handleNameChange("middleName")}
          />
          <NameInput
            label="Last Name"
            labelNp="थर"
            value={draft.lastName}
            onChange={handleNameChange("lastName")}
          />
        </div>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Date of Birth (BS)"
            labelNp="जन्म मिति"
            value={draft.dobBS}
            onChange={(val) => updateDraftField("dobBS", val)}
            placeholder="YYYY-MM-DD"
          />
          <TextInput
            label="Date of Birth (AD)"
            labelNp="जन्म मिति (ईस्वी)"
            value={draft.dobAD}
            onChange={(val) => updateDraftField("dobAD", val)}
            placeholder="YYYY-MM-DD"
          />
          <div className="form-field">
            <label className="form-field__label">लिङ्ग / Gender</label>
            <select
              className="form-field__input form-field__select"
              value={draft.gender}
              onChange={(e) =>
                updateDraftField(
                  "gender",
                  e.target.value as ExtractionResult["gender"]
                )
              }
            >
              <option value="">-- Select --</option>
              <option value="MALE">Male / पुरुष</option>
              <option value="FEMALE">Female / महिला</option>
              <option value="OTHER">Other / अन्य</option>
            </select>
          </div>
        </div>

        <div className="form-grid form-grid--1col">
          <TextInput
            label="Birth Place"
            labelNp="जन्म स्थान"
            value={draft.birthPlace}
            onChange={(val) => updateDraftField("birthPlace", val)}
          />
        </div>
      </div>

      {/* ── Additional Information (User-entered, NOT on citizenship) ── */}
      <div className="form-section">
        <h3 className="form-section__title">
          📋 थप जानकारी / Additional Information
        </h3>
        <p className="form-section__hint" style={{ color: "var(--crimson)", fontWeight: 500 }}>
          ⚠️ यी क्षेत्रहरू नागरिकतामा छैनन् — कृपया आफैं भर्नुहोस्। (These fields are NOT on your citizenship — please fill them manually.)
        </p>

        <div className="form-grid form-grid--3col">
          <SelectInput
            label="CC Type"
            labelNp="नागरिकताको किसिम"
            value={additional.ccType}
            onChange={(val) => updateAdditionalField("ccType", val)}
            options={CC_TYPE_OPTIONS}
          />
          <SelectInput
            label="Marital Status"
            labelNp="वैवाहिक स्थिति"
            value={additional.maritalStatus}
            onChange={(val) => updateAdditionalField("maritalStatus", val)}
            options={MARITAL_STATUS_OPTIONS}
          />
          <SelectInput
            label="Religion"
            labelNp="धर्म"
            value={additional.religion}
            onChange={(val) => updateAdditionalField("religion", val)}
            options={RELIGION_OPTIONS}
          />
        </div>

        <div className="form-grid form-grid--3col">
          <SelectInput
            label="Education"
            labelNp="शैक्षिक योग्यता"
            value={additional.educationLevel}
            onChange={(val) => updateAdditionalField("educationLevel", val)}
            options={EDUCATION_OPTIONS}
          />
          <SelectInput
            label="Profession"
            labelNp="व्यवसाय"
            value={additional.profession}
            onChange={(val) => updateAdditionalField("profession", val)}
            options={PROFESSION_OPTIONS}
          />
          <SelectInput
            label="Caste"
            labelNp="जात जाति"
            value={additional.caste}
            onChange={(val) => updateAdditionalField("caste", val)}
            options={CASTE_OPTIONS}
          />
        </div>

        <div className="form-grid form-grid--2col">
          <TextInput
            label="Phone No."
            labelNp="फोन नं."
            value={additional.phoneNo}
            onChange={(val) => updateAdditionalField("phoneNo", val)}
          />
          <TextInput
            label="Mobile No."
            labelNp="मोबाईल नं."
            value={additional.mobileNo}
            onChange={(val) => updateAdditionalField("mobileNo", val)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <div /> {/* Spacer — no back button on first tab */}
        <button
          className="btn btn--primary"
          onClick={nextStep}
          disabled={!canProceed}
        >
          Next: Document & Family →
        </button>
      </div>

      {!canProceed && (
        <p className="form-nav__hint">
          Please fill in First Name, Last Name, Date of Birth, and Gender to continue.
        </p>
      )}
    </div>
  );
}
