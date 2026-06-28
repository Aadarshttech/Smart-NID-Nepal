import type { ExtractionResult, NameField } from "../types/extraction";
import { MANDATORY_FIELDS } from "../types/extraction";

interface JsonViewerProps {
  data: ExtractionResult;
}

/** Determine field status for color coding */
function getFieldStatus(
  key: string,
  value: unknown,
  confidence: number
): "good" | "warning" | "error" {
  const isMandatory = MANDATORY_FIELDS.includes(key as keyof ExtractionResult);

  // Check if value is effectively empty
  const isEmpty =
    value === "" ||
    value === null ||
    value === undefined ||
    (typeof value === "object" &&
      value !== null &&
      "english" in value &&
      (value as NameField).english === "" &&
      (value as NameField).nepali === "");

  if (isEmpty && isMandatory) return "error";
  if (isEmpty) return "warning";
  if (confidence < 0.5) return "warning";
  return "good";
}

function StatusDot({ status }: { status: "good" | "warning" | "error" }) {
  const colors = {
    good: "status-dot--good",
    warning: "status-dot--warning",
    error: "status-dot--error",
  };
  return <span className={`status-dot ${colors[status]}`} />;
}

/** Render a NameField (nepali + english) */
function NameFieldDisplay({
  label,
  labelNp,
  value,
  status,
}: {
  label: string;
  labelNp: string;
  value: NameField;
  status: "good" | "warning" | "error";
}) {
  return (
    <div className="json-field">
      <div className="json-field__header">
        <StatusDot status={status} />
        <span className="json-field__label">
          {labelNp} / {label}
        </span>
      </div>
      <div className="json-field__values">
        {value.nepali && (
          <span className="json-field__value json-field__value--np">
            {value.nepali}
          </span>
        )}
        {value.english && (
          <span className="json-field__value json-field__value--en">
            {value.english}
          </span>
        )}
        {!value.nepali && !value.english && (
          <span className="json-field__value json-field__value--empty">
            Not detected
          </span>
        )}
      </div>
    </div>
  );
}

