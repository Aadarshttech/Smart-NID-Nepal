/**
 * FamilyDetailsTab — Editable form for family information
 * (Father, Mother, Grandfather, Grandmother, Spouse).
 */

import { useEnrollmentStore } from "../store/enrollmentStore";
import type { NameField, ExtractionResult, AdditionalFields, FamilyMemberDetails } from "../types/extraction";
import { containsEnglishChars } from "../utils/validation";

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
            placeholder={labelNp}
          />
          {containsEnglishChars(value.nepali) && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              ⚠️ English characters detected!
            </div>
          )}
        </div>
        <div className="form-field__input-group">
          <span className="form-field__input-tag">English</span>
          <input
            type="text"
            className="form-field__input"
            value={value.english}
            onChange={(e) => onChange({ ...value, english: e.target.value })}
            placeholder={label}
          />
        </div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  labelNp,
  value,
  onChange,
  placeholder,
  validateNepali,
}: {
  label: string;
  labelNp: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  validateNepali?: boolean;
}) {
  const hasError = validateNepali && containsEnglishChars(value);

  return (
    <div className="form-field">
      <label className="form-field__label">
        {labelNp} / {label}
      </label>
      <input
        type="text"
        className="form-field__input"
        style={hasError ? { borderColor: '#ef4444' } : {}}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
      {hasError && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          ⚠️ English characters detected in Nepali field!
        </div>
      )}
    </div>
  );
}

