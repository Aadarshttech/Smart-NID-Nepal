/**
 * ReviewTab — Final read-only summary of all enrollment data
 * with the option to jump back and edit any section.
 * Submit button is a placeholder for future phases.
 */

import { useEnrollmentStore } from "../store/enrollmentStore";

export default function ReviewTab() {
  const { draft, appointmentPreferences, setCurrentStep, prevStep } =
    useEnrollmentStore();

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

      {/* Submit */}
      <div className="review-submit">
        <p className="review-submit__disclaimer">
          📌 यो एउटा प्रोटोटाइप हो। कुनै वास्तविक डाटा DoNIDCR मा पठाइने छैन।
        </p>
        <p className="review-submit__disclaimer-en">
          This is a prototype. No real data will be submitted to DoNIDCR.
        </p>
        <button className="btn btn--primary btn--lg" disabled>
          Submit Application (Coming Soon)
        </button>
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
