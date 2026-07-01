/**
 * PersonalDetailsTab — Editable form for personal information
 * Pre-filled from AI extraction, user can correct any field.
 */

import { useEnrollmentStore } from "../store/enrollmentStore";
import type { NameField, ExtractionResult } from "../types/extraction";

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

export default function PersonalDetailsTab() {
  const { draft, updateDraftField, nextStep } = useEnrollmentStore();

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
