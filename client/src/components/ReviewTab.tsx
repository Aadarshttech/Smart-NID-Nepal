/**
 * ReviewTab — Final read-only summary of all enrollment data
 * with the option to jump back and edit any section.
 * Includes the "Transfer to DoNIDCR" auto-fill feature.
 */

import { useState } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import { generateAutoFillScript } from "../utils/generateAutoFill";

export default function ReviewTab() {
  const { draft, additional, appointmentPreferences, setCurrentStep, prevStep } =
    useEnrollmentStore();

  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  if (!draft || !appointmentPreferences) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleTransfer = async () => {
    try {
      const script = generateAutoFillScript(draft, additional);
      await navigator.clipboard.writeText(script);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 4000);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 4000);
    }
  };

  return (
    <div className="form-tab-panel fade-in">
      {/* Personal Details Summary */}
      <div className="review-section">
        <div className="review-section__header">
          <h3 className="review-section__title">
            👤 व्यक्तिगत विवरण / Personal Details
          </h3>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => setCurrentStep(1)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <ReviewField
            label="Name"
            value={`${draft.firstName.english} ${draft.middleName.english} ${draft.lastName.english}`.trim()}
          />
          <ReviewField
            label="नाम"
            value={`${draft.firstName.nepali} ${draft.middleName.nepali} ${draft.lastName.nepali}`.trim()}
            isNepali
          />
          <ReviewField label="Date of Birth (BS)" value={draft.dobBS} />
          <ReviewField label="Date of Birth (AD)" value={draft.dobAD} />
          <ReviewField label="Gender" value={draft.gender} />
          <ReviewField label="Birth Place" value={draft.birthPlace} />
        </div>
      </div>

      {/* Document & Family Summary */}
      <div className="review-section">
        <div className="review-section__header">
          <h3 className="review-section__title">
            📄 नागरिकता र परिवार / Document & Family
          </h3>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => setCurrentStep(2)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <ReviewField label="Citizenship No." value={draft.citizenshipNo} />
          <ReviewField label="Issuing District" value={draft.issuingDistrict} />
          <ReviewField label="Issue Date (BS)" value={draft.issueDateBS} />
          <ReviewField label="Issuing Authority" value={draft.issuingAuthority} />
          <ReviewField
            label="Father"
            value={`${draft.fatherName.english} (${draft.fatherName.nepali})`}
          />
          <ReviewField
            label="Mother"
            value={`${draft.motherName.english} (${draft.motherName.nepali})`}
          />
          <ReviewField
            label="Grandfather"
            value={`${draft.grandfatherName.english} (${draft.grandfatherName.nepali})`}
          />
          <ReviewField
            label="Address"
            value={`Ward ${draft.permanentAddress.wardNo}, ${draft.permanentAddress.localLevel}, ${draft.permanentAddress.district}`}
          />
        </div>
      </div>

      {/* Appointment Summary */}
      <div className="review-section review-section--highlight">
        <div className="review-section__header">
          <h3 className="review-section__title">
            🏛️ भेटघाट / Appointment
          </h3>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => setCurrentStep(3)}
          >
            Edit
          </button>
        </div>
        <div className="review-appointment">
          <div className="review-appointment__card">
            <div className="review-appointment__icon">📅</div>
            <div className="review-appointment__details">
              <h4>{appointmentPreferences.officeName}</h4>
              <p className="review-appointment__date">
                {formatDate(appointmentPreferences.selectedDate)}
              </p>
              <p className="review-appointment__time">
                {appointmentPreferences.selectedSlot}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Transfer to DoNIDCR ═══ */}
      <div className="review-section" style={{
        background: "linear-gradient(135deg, #003893 0%, #1a5fc7 100%)",
        borderRadius: "16px",
        padding: "2rem",
        color: "white",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🇳🇵</span>
        </div>
        <h3 style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          color: "white",
        }}>
          Transfer to DoNIDCR
        </h3>
        <p style={{
          fontSize: "0.95rem",
          opacity: 0.85,
          marginBottom: "1.5rem",
          maxWidth: "500px",
          margin: "0 auto 1.5rem",
          lineHeight: 1.6,
        }}>
          Copy the auto-fill script to your clipboard. Then open{" "}
          <a
            href="https://enrollment.donidcr.gov.np/PreEnrollment/form"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ffd700", textDecoration: "underline" }}
          >
            enrollment.donidcr.gov.np
          </a>
          , press <strong>F12</strong> → <strong>Console</strong> → paste (<strong>Ctrl+V</strong>) → press <strong>Enter</strong>.
        </p>

        <button
          onClick={handleTransfer}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.9rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: copyState === "copied" ? "#003893" : "white",
            background: copyState === "copied"
              ? "linear-gradient(135deg, #ffd700, #ffec4d)"
              : "linear-gradient(135deg, #DC143C, #ff3366)",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            minWidth: "280px",
          }}
        >
          {copyState === "copied" ? (
            <>✅ Copied to Clipboard!</>
          ) : copyState === "error" ? (
            <>❌ Copy Failed — Try Again</>
          ) : (
            <>📋 Copy Auto-Fill Script</>
          )}
        </button>

        {copyState === "copied" && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem 1.25rem",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "10px",
            fontSize: "0.9rem",
            animation: "fadeIn 0.3s ease",
          }}>
            <strong>Next Steps:</strong><br />
            1. Open DoNIDCR enrollment form<br />
            2. Press F12 → Console tab<br />
            3. Paste (Ctrl+V) and press Enter<br />
            4. All fields will fill automatically! ✨
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <button className="btn btn--outline" onClick={prevStep}>
          ← Back
        </button>
        <div />
      </div>
    </div>
  );
}

/** Simple read-only field for the review summary */
function ReviewField({
  label,
  value,
  isNepali,
}: {
  label: string;
  value: string;
  isNepali?: boolean;
}) {
  return (
    <div className="review-field">
      <span className="review-field__label">{label}</span>
      <span
        className={`review-field__value ${isNepali ? "review-field__value--np" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
