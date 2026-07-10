/**
 * PersonalDetailsTab — Editable form for personal information
 * Pre-filled from AI extraction, user can correct any field.
 * Also includes "Additional Information" section for fields
 * not present on the citizenship certificate but required by DoNIDCR.
 */

import { useState, useEffect } from "react";
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
import { containsEnglishChars } from "../utils/validation";

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

/** Select dropdown */
function SelectInput({
  label,
  labelNp,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  labelNp: string;
  value: string;
  onChange: (val: string) => void;
  options: { val: string; text: string }[];
  disabled?: boolean;
}) {
  return (
    <div className={`form-field ${disabled ? 'opacity-50' : ''}`}>
      <label className="form-field__label">
        {labelNp} / {label}
      </label>
      <select
        className="form-field__input form-field__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
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

export default function ApplicantDataTab() {
  const [showErrors, setShowErrors] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { draft, additional, updateDraftField, updateAdditionalField, nextStep } =
    useEnrollmentStore();

  if (!draft) return null;

  const handleNameChange = (field: keyof ExtractionResult) => (val: NameField) => {
    updateDraftField(field, val as ExtractionResult[typeof field]);
  };


  const canProceed =
    draft.firstName.nepali.trim() !== "" &&
    draft.firstName.english.trim() !== "" &&
    draft.lastName.nepali.trim() !== "" &&
    draft.lastName.english.trim() !== "" &&
    draft.dobBS.trim() !== "" &&
    draft.dobAD.trim() !== "" &&
    draft.gender !== "" &&
    draft.birthPlace.trim() !== "" &&
    draft.citizenshipNo.trim() !== "" &&
    draft.issuingDistrict.trim() !== "" &&
    draft.issueDateBS.trim() !== "" &&
    additional.ccType.trim() !== "" &&
    additional.maritalStatus.trim() !== "" &&
    additional.religion.trim() !== "" &&
    additional.educationLevel.trim() !== "" &&
    additional.profession.trim() !== "" &&
    additional.caste.trim() !== "";

  const handleNextClick = () => {
    if (!canProceed) {
      setShowErrors(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600); // Remove shake class after animation
    } else {
      nextStep();
    }
  };

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
            label="First Name*"
            labelNp="पहिलो नाम*"
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
            label="Last Name*"
            labelNp="थर*"
            value={draft.lastName}
            onChange={handleNameChange("lastName")}
          />
        </div>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Date of Birth (BS)*"
            labelNp="जन्म मिति*"
            value={draft.dobBS}
            onChange={(val) => updateDraftField("dobBS", val)}
            placeholder="YYYY-MM-DD"
          />
          <TextInput
            label="Date of Birth (AD)*"
            labelNp="जन्म मिति (ईस्वी)*"
            value={draft.dobAD}
            onChange={(val) => updateDraftField("dobAD", val)}
            placeholder="YYYY-MM-DD"
          />
          <div className="form-field">
            <label className="form-field__label">लिङ्ग* / Gender*</label>
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
            label="Birth Place*"
            labelNp="जन्म स्थान*"
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
            label="CC Type*"
            labelNp="नागरिकताको किसिम*"
            value={additional.ccType}
            onChange={(val) => updateAdditionalField("ccType", val)}
            options={CC_TYPE_OPTIONS}
          />
          <SelectInput
            label="Marital Status*"
            labelNp="वैवाहिक स्थिति*"
            value={additional.maritalStatus}
            onChange={(val) => updateAdditionalField("maritalStatus", val)}
            options={MARITAL_STATUS_OPTIONS}
          />
          <SelectInput
            label="Religion*"
            labelNp="धर्म*"
            value={additional.religion}
            onChange={(val) => updateAdditionalField("religion", val)}
            options={RELIGION_OPTIONS}
          />
        </div>

        {/* Naturalization Extra Fields */}
        {(additional.ccType === "2" || additional.ccType === "3") && (
          <div className="form-grid form-grid--2col fade-in" style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", marginTop: "1rem", marginBottom: "1rem" }}>
            <TextInput
              label="Previous Nationality"
              labelNp="साबिकको नागरिकता"
              value={additional.ccPrevNatCountry}
              onChange={(val) => updateAdditionalField("ccPrevNatCountry", val)}
            />
            <TextInput
              label="Citizenship Revocation Date"
              labelNp="नागरिकता परित्याग मिति"
              value={additional.ccPrevNatRevocationDate}
              onChange={(val) => updateAdditionalField("ccPrevNatRevocationDate", val)}
              placeholder="YYYY-MM-DD"
            />
          </div>
        )}

        <div className="form-grid form-grid--3col">
          <SelectInput
            label="Education*"
            labelNp="शैक्षिक योग्यता*"
            value={additional.educationLevel}
            onChange={(val) => updateAdditionalField("educationLevel", val)}
            options={EDUCATION_OPTIONS}
          />
          <SelectInput
            label="Profession*"
            labelNp="व्यवसाय*"
            value={additional.profession}
            onChange={(val) => updateAdditionalField("profession", val)}
            options={PROFESSION_OPTIONS}
          />
          <SelectInput
            label="Caste*"
            labelNp="जात जाति*"
            value={additional.caste}
            onChange={(val) => updateAdditionalField("caste", val)}
            options={CASTE_OPTIONS}
          />
        </div>

      </div>

      {/* ── Document Details ── */}
      <div className="form-section">
        <h3 className="form-section__title">
          📄 नागरिकता विवरण / Document Details
        </h3>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Citizenship No.*"
            labelNp="नागरिकता नं.*"
            value={draft.citizenshipNo}
            onChange={(val) => updateDraftField("citizenshipNo", val)}
          />
          <TextInput
            label="Issuing District*"
            labelNp="जारी जिल्ला*"
            value={draft.issuingDistrict}
            onChange={(val) => updateDraftField("issuingDistrict", val)}
          />
          <TextInput
            label="Issue Date (BS)*"
            labelNp="जारी मिति*"
            value={draft.issueDateBS}
            onChange={(val) => updateDraftField("issueDateBS", val)}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <div /> {/* Spacer — no back button on first tab */}
        <button
          className={`btn btn--primary ${isShaking ? 'shake' : ''}`}
          onClick={handleNextClick}
        >
          Next: Contact Details →
        </button>
      </div>

      {showErrors && !canProceed && (
        <div className="form-error-banner bounce-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Please fill in all required personal and additional details (*) to continue.</span>
        </div>
      )}
    </div>
  );
}