export default function FamilyDetailsTab() {
  const { draft, additional, updateDraftField, updateAdditionalField, nextStep, prevStep } =
    useEnrollmentStore();

  if (!draft) return null;

  const handleNameChange = (field: keyof ExtractionResult) => (val: NameField) => {
    updateDraftField(field, val as ExtractionResult[typeof field]);
  };

  const handleAdditionalNameChange = (field: keyof AdditionalFields) => (val: NameField) => {
    updateAdditionalField(field, val as AdditionalFields[typeof field]);
  };

  const handleDetailsChange = (field: keyof AdditionalFields, subfield: keyof FamilyMemberDetails, val: string) => {
    const details = additional[field] as FamilyMemberDetails;
    updateAdditionalField(field, { ...details, [subfield]: val });
  };

  const canProceed = draft.fatherFirstName.english.trim() !== "";

  return (
    <div className="form-tab-panel fade-in">
      
      {/* Family Details (AI-Extracted) */}
      <div className="form-section">
        <h3 className="form-section__title">
          👨‍👩‍👧 पारिवारिक विवरण / Family Details
        </h3>

        {/* Father */}
        <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontWeight: 600, opacity: 0.8 }}>
          बाबुको विवरण / Father's Details
        </h4>
        <div className="form-grid">
          <NameInput
            label="Father First Name"
            labelNp="बाबुको पहिलो नाम"
            value={draft.fatherFirstName}
            onChange={handleNameChange("fatherFirstName")}
          />
          <NameInput
            label="Father Middle Name"
            labelNp="बाबुको बीचको नाम"
            value={draft.fatherMiddleName}
            onChange={handleNameChange("fatherMiddleName")}
          />
          <NameInput
            label="Father Last Name"
            labelNp="बाबुको थर"
            value={draft.fatherLastName}
            onChange={handleNameChange("fatherLastName")}
          />
        </div>
        <div className="form-grid form-grid--3col">
          <TextInput
            label="National ID No. (NIN)"
            labelNp="राष्ट्रिय परिचयपत्र नं."
            value={additional.fatherDetails.nin}
            onChange={(val) => handleDetailsChange("fatherDetails", "nin", val)}
          />
        </div>

        {/* Mother */}
        <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontWeight: 600, opacity: 0.8 }}>
          आमाको विवरण / Mother's Details
        </h4>
        <div className="form-grid">
          <NameInput
            label="Mother First Name"
            labelNp="आमाको पहिलो नाम"
            value={draft.motherFirstName}
            onChange={handleNameChange("motherFirstName")}
          />
          <NameInput
            label="Mother Middle Name"
            labelNp="आमाको बीचको नाम"
            value={draft.motherMiddleName}
            onChange={handleNameChange("motherMiddleName")}
          />
          <NameInput
            label="Mother Last Name"
            labelNp="आमाको थर"
            value={draft.motherLastName}
            onChange={handleNameChange("motherLastName")}
          />
        </div>
        <div className="form-grid form-grid--3col">
          <TextInput
            label="National ID No. (NIN)"
            labelNp="राष्ट्रिय परिचयपत्र नं."
            value={additional.motherDetails.nin}
            onChange={(val) => handleDetailsChange("motherDetails", "nin", val)}
          />
        </div>

        {/* Grandfather */}
        <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontWeight: 600, opacity: 0.8 }}>
          बाजेको विवरण / Grandfather's Details
        </h4>
        <div className="form-grid">
          <NameInput
            label="Grandfather First Name"
            labelNp="बाजेको पहिलो नाम"
            value={draft.grandfatherFirstName}
            onChange={handleNameChange("grandfatherFirstName")}
          />
          <NameInput
            label="Grandfather Middle Name"
            labelNp="बाजेको बीचको नाम"
            value={draft.grandfatherMiddleName}
            onChange={handleNameChange("grandfatherMiddleName")}
          />
          <NameInput
            label="Grandfather Last Name"
            labelNp="बाजेको थर"
            value={draft.grandfatherLastName}
            onChange={handleNameChange("grandfatherLastName")}
          />
        </div>
        <div className="form-grid form-grid--3col">
          <TextInput
            label="National ID No. (NIN)"
            labelNp="राष्ट्रिय परिचयपत्र नं."
            value={additional.grandfatherDetails.nin}
            onChange={(val) => handleDetailsChange("grandfatherDetails", "nin", val)}
          />
        </div>
      </div>

      {/* Family Details (User-Entered — not on citizenship) */}
      <div className="form-section">
        <h3 className="form-section__title">
          👵 थप पारिवारिक विवरण / Additional Family Details
        </h3>
        <p className="form-section__hint" style={{ color: "var(--crimson)", fontWeight: 500 }}>
          ⚠️ यी क्षेत्रहरू नागरिकतामा छैनन्। (These fields are NOT on your citizenship.)
        </p>

        {/* Grandmother */}
        <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontWeight: 600, opacity: 0.8 }}>
          बज्यैको विवरण / Grandmother's Details
        </h4>
        <div className="form-grid">
          <NameInput
            label="Grandmother First Name"
            labelNp="बज्यैको पहिलो नाम"
            value={additional.grandmotherFirstName}
            onChange={handleAdditionalNameChange("grandmotherFirstName")}
          />
          <NameInput
            label="Grandmother Middle Name"
            labelNp="बज्यैको बीचको नाम"
            value={additional.grandmotherMiddleName}
            onChange={handleAdditionalNameChange("grandmotherMiddleName")}
          />
          <NameInput
            label="Grandmother Last Name"
            labelNp="बज्यैको थर"
            value={additional.grandmotherLastName}
            onChange={handleAdditionalNameChange("grandmotherLastName")}
          />
        </div>
        <div className="form-grid form-grid--3col">
          <TextInput
            label="National ID No. (NIN)"
            labelNp="राष्ट्रिय परिचयपत्र नं."
            value={additional.grandmotherDetails.nin}
            onChange={(val) => handleDetailsChange("grandmotherDetails", "nin", val)}
          />
        </div>

        {/* Spouse fields — only show if married */}
        {additional.maritalStatus === "1" && (
          <>
            <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontWeight: 600, opacity: 0.8 }}>
              💑 पति/पत्नीको विवरण / Spouse Details
            </h4>
            <div className="form-grid">
              <NameInput
                label="Spouse First Name"
                labelNp="पति/पत्नीको पहिलो नाम"
                value={additional.spouseFirstName}
                onChange={handleAdditionalNameChange("spouseFirstName")}
              />
              <NameInput
                label="Spouse Middle Name"
                labelNp="पति/पत्नीको बीचको नाम"
                value={additional.spouseMiddleName}
                onChange={handleAdditionalNameChange("spouseMiddleName")}
              />
              <NameInput
                label="Spouse Last Name"
                labelNp="पति/पत्नीको थर"
                value={additional.spouseLastName}
                onChange={handleAdditionalNameChange("spouseLastName")}
              />
            </div>
            <div className="form-grid form-grid--3col">
              <TextInput
                label="National ID No. (NIN)"
                labelNp="राष्ट्रिय परिचयपत्र नं."
                value={additional.spouseDetails.nin}
                onChange={(val) => handleDetailsChange("spouseDetails", "nin", val)}
              />
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <button className="btn btn--secondary" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn btn--primary"
          onClick={nextStep}
          disabled={!canProceed}
        >
          Next: Export →
        </button>
      </div>

      {!canProceed && (
        <p className="form-nav__hint">
          Please fill in Father's First Name (English) to continue.
        </p>
      )}
    </div>
  );
}
