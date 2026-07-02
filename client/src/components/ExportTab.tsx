/**
 * ExportTab — The final step of the Smart NID flow.
 * Provides the auto-fill script for the user to transfer
 * all their extracted and manually entered data to DoNIDCR.
 */

import { useState } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import { generateAutoFillScript } from "../utils/generateAutoFill";

const NepalFlagSVG = () => (
  <svg width="64" height="80" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))" }}>
    <path d="M10 10 L90 50 L35 55 L90 100 L10 105 Z" fill="#DC143C" stroke="#003893" strokeWidth="4" strokeLinejoin="round"/>
    <circle cx="30" cy="40" r="6" fill="white" />
    <path d="M25 40 Q30 35 35 40" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M30 80 L25 85 L35 85 Z" fill="white"/>
    <circle cx="30" cy="88" r="6" fill="white" />
  </svg>
);

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
      <div className="form-section" style={{ textAlign: "center", padding: "1rem 0 3rem" }}>
        
        {/* Premium Export Card */}
        <div style={{
          background: "linear-gradient(145deg, #ffffff, #f3f6fa)",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          boxShadow: "0 20px 40px rgba(0, 56, 147, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
          border: "1px solid rgba(0, 56, 147, 0.1)",
          maxWidth: "600px",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative background glow */}
          <div style={{
            position: "absolute",
            top: "-50%",
            left: "-20%",
            width: "140%",
            height: "140%",
            background: "radial-gradient(circle, rgba(220, 20, 60, 0.03) 0%, rgba(0, 56, 147, 0.03) 50%, transparent 70%)",
            zIndex: 0,
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
              <NepalFlagSVG />
            </div>
            
            <h3 style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "1rem",
              color: "#1a1f36",
              letterSpacing: "-0.02em"
            }}>
              Ready to Transfer
            </h3>
            
            <p style={{
              fontSize: "1.05rem",
              color: "#4f566b",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
            }}>
              Your data is secured and ready. Copy the smart script below, then paste it into the official DoNIDCR portal to complete your registration instantly.
            </p>

            <button
              onClick={handleTransfer}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "1.1rem 3rem",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "white",
                background: copyState === "copied"
                  ? "linear-gradient(135deg, #00b09b, #96c93d)"
                  : "linear-gradient(135deg, #003893, #1a5fc7)",
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: copyState === "copied" 
                  ? "0 10px 25px rgba(0, 176, 155, 0.3)"
                  : "0 10px 25px rgba(0, 56, 147, 0.25)",
                width: "100%",
                maxWidth: "360px",
                transform: copyState === "copied" ? "scale(0.98)" : "scale(1)",
              }}
            >
              {copyState === "copied" ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Copied to Clipboard!
                </>
              ) : copyState === "error" ? (
                <>❌ Copy Failed — Try Again</>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy Auto-Fill Script
                </>
              )}
            </button>

            {copyState === "copied" && (
              <div style={{
                marginTop: "2rem",
                padding: "1.5rem",
                background: "rgba(0, 56, 147, 0.04)",
                border: "1px solid rgba(0, 56, 147, 0.1)",
                borderRadius: "16px",
                textAlign: "left",
                animation: "fadeIn 0.4s ease",
              }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", fontSize: "1.05rem", color: "#1a1f36" }}>
                  Next Steps:
                </strong>
                <ol style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.6, color: "#4f566b" }}>
                  <li>Open <a href="https://enrollment.donidcr.gov.np/PreEnrollment/form" target="_blank" rel="noopener noreferrer" style={{ color: "#003893", fontWeight: 600, textDecoration: "none" }}>enrollment.donidcr.gov.np ↗</a></li>
                  <li>Press <kbd style={{ background: "#e3e8ee", padding: "0.2rem 0.4rem", borderRadius: "4px", fontSize: "0.9em" }}>F12</kbd> and click the <strong>Console</strong> tab</li>
                  <li>Press <kbd style={{ background: "#e3e8ee", padding: "0.2rem 0.4rem", borderRadius: "4px", fontSize: "0.9em" }}>Ctrl</kbd> + <kbd style={{ background: "#e3e8ee", padding: "0.2rem 0.4rem", borderRadius: "4px", fontSize: "0.9em" }}>V</kbd> to paste</li>
                  <li>Press <kbd style={{ background: "#e3e8ee", padding: "0.2rem 0.4rem", borderRadius: "4px", fontSize: "0.9em" }}>Enter</kbd> to autofill everything instantly!</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <button className="btn btn--outline" onClick={prevStep} style={{ background: "white" }}>
          ← Back
        </button>
        <div />
      </div>
    </div>
  );
}
