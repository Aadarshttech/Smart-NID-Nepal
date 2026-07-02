/**
 * ExportTab — The final step of the Smart NID flow.
 * Provides the auto-fill script for the user to transfer
 * all their extracted and manually entered data to DoNIDCR.
 */

import { useState } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import { generateAutoFillScript } from "../utils/generateAutoFill";

export default function ExportTab() {
  const { draft, additional, prevStep } = useEnrollmentStore();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  if (!draft) return null;

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
      <div className="form-section">
        <h3 className="form-section__title">
          🚀 Export to DoNIDCR
        </h3>
        <p className="form-section__hint">
          All your details have been saved! You can now transfer them to the official government portal. The appointment and review steps will be completed there.
        </p>

        {/* ═══ Transfer to DoNIDCR ═══ */}
        <div className="review-section" style={{
          background: "linear-gradient(135deg, #003893 0%, #1a5fc7 100%)",
          borderRadius: "16px",
          padding: "3rem 2rem",
          color: "white",
          textAlign: "center",
          marginTop: "2rem",
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ fontSize: "3.5rem" }}>🇳🇵</span>
          </div>
          <h3 style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "white",
          }}>
            Ready to Transfer
          </h3>
          <p style={{
            fontSize: "1.05rem",
            opacity: 0.9,
            marginBottom: "2rem",
            maxWidth: "550px",
            margin: "0 auto 2rem",
            lineHeight: 1.6,
          }}>
            Copy the auto-fill script below. Then open{" "}
            <a
              href="https://enrollment.donidcr.gov.np/PreEnrollment/form"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffd700", textDecoration: "underline", fontWeight: 600 }}
            >
              enrollment.donidcr.gov.np
            </a>
            , press <strong>F12</strong> to open the <strong>Console</strong>, paste (<strong>Ctrl+V</strong>) the script, and press <strong>Enter</strong>.
          </p>

          <button
            onClick={handleTransfer}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "1.1rem 3rem",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: copyState === "copied" ? "#003893" : "white",
              background: copyState === "copied"
                ? "linear-gradient(135deg, #ffd700, #ffec4d)"
                : "linear-gradient(135deg, #DC143C, #ff3366)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
              minWidth: "300px",
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
              marginTop: "1.5rem",
              padding: "1rem 1.5rem",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "12px",
              fontSize: "1rem",
              animation: "fadeIn 0.3s ease",
              textAlign: "left",
              maxWidth: "400px",
              margin: "1.5rem auto 0",
            }}>
              <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "1.1rem" }}>Next Steps:</strong>
              <ol style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.5 }}>
                <li>Open the <a href="https://enrollment.donidcr.gov.np/PreEnrollment/form" target="_blank" rel="noopener noreferrer" style={{ color: "#ffd700" }}>DoNIDCR site</a></li>
                <li>Press <strong>F12</strong> and click <strong>Console</strong></li>
                <li>Press <strong>Ctrl+V</strong> to paste</li>
                <li>Press <strong>Enter</strong></li>
                <li>Complete your appointment booking there!</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="form-nav" style={{ marginTop: "2rem" }}>
        <button className="btn btn--outline" onClick={prevStep}>
          ← Back
        </button>
        <div />
      </div>
    </div>
  );
}
