/**
 * DocumentFamilyTab — Editable form for document details,
 * family information, and permanent address.
 */

import { useEnrollmentStore } from "../store/enrollmentStore";
import type { NameField, AddressField, ExtractionResult } from "../types/extraction";

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

export default function DocumentFamilyTab() {
  const { draft, updateDraftField, nextStep, prevStep } = useEnrollmentStore();

  if (!draft) return null;

  const handleNameChange = (field: keyof ExtractionResult) => (val: NameField) => {
    updateDraftField(field, val as ExtractionResult[typeof field]);
  };

  const handleAddressChange = (subField: keyof AddressField, val: string) => {
    updateDraftField("permanentAddress", {
      ...draft.permanentAddress,
      [subField]: val,
    });
  };

  const canProceed =
    draft.citizenshipNo.trim() !== "" &&
    draft.issuingDistrict.trim() !== "" &&
    draft.fatherName.english.trim() !== "";

  return (
    <div className="form-tab-panel fade-in">
      {/* Document Details */}
      <div className="form-section">
        <h3 className="form-section__title">
          📄 नागरिकता विवरण / Document Details
        </h3>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Citizenship No."
            labelNp="नागरिकता नं."
            value={draft.citizenshipNo}
            onChange={(val) => updateDraftField("citizenshipNo", val)}
          />
          <TextInput
            label="Issuing District"
            labelNp="जारी जिल्ला"
            value={draft.issuingDistrict}
            onChange={(val) => updateDraftField("issuingDistrict", val)}
          />
          <TextInput
            label="Issue Date (BS)"
            labelNp="जारी मिति"
            value={draft.issueDateBS}
            onChange={(val) => updateDraftField("issueDateBS", val)}
            placeholder="YYYY-MM-DD"
          />
        </div>

        <div className="form-grid form-grid--1col">
          <TextInput
            label="Issuing Authority"
            labelNp="जारी गर्ने अधिकारी"
            value={draft.issuingAuthority}
            onChange={(val) => updateDraftField("issuingAuthority", val)}
          />
        </div>
      </div>

      {/* Family Details */}
      <div className="form-section">
        <h3 className="form-section__title">
          👨‍👩‍👧 पारिवारिक विवरण / Family Details
        </h3>

        <div className="form-grid">
          <NameInput
            label="Father's Name"
            labelNp="बाबुको नाम"
            value={draft.fatherName}
            onChange={handleNameChange("fatherName")}
          />
          <NameInput
            label="Mother's Name"
            labelNp="आमाको नाम"
            value={draft.motherName}
            onChange={handleNameChange("motherName")}
          />
          <NameInput
            label="Grandfather's Name"
            labelNp="बाजेको नाम"
            value={draft.grandfatherName}
            onChange={handleNameChange("grandfatherName")}
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="form-section">
        <h3 className="form-section__title">
          📍 स्थायी ठेगाना / Permanent Address
        </h3>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="District"
            labelNp="जिल्ला"
            value={draft.permanentAddress.district}
            onChange={(val) => handleAddressChange("district", val)}
          />
          <TextInput
            label="Local Level"
            labelNp="स्थानीय तह"
            value={draft.permanentAddress.localLevel}
            onChange={(val) => handleAddressChange("localLevel", val)}
          />
          <TextInput
            label="Ward No."
            labelNp="वडा नं."
            value={draft.permanentAddress.wardNo}
            onChange={(val) => handleAddressChange("wardNo", val)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <button className="btn btn--outline" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn btn--primary"
          onClick={nextStep}
          disabled={!canProceed}
        >
          Next: Appointment →
        </button>
      </div>

      {!canProceed && (
        <p className="form-nav__hint">
          Please fill in Citizenship No., Issuing District, and Father's Name to continue.
        </p>
      )}
    </div>
  );
}
