/**
 * ExportTab — The final step of the Smart NID flow.
 * Provides the auto-fill script for the user to transfer
 * all their extracted and manually entered data to DoNIDCR.
 */

import { useState, useEffect } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import { generateAutoFillScript, generateAutoFillInstructions } from "../utils/generateAutoFill";

const NepalFlagSVG = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" 
    alt="Nepal Flag" 
    style={{ 
      width: "56px", 
      height: "auto", 
      filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.15))",
      transform: "scale(1.1)",
      marginBottom: "0.5rem"
    }} 
  />
);

export default function ExportTab() {
  const { draft, additional, prevStep } = useEnrollmentStore();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error" | "transferring">("idle");
  const [hasExtension, setHasExtension] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleExtensionReady = () => setHasExtension(true);
    
    // Listen for the ready event
    window.addEventListener("SMART_NID_EXTENSION_READY", handleExtensionReady);
    
    // Listen for success/error from the extension
    const handleTransferSuccess = () => setCopyState("copied");
    const handleTransferError = () => {
      setErrorMsg("Extension connection lost. Please refresh this page (F5) and try again.");
      setCopyState("error");
    };
    
    window.addEventListener("SMART_NID_TRANSFER_SUCCESS", handleTransferSuccess);
    window.addEventListener("SMART_NID_TRANSFER_ERROR", handleTransferError);

    // Ping the extension in case we missed the initial ready event
    window.dispatchEvent(new CustomEvent("SMART_NID_PING"));

    return () => {
      window.removeEventListener("SMART_NID_EXTENSION_READY", handleExtensionReady);
      window.removeEventListener("SMART_NID_TRANSFER_SUCCESS", handleTransferSuccess);
      window.removeEventListener("SMART_NID_TRANSFER_ERROR", handleTransferError);
    };
  }, []);

  if (!draft) return null;

  const handleTransfer = async () => {
    try {
      const script = generateAutoFillScript(draft, additional);
      const instructions = generateAutoFillInstructions(draft, additional);
      
      if (hasExtension) {
        setCopyState("transferring");
        setErrorMsg("");

        // Set a timeout — if no success/error event within 3s, the extension is stale
        const timeout = setTimeout(async () => {
          // Fallback: copy to clipboard so user isn't stuck
          try {
            await navigator.clipboard.writeText(script);
            setErrorMsg("Extension didn't respond. Script copied to clipboard instead. Try refreshing the page (F5).");
            setCopyState("error");
          } catch {
            setErrorMsg("Extension connection lost. Please refresh this page (F5) and try again.");
            setCopyState("error");
          }
        }, 3000);

        // Listen for resolution to clear the timeout
        const clearOnSuccess = () => { clearTimeout(timeout); setErrorMsg(""); };
        const clearOnError = () => { clearTimeout(timeout); };
        window.addEventListener("SMART_NID_TRANSFER_SUCCESS", clearOnSuccess, { once: true });
        window.addEventListener("SMART_NID_TRANSFER_ERROR", clearOnError, { once: true });

        // Dispatch to extension
        window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER", { detail: { script, draft, additional, instructions } }));
      } else {
        // Fallback: Manual copy to clipboard
        await navigator.clipboard.writeText(script);
        setCopyState("copied");
      }
      
      // ✨ NEW: Backup to localStorage in case the extension drops it
      try {
        localStorage.setItem(`smart_nid_backup_${draft.citizenshipNo}`, JSON.stringify(additional));
      } catch (err) {
        console.warn("Failed to backup to localStorage", err);
      }
      
    } catch {
      setCopyState("error");
      setErrorMsg("Something went wrong. Please try again.");
      setTimeout(() => setCopyState("idle"), 4000);
    }
  };

  return (
    <div className="form-tab-panel fade-in">
      <div className="form-section" style={{ 
        textAlign: "center", 
        padding: "4rem 2rem",
        position: "relative",
        overflow: "hidden",
        border: "none",
        boxShadow: "none",
        background: "transparent"
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

        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
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
              {hasExtension 
                ? "Your Smart NID Helper extension is connected! Click below to save your data to the extension. Then navigate to the DoNIDCR portal, complete the Phone & OTP steps, click New Enrollment, and the auto-fill button will appear."
                : "Your data is secured and ready. Copy the smart script below, then paste it into the official DoNIDCR portal console to complete your registration instantly."
              }
            </p>

            <button
              onClick={handleTransfer}
              disabled={copyState === "transferring"}
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
                cursor: copyState === "transferring" ? "wait" : "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: copyState === "copied" 
                  ? "0 10px 25px rgba(0, 176, 155, 0.3)"
                  : "0 10px 25px rgba(0, 56, 147, 0.25)",
                width: "100%",
                maxWidth: "380px",
                transform: copyState === "copied" ? "scale(0.98)" : "scale(1)",
              }}
            >
              {copyState === "transferring" ? (
                <>⏳ Transferring to DoNIDCR...</>
              ) : copyState === "copied" ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   {hasExtension ? "Data Saved to Extension!" : "Copied to Clipboard!"}
                </>
              ) : copyState === "error" ? (
                <>❌ Transfer Failed — Try Again</>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                   {hasExtension ? "Save Data to Extension" : "Copy Auto-Fill Script"}
                </>
              )}
            </button>

            {errorMsg && copyState === "error" && (
              <div style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                color: "#991b1b",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                maxWidth: "380px",
                width: "100%",
                textAlign: "center",
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {!hasExtension && (
              <div style={{ 
                marginTop: "2rem", 
                padding: "1.5rem", 
                background: "linear-gradient(to right, #eff6ff, #f0fdf4)", 
                border: "1px solid #bfdbfe",
                borderRadius: "16px",
                textAlign: "left",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.4rem" }}>🚀</span>
                  <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "1.15rem", fontWeight: 800 }}>Skip the Copy & Paste!</h4>
                </div>
                <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
                  Tired of manually pressing F12 and pasting code? Install the official Smart NID Helper extension for a <strong>true 1-click experience</strong>!
                </p>
                <ul style={{ margin: "0 0 1.25rem 0", paddingLeft: "1.5rem", color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  <li>✨ <strong>Zero Code:</strong> No need to mess with developer consoles.</li>
                  <li>🔒 <strong>Secure Transfer:</strong> Data moves directly into the portal safely.</li>
                  <li>⚡ <strong>Instant Fill:</strong> Adds a magic "Auto-Fill" button directly on the government site.</li>
                </ul>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "0.6rem 1.25rem",
                      background: "#2563eb",
                      color: "white",
                      textDecoration: "none",
                      fontWeight: 600,
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#1d4ed8"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#2563eb"}
                  >
                    Get Chrome Extension
                  </a>
                  <a 
                    href="https://microsoftedge.microsoft.com/addons/detail/smart-nid-helper/gakoiaflpofkoadcmbdeejpmhgnapbfm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "0.6rem 1.25rem",
                      background: "#0f766e",
                      color: "white",
                      textDecoration: "none",
                      fontWeight: 600,
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#115e59"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#0f766e"}
                  >
                    Get Edge Add-on
                  </a>
                </div>
              </div>
            )}

             {copyState === "copied" && (
              <div style={{
                marginTop: "2.5rem",
                textAlign: "left",
                animation: "fadeIn 0.5s ease-out",
              }}>
                <h4 style={{ 
                  fontSize: "1.2rem", 
                  color: "#1a1f36", 
                  marginBottom: "1.5rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#003893" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  What to do next?
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Step 1 */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>1</div>
                    <div>
                      <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#1e293b" }}>Open the Portal</h5>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>Go to <a href="https://enrollment.donidcr.gov.np/" target="_blank" rel="noopener noreferrer" style={{ color: "#003893", fontWeight: 600, textDecoration: "none" }}>enrollment.donidcr.gov.np ↗</a> in a new tab.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>2</div>
                    <div>
                      <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#1e293b" }}>Login & Start</h5>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>Enter your <strong>mobile number</strong>, verify with <strong>OTP</strong>, and click <strong>"New Enrollment"</strong>.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "linear-gradient(to bottom, #003893, #dc143c)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>3</div>
                    <div>
                      <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#1e293b" }}>{hasExtension ? "Click Auto-Fill" : "Paste the Script"}</h5>
                      {hasExtension ? (
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
                          The <strong style={{ color: "#003893", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>✨ Auto-Fill Form ✨</strong> button will appear at the bottom right. Click it and watch the magic!
                        </p>
                      ) : (
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
                          Press <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85em" }}>F12</kbd> (Console), <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85em" }}>Ctrl</kbd> + <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85em" }}>V</kbd>, then <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85em" }}>Enter</kbd>.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                  <a 
                    href="https://enrollment.donidcr.gov.np/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "1rem 2.5rem",
                      backgroundColor: "#1e293b",
                      color: "white",
                      borderRadius: "12px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      boxShadow: "0 10px 25px rgba(30, 41, 59, 0.3)",
                      transition: "transform 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Head towards DoNIDCR 
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </div>
              </div>
            )}
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
