/**
 * ContactDetailsTab — Editable form for contact details,
 * phone/mobile, permanent address, and temporary address.
 */

import { useState } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import type { AddressField } from "../types/extraction";
import { PROVINCE_OPTIONS } from "../types/extraction";
import { getDistrictsForProvince, getLocalLevelsForDistrict } from "../utils/locationHelper";
import { containsEnglishChars } from "../utils/validation";

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
  options: { text: string; val: string }[];
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

export default function ContactDetailsTab() {
  const [showErrors, setShowErrors] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { draft, additional, updateDraftField, updateAdditionalField, nextStep, prevStep } =
    useEnrollmentStore();

  if (!draft) return null;

  const handleAddressChange = (subField: keyof AddressField, val: string) => {
    const updatedAddress = {
      ...draft.permanentAddress,
      [subField]: val,
    };
    
    // Clear district and local level if province changes
    if (subField === "province") {
      updatedAddress.district = "";
      updatedAddress.localLevel = "";
    }
    // Clear local level if district changes
    if (subField === "district") {
      updatedAddress.localLevel = "";
    }
    
    updateDraftField("permanentAddress", updatedAddress);
  };

  const handleTempAddressChange = (subField: keyof AddressField, val: string) => {
    const updatedAddress = {
      ...additional.temporaryAddress,
      [subField]: val,
    };
    
    // Clear district and local level if province changes
    if (subField === "province") {
      updatedAddress.district = "";
      updatedAddress.localLevel = "";
    }
    // Clear local level if district changes
    if (subField === "district") {
      updatedAddress.localLevel = "";
    }
    
    updateAdditionalField("temporaryAddress", updatedAddress);
  };

  const permDistricts = draft.permanentAddress.province ? getDistrictsForProvince(draft.permanentAddress.province) : [];
  const permLocalLevels = draft.permanentAddress.district && draft.permanentAddress.province ? getLocalLevelsForDistrict(draft.permanentAddress.province, draft.permanentAddress.district) : [];

  const tempDistricts = additional.temporaryAddress.province ? getDistrictsForProvince(additional.temporaryAddress.province) : [];
  const tempLocalLevels = additional.temporaryAddress.district && additional.temporaryAddress.province ? getLocalLevelsForDistrict(additional.temporaryAddress.province, additional.temporaryAddress.district) : [];

  const canProceed =
    additional.mobileNo.trim() !== "" &&
    draft.permanentAddress.province.trim() !== "" &&
    draft.permanentAddress.district.trim() !== "" &&
    draft.permanentAddress.localLevel.trim() !== "" &&
    draft.permanentAddress.wardNo.trim() !== "" &&
    (additional.temporaryAddressSameAsPermanent || (
      additional.temporaryAddress.province.trim() !== "" &&
      additional.temporaryAddress.district.trim() !== "" &&
      additional.temporaryAddress.localLevel.trim() !== "" &&
      additional.temporaryAddress.wardNo.trim() !== ""
    ));

  const handleNextClick = () => {
    if (!canProceed) {
      setShowErrors(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    } else {
      nextStep();
    }
  };

  return (
    <div className="form-tab-panel fade-in">
      
      {/* ── Contact Details (Phone) ── */}
      <div className="form-section">
        <h3 className="form-section__title">
          📞 सम्पर्क नम्बर / Phone Details
        </h3>
        <div className="form-grid form-grid--2col">
          <TextInput
            label="Phone No."
            labelNp="फोन नं."
            value={additional.phoneNo}
            onChange={(val) => updateAdditionalField("phoneNo", val)}
          />
          <TextInput
            label="Mobile No.*"
            labelNp="मोबाईल नं.*"
            value={additional.mobileNo}
            onChange={(val) => updateAdditionalField("mobileNo", val)}
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="form-section">
        <h3 className="form-section__title">
          📍 स्थायी ठेगाना / Permanent Address
        </h3>

        <div className="form-grid form-grid--3col">
          <SelectInput
            label="Province*"
            labelNp="प्रदेश*"
            value={draft.permanentAddress.province}
            onChange={(val) => handleAddressChange("province", val)}
            options={PROVINCE_OPTIONS}
          />
          <SelectInput
            label="District*"
            labelNp="जिल्ला*"
            value={draft.permanentAddress.district}
            onChange={(val) => handleAddressChange("district", val)}
            options={[{val: "", text: "-- Select / छान्नुहोस् --"}, ...permDistricts]}
            disabled={!draft.permanentAddress.province}
          />
          <SelectInput
            label="Local Level*"
            labelNp="स्थानीय तह*"
            value={draft.permanentAddress.localLevel}
            onChange={(val) => handleAddressChange("localLevel", val)}
            options={[{val: "", text: "-- Select / छान्नुहोस् --"}, ...permLocalLevels]}
            disabled={!draft.permanentAddress.district}
          />
        </div>

        <div className="form-grid form-grid--3col">
          <TextInput
            label="Ward No.*"
            labelNp="वडा नं.*"
            value={draft.permanentAddress.wardNo}
            onChange={(val) => handleAddressChange("wardNo", val)}
          />
          <TextInput
            label="Village/Tole (Nepali)"
            labelNp="गाउँ/टोल (नेपाली)"
            value={draft.permanentAddress.villageToleNp}
            onChange={(val) => handleAddressChange("villageToleNp", val)}
            validateNepali={true}
          />
          <TextInput
            label="Village/Tole (English)"
            labelNp="गाउँ/टोल (English)"
            value={draft.permanentAddress.villageToleEn}
            onChange={(val) => handleAddressChange("villageToleEn", val)}
          />
        </div>
      </div>

      {/* Temporary Address */}
      <div className="form-section">
        <h3 className="form-section__title">
          🏠 अस्थायी ठेगाना / Temporary Address
        </h3>

        <div className="form-field" style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={additional.temporaryAddressSameAsPermanent}
              onChange={(e) => updateAdditionalField("temporaryAddressSameAsPermanent", e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--crimson)" }}
            />
            <span>स्थायी ठेगाना नै अस्थायी ठेगाना हो / Same as Permanent Address</span>
          </label>
        </div>

        {!additional.temporaryAddressSameAsPermanent && (
          <>
            <div className="form-grid form-grid--3col fade-in">
              <SelectInput
                label="Province"
                labelNp="प्रदेश"
                value={additional.temporaryAddress.province}
                onChange={(val) => handleTempAddressChange("province", val)}
                options={PROVINCE_OPTIONS}
              />
              <SelectInput
                label="District"
                labelNp="जिल्ला"
                value={additional.temporaryAddress.district}
                onChange={(val) => handleTempAddressChange("district", val)}
                options={[{val: "", text: "-- Select / छान्नुहोस् --"}, ...tempDistricts]}
                disabled={!additional.temporaryAddress.province}
              />
              <SelectInput
                label="Local Level"
                labelNp="स्थानीय तह"
                value={additional.temporaryAddress.localLevel}
                onChange={(val) => handleTempAddressChange("localLevel", val)}
                options={[{val: "", text: "-- Select / छान्नुहोस् --"}, ...tempLocalLevels]}
                disabled={!additional.temporaryAddress.district}
              />
            </div>
            <div className="form-grid form-grid--3col fade-in" style={{ marginTop: "1rem" }}>
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
                validateNepali={true}
              />
              <TextInput
                label="Village/Tole (English)"
                labelNp="गाउँ/टोल (English)"
                value={additional.temporaryAddress.villageToleEn}
                onChange={(val) => handleTempAddressChange("villageToleEn", val)}
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
          className={`btn btn--primary ${isShaking ? 'shake' : ''}`}
          onClick={handleNextClick}
        >
          Next: Family Details →
        </button>
      </div>

      {showErrors && !canProceed && (
        <div className="form-error-banner bounce-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Please fill in your Mobile No. and complete all Address fields (*) to continue.</span>
        </div>
      )}
    </div>
  );
}