/** Render a simple string field */
function StringFieldDisplay({
  label,
  labelNp,
  value,
  status,
}: {
  label: string;
  labelNp: string;
  value: string;
  status: "good" | "warning" | "error";
}) {
  return (
    <div className="json-field">
      <div className="json-field__header">
        <StatusDot status={status} />
        <span className="json-field__label">
          {labelNp} / {label}
        </span>
      </div>
      <div className="json-field__values">
        {value ? (
          <span className="json-field__value">{value}</span>
        ) : (
          <span className="json-field__value json-field__value--empty">
            Not detected
          </span>
        )}
      </div>
    </div>
  );
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const c = data.confidence;

  return (
    <div className="json-viewer">
      {/* Confidence banner */}
      <div
        className={`confidence-banner ${
          c >= 0.7
            ? "confidence-banner--high"
            : c >= 0.4
              ? "confidence-banner--medium"
              : "confidence-banner--low"
        }`}
      >
        <div className="confidence-banner__icon">
          {c >= 0.7 ? "✅" : c >= 0.4 ? "⚠️" : "❌"}
        </div>
        <div className="confidence-banner__text">
          <strong>
            Extraction Confidence: {(c * 100).toFixed(0)}%
          </strong>
          <p>
            {c >= 0.7
              ? "Document was read clearly. Please verify the extracted data."
              : c >= 0.4
                ? "Some fields may be inaccurate. Please check carefully."
                : "Poor image quality. Many fields could not be read. Consider re-uploading a clearer photo."}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="json-section">
        <h3 className="json-section__title">
          👤 व्यक्तिगत विवरण / Personal Information
        </h3>
        <div className="json-section__grid">
          <NameFieldDisplay
            label="First Name"
            labelNp="पहिलो नाम"
            value={data.firstName}
            status={getFieldStatus("firstName", data.firstName, c)}
          />
          <NameFieldDisplay
            label="Middle Name"
            labelNp="बीचको नाम"
            value={data.middleName}
            status={getFieldStatus("middleName", data.middleName, c)}
          />
          <NameFieldDisplay
            label="Last Name"
            labelNp="थर"
            value={data.lastName}
            status={getFieldStatus("lastName", data.lastName, c)}
          />
          <StringFieldDisplay
            label="Gender"
            labelNp="लिङ्ग"
            value={data.gender}
            status={getFieldStatus("gender", data.gender, c)}
          />
          <StringFieldDisplay
            label="Date of Birth (BS)"
            labelNp="जन्म मिति"
            value={data.dobBS}
            status={getFieldStatus("dobBS", data.dobBS, c)}
          />
          <StringFieldDisplay
            label="Date of Birth (AD)"
            labelNp="जन्म मिति (ईस्वी)"
            value={data.dobAD}
            status={getFieldStatus("dobAD", data.dobAD, c)}
          />
          <StringFieldDisplay
            label="Birth Place"
            labelNp="जन्म स्थान"
            value={data.birthPlace}
            status={getFieldStatus("birthPlace", data.birthPlace, c)}
          />
        </div>
      </div>

      {/* Document Details */}
      <div className="json-section">
        <h3 className="json-section__title">
          📄 नागरिकता विवरण / Document Details
        </h3>
        <div className="json-section__grid">
          <StringFieldDisplay
            label="Citizenship No."
            labelNp="नागरिकता नं."
            value={data.citizenshipNo}
            status={getFieldStatus("citizenshipNo", data.citizenshipNo, c)}
          />
          <StringFieldDisplay
            label="Issuing District"
            labelNp="जारी जिल्ला"
            value={data.issuingDistrict}
            status={getFieldStatus("issuingDistrict", data.issuingDistrict, c)}
          />
          <StringFieldDisplay
            label="Issue Date (BS)"
            labelNp="जारी मिति"
            value={data.issueDateBS}
            status={getFieldStatus("issueDateBS", data.issueDateBS, c)}
          />
          <StringFieldDisplay
            label="Issuing Authority"
            labelNp="जारी गर्ने अधिकारी"
            value={data.issuingAuthority}
            status={getFieldStatus("issuingAuthority", data.issuingAuthority, c)}
          />
        </div>
      </div>

      {/* Family Details */}
      <div className="json-section">
        <h3 className="json-section__title">
          👨‍👩‍👧 पारिवारिक विवरण / Family Details
        </h3>
        <div className="json-section__grid">
          <NameFieldDisplay
            label="Father's Name"
            labelNp="बाबुको नाम"
            value={data.fatherName}
            status={getFieldStatus("fatherName", data.fatherName, c)}
          />
          <NameFieldDisplay
            label="Mother's Name"
            labelNp="आमाको नाम"
            value={data.motherName}
            status={getFieldStatus("motherName", data.motherName, c)}
          />
          <NameFieldDisplay
            label="Grandfather's Name"
            labelNp="बाजेको नाम"
            value={data.grandfatherName}
            status={getFieldStatus("grandfatherName", data.grandfatherName, c)}
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="json-section">
        <h3 className="json-section__title">
          📍 स्थायी ठेगाना / Permanent Address
        </h3>
        <div className="json-section__grid">
          <StringFieldDisplay
            label="District"
            labelNp="जिल्ला"
            value={data.permanentAddress.district}
            status={getFieldStatus(
              "permanentAddress",
              data.permanentAddress.district,
              c
            )}
          />
          <StringFieldDisplay
            label="Local Level"
            labelNp="स्थानीय तह"
            value={data.permanentAddress.localLevel}
            status={getFieldStatus(
              "permanentAddress",
              data.permanentAddress.localLevel,
              c
            )}
          />
          <StringFieldDisplay
            label="Ward No."
            labelNp="वडा नं."
            value={data.permanentAddress.wardNo}
            status={getFieldStatus(
              "permanentAddress",
              data.permanentAddress.wardNo,
              c
            )}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="json-legend">
        <span className="json-legend__item">
          <StatusDot status="good" /> Field detected
        </span>
        <span className="json-legend__item">
          <StatusDot status="warning" /> Low confidence / Optional
        </span>
        <span className="json-legend__item">
          <StatusDot status="error" /> Missing mandatory field
        </span>
      </div>
    </div>
  );
}
