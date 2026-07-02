/**
 * DocumentFamilyTab — Editable form for document details,
 * family information (including grandmother & spouse),
 * permanent address with village/tole, and temporary address.
 */

import { useEnrollmentStore } from "../store/enrollmentStore";
import type { NameField, AddressField, ExtractionResult, AdditionalFields } from "../types/extraction";

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
  const { draft, additional, updateDraftField, updateAdditionalField, nextStep, prevStep } =
    useEnrollmentStore();

  if (!draft) return null;

  const handleNameChange = (field: keyof ExtractionResult) => (val: NameField) => {
    updateDraftField(field, val as ExtractionResult[typeof field]);
  };

  const handleAdditionalNameChange = (field: keyof AdditionalFields) => (val: NameField) => {
    updateAdditionalField(field, val as AdditionalFields[typeof field]);
  };

  const handleAddressChange = (subField: keyof AddressField, val: string) => {
    updateDraftField("permanentAddress", {
      ...draft.permanentAddress,
      [subField]: val,
    });
  };

  const handleTempAddressChange = (subField: keyof AddressField, val: string) => {
    updateAdditionalField("temporaryAddress", {
      ...additional.temporaryAddress,
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

      {/* Family Details (AI-Extracted) */}
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

      {/* Family Details (User-Entered — not on citizenship) */}
      <div className="form-section">
        <h3 className="form-section__title">
          👵 थप पारिवारिक विवरण / Additional Family Details
        </h3>
        <p className="form-section__hint" style={{ color: "var(--crimson)", fontWeight: 500 }}>
          ⚠️ यी क्षेत्रहरू नागरिकतामा छैनन्। (These fields are NOT on your citizenship.)
        </p>

        <div className="form-grid">
          <NameInput
            label="Grandmother's Name"
            labelNp="बज्यैको नाम"
            value={additional.grandmotherName}
            onChange={handleAdditionalNameChange("grandmotherName")}
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
          </>
        )}
      </div>

      {/* Permanent Address */}
      <div className="form-section">
        <h3 className="form-section__title">
          📍 स्थायी ठेगाना / Permanent Address
        </h3>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Province"
            labelNp="प्रदेश"
            value={draft.permanentAddress.province}
            onChange={(val) => handleAddressChange("province", val)}
          />
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
        </div>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Ward No."
            labelNp="वडा नं."
            value={draft.permanentAddress.wardNo}
            onChange={(val) => handleAddressChange("wardNo", val)}
          />
          <TextInput
            label="Village/Tole (Nepali)"
            labelNp="गाउँ/टोल (नेपाली)"
            value={draft.permanentAddress.villageToleNp}
            onChange={(val) => handleAddressChange("villageToleNp", val)}
          />
          <TextInput
            label="Village/Tole (English)"
            labelNp="गाउँ/टोल (अंग्रेजी)"
            value={draft.permanentAddress.villageToleEn}
            onChange={(val) => handleAddressChange("villageToleEn", val)}
          />
        </div>
      </div>

      {/* Temporary Address */}
      <div className="form-section">
        <h3 className="form-section__title">
          📍 अस्थायी ठेगाना / Temporary Address
        </h3>

        <div className="form-field" style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={additional.temporaryAddressSameAsPermanent}
              onChange={(e) => updateAdditionalField("temporaryAddressSameAsPermanent", e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--crimson)" }}
            />
            <span>स्थायी ठेगाना जस्तै / Same as Permanent Address</span>
          </label>
        </div>

        {!additional.temporaryAddressSameAsPermanent && (
          <>
            <div className="form-grid form-grid--3col">
              <TextInput
                label="Province"
                labelNp="प्रदेश"
                value={additional.temporaryAddress.province}
                onChange={(val) => handleTempAddressChange("province", val)}
              />
              <TextInput
                label="District"
                labelNp="जिल्ला"
                value={additional.temporaryAddress.district}
                onChange={(val) => handleTempAddressChange("district", val)}
              />
              <TextInput
                label="Local Level"
                labelNp="स्थानीय तह"
                value={additional.temporaryAddress.localLevel}
                onChange={(val) => handleTempAddressChange("localLevel", val)}
              />
            </div>
            <div className="form-grid form-grid--3col">
              <TextInput
                label="Ward No."
                labelNp="वडा नं."
                value={additional.temporaryAddress.wardNo}
                onChange={(val) => handleTempAddressChange("wardNo", val)}
              />
              <TextInput
                label="Village/Tole (Nepali)"
                labelNp="गाउँ/टोल (नेपाली)"
                value={additional.temporaryAddress.villageToleNp}
                onChange={(val) => handleTempAddressChange("villageToleNp", val)}
              />
              <TextInput
                label="Village/Tole (English)"
                labelNp="गाउँ/टोल (अंग्रेजी)"
                value={additional.temporaryAddress.villageToleEn}
                onChange={(val) => handleTempAddressChange("villageToleEn", val)}
              />
            </div>
          </>
        )}
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
          Next: Export →
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
