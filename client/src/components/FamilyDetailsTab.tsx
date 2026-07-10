import { useState } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import type { NameField, ExtractionResult, AdditionalFields, FamilyMemberDetails, AddressField } from "../types/extraction";
import { PROVINCE_OPTIONS } from "../types/extraction";
import { getDistrictsForProvince, getLocalLevelsForDistrict } from "../utils/locationHelper";
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
            value={value?.nepali || ""}
            onChange={(e) => onChange({ nepali: e.target.value, english: value?.english || "" })}
            placeholder={labelNp}
          />
          {containsEnglishChars(value?.nepali || "") && (
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
            value={value?.english || ""}
            onChange={(e) => onChange({ nepali: value?.nepali || "", english: e.target.value })}
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
        value={value || ""}
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

function AddressForm({
  title,
  titleNp,
  address,
  sameAsApplicant,
  onSameAsApplicantChange,
  onAddressChange,
}: {
  title: string;
  titleNp: string;
  address: AddressField;
  sameAsApplicant: boolean;
  onSameAsApplicantChange: (val: boolean) => void;
  onAddressChange: (subField: keyof AddressField, val: string) => void;
}) {
  const districtOptions = address?.province ? getDistrictsForProvince(address.province) : [];
  const localLevelOptions = (address?.province && address?.district)
    ? getLocalLevelsForDistrict(address.province, address.district)
    : [];

  return (
    <div style={{ marginTop: "1rem", marginBottom: "2rem", padding: "1rem", border: "1px dashed #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
      <h5 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#475569" }}>{titleNp} / {title}</h5>
      
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#334155", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={sameAsApplicant}
            onChange={(e) => onSameAsApplicantChange(e.target.checked)}
          />
          Copy Applicant's Permanent Address to {title}
        </label>
      </div>

      {!sameAsApplicant && (
        <div className="form-grid form-grid--3col fade-in" style={{ alignItems: "flex-end" }}>
          <SelectInput
            label="Province"
            labelNp="प्रदेश"
            value={address?.province || ""}
            onChange={(val) => onAddressChange("province", val)}
            options={PROVINCE_OPTIONS}
          />
          <SelectInput
            label="District"
            labelNp="जिल्ला"
            value={address?.district || ""}
            onChange={(val) => onAddressChange("district", val)}
            options={[{ val: "", text: "-- Select District --" }, ...districtOptions]}
            disabled={!address?.province}
          />
          <SelectInput
            label="Rural Municipality"
            labelNp="गा.पा./न.पा."
            value={address?.localLevel || ""}
            onChange={(val) => onAddressChange("localLevel", val)}
            options={[{ val: "", text: "-- Select --" }, ...localLevelOptions]}
            disabled={!address?.district}
          />
          <TextInput
            label="Ward No"
            labelNp="वडा नं."
            value={address?.wardNo || ""}
            onChange={(val) => onAddressChange("wardNo", val)}
            validateNepali
          />
        </div>
      )}
    </div>
  );
}

function ExpandableOtherDetails({
  details,
  onChange,
}: {
  details: FamilyMemberDetails;
  onChange: (subfield: keyof FamilyMemberDetails, val: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          background: expanded ? "var(--nepal-blue)" : "#f8fafc",
          border: "none",
          color: expanded ? "#fff" : "#334155",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: "pointer",
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.3s ease"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
             <polyline points="14 2 14 8 20 8"></polyline>
             <line x1="16" y1="13" x2="8" y2="13"></line>
             <line x1="16" y1="17" x2="8" y2="17"></line>
             <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          {expanded ? "Additional Information" : "Add Additional Information (Citizenship, NIN, Nationality)"}
        </span>
        <svg 
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {expanded && (
        <div className="form-grid form-grid--3col fade-in" style={{ padding: "1.5rem", backgroundColor: "#fff", alignItems: "flex-end" }}>
          <TextInput
            label="Citizenship No."
            labelNp="नागरिकता प्र. नं."
            value={details?.ccNumber || ""}
            onChange={(val) => onChange("ccNumber", val)}
          />
          <TextInput
            label="NIN"
            labelNp="राष्ट्रिय परिचयपत्र नं."
            value={details?.nin || ""}
            onChange={(val) => onChange("nin", val)}
          />
          <TextInput
            label="Nationality"
            labelNp="राष्ट्रियता"
            value={details?.nationality || "NEPALESE"}
            onChange={(val) => onChange("nationality", val)}
          />
        </div>
      )}
    </div>
  );
}

export default function FamilyDetailsTab() {
  const [showErrors, setShowErrors] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const { draft, additional, updateDraftField, updateAdditionalField, nextStep, prevStep } = useEnrollmentStore();

  if (!draft) return null;

  const handleNameChange = (field: keyof ExtractionResult) => (val: NameField) => {
    updateDraftField(field, val as ExtractionResult[typeof field]);
  };

  const handleAdditionalNameChange = (field: keyof AdditionalFields) => (val: NameField) => {
    updateAdditionalField(field, val as AdditionalFields[typeof field]);
  };

  const handleDetailsChange = (field: keyof AdditionalFields, subfield: keyof FamilyMemberDetails, val: string | boolean) => {
    const defaultAddress = { province: "", district: "", localLevel: "", wardNo: "", villageToleNp: "", villageToleEn: "" };
    const details = (additional[field] || { nin: "", nationality: "", addressSameAsApplicant: false, address: defaultAddress }) as FamilyMemberDetails;
    updateAdditionalField(field, { ...details, [subfield]: val });
  };

  const handleAddressChange = (field: keyof AdditionalFields, subfield: keyof AddressField, val: string) => {
    const defaultAddress = { province: "", district: "", localLevel: "", wardNo: "", villageToleNp: "", villageToleEn: "" };
    const details = (additional[field] || { nin: "", nationality: "", addressSameAsApplicant: false, address: defaultAddress }) as FamilyMemberDetails;
    const currentAddress = details.address || defaultAddress;
    
    const updatedAddress = { ...currentAddress, [subfield]: val };
    
    // Clear district and local level if province changes
    if (subfield === "province") {
      updatedAddress.district = "";
      updatedAddress.localLevel = "";
    }
    // Clear local level if district changes
    if (subfield === "district") {
      updatedAddress.localLevel = "";
    }
    
    updateAdditionalField(field, { ...details, address: updatedAddress });
  };

  const canProceed = 
    (draft.fatherFirstName?.nepali || "").trim() !== "" &&
    (draft.fatherFirstName?.english || "").trim() !== "" &&
    (draft.fatherLastName?.nepali || "").trim() !== "" &&
    (draft.fatherLastName?.english || "").trim() !== "" &&
    (draft.motherFirstName?.nepali || "").trim() !== "" &&
    (draft.motherFirstName?.english || "").trim() !== "" &&
    (draft.motherLastName?.nepali || "").trim() !== "" &&
    (draft.motherLastName?.english || "").trim() !== "";

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
      
      {/* Family Details (AI-Extracted) */}
      <div className="form-section">
        <h3 className="form-section__title">
          पारिवारिक विवरण / Family Details
        </h3>

        {/* Father */}
        <h4 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--nepal-blue)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
          बाबुको विवरण / Father's Details
        </h4>
        <div className="form-grid">
          <NameInput
            label="Father First Name*"
            labelNp="बाबुको पहिलो नाम*"
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
            label="Father Last Name*"
            labelNp="बाबुको थर*"
            value={draft.fatherLastName}
            onChange={handleNameChange("fatherLastName")}
          />
        </div>
        <ExpandableOtherDetails
          details={additional.fatherDetails || {}}
          onChange={(subField, val) => handleDetailsChange("fatherDetails", subField, val)}
        />
        <AddressForm
          title="Father's Permanent Address"
          titleNp="बाबुको स्थायी ठेगाना"
          address={additional.fatherDetails?.address || {} as any}
          sameAsApplicant={additional.fatherDetails?.addressSameAsApplicant ?? false}
          onSameAsApplicantChange={(val) => handleDetailsChange("fatherDetails", "addressSameAsApplicant", val)}
          onAddressChange={(subField, val) => handleAddressChange("fatherDetails", subField, val)}
        />

        {/* Mother */}
        <h4 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--nepal-blue)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
          आमाको विवरण / Mother's Details
        </h4>
        <div className="form-grid">
          <NameInput
            label="Mother First Name*"
            labelNp="आमाको पहिलो नाम*"
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
            label="Mother Last Name*"
            labelNp="आमाको थर*"
            value={draft.motherLastName}
            onChange={handleNameChange("motherLastName")}
          />
        </div>
        <ExpandableOtherDetails
          details={additional.motherDetails || {}}
          onChange={(subField, val) => handleDetailsChange("motherDetails", subField, val)}
        />
        <AddressForm
          title="Mother's Permanent Address"
          titleNp="आमाको स्थायी ठेगाना"
          address={additional.motherDetails?.address || {} as any}
          sameAsApplicant={additional.motherDetails?.addressSameAsApplicant ?? false}
          onSameAsApplicantChange={(val) => handleDetailsChange("motherDetails", "addressSameAsApplicant", val)}
          onAddressChange={(subField, val) => handleAddressChange("motherDetails", subField, val)}
        />
      </div>

        {/* Grandfather */}
      <div className="form-section">
        <h3 className="form-section__title">
          थप पारिवारिक विवरण / Additional Family Details
        </h3>
        <p className="form-section__hint" style={{ color: "var(--crimson)", fontWeight: 500 }}>
          यी क्षेत्रहरू नागरिकतामा छैनन् — कृपया आफैं भर्नुहोस्। (These fields are NOT on your citizenship.)
        </p>

        <h4 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--nepal-blue)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
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
        <ExpandableOtherDetails
          details={additional.grandfatherDetails || {}}
          onChange={(subField, val) => handleDetailsChange("grandfatherDetails", subField, val)}
        />

        {/* Grandmother */}
        <h4 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--nepal-blue)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
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
        <ExpandableOtherDetails
          details={additional.grandmotherDetails || {}}
          onChange={(subField, val) => handleDetailsChange("grandmotherDetails", subField, val)}
        />
        {/* Spouse fields */}
        {additional.maritalStatus === "1" && (
          <>
            <h4 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--nepal-blue)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
              पति/पत्नीको विवरण / Spouse's Details
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
            <ExpandableOtherDetails
              details={additional.spouseDetails || {}}
              onChange={(subField, val) => handleDetailsChange("spouseDetails", subField, val)}
            />
            <AddressForm
              title="Spouse's Permanent Address"
              titleNp="पति/पत्नीको स्थायी ठेगाना"
              address={additional.spouseDetails?.address || {} as any}
              sameAsApplicant={additional.spouseDetails?.addressSameAsApplicant ?? false}
              onSameAsApplicantChange={(val) => handleDetailsChange("spouseDetails", "addressSameAsApplicant", val)}
              onAddressChange={(subField, val) => handleAddressChange("spouseDetails", subField, val)}
            />
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
          Next: Export →
        </button>
      </div>

      {showErrors && !canProceed && (
        <div className="form-error-banner bounce-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Please fill in the First and Last Names for both Father and Mother (Nepali & English) (*) to continue.</span>
        </div>
      )}
    </div>
  );
}
