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
      <div className="form-section">
        <h3 className="form-section__title">
          डाटा ट्रान्सफर / Data Transfer
        </h3>
        
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", position: "relative" }}>
          <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
            <NepalFlagSVG />
          </div>
          
          <h3 style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "var(--ink-primary)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            [ SYSTEM READY ]
          </h3>
          
          <p style={{
            fontSize: "0.9rem",
            color: "var(--ink-secondary)",
            marginBottom: "2.5rem",
            fontFamily: "var(--font-mono)",
            lineHeight: 1.6,
            maxWidth: "600px",
            margin: "0 auto 2.5rem",
          }}>
            {hasExtension 
              ? "> EXTENSION DETECTED. CLICK INITIATE TO SECURELY CACHE DATA. PROCEED TO DONIDCR PORTAL FOR AUTO-FILL INJECTION."
              : "> STANDALONE MODE. COPY PAYLOAD TO CLIPBOARD. EXECUTE VIA CONSOLE ON OFFICIAL PORTAL."
            }
          </p>

          <button
            onClick={handleTransfer}
            disabled={copyState === "transferring"}
            className="btn btn--primary"
            style={{
              padding: "1rem 3rem",
              fontSize: "1rem",
              width: "100%",
              maxWidth: "400px",
              cursor: copyState === "transferring" ? "wait" : "pointer",
            }}
          >
            {copyState === "transferring" ? (
              <span className="blink">[ SAVING DATA... ]</span>
            ) : copyState === "copied" ? (
              <span>
                 {hasExtension ? "[ SAVED TO EXTENSION ]" : "[ PAYLOAD COPIED ]"}
              </span>
            ) : copyState === "error" ? (
              <span>[ SAVE FAILED - RETRY ]</span>
            ) : (
              <span>
                 {hasExtension ? "[ SAVE DATA TO EXTENSION ]" : "[ COPY SECURE PAYLOAD ]"}
              </span>
            )}
          </button>

          {errorMsg && copyState === "error" && (
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "transparent",
              border: "1px solid var(--crimson)",
              borderLeft: "4px solid var(--crimson)",
              color: "var(--crimson)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              maxWidth: "400px",
              width: "100%",
              margin: "1.5rem auto 0",
              textAlign: "left",
              textTransform: "uppercase"
            }}>
              ERR: {errorMsg}
            </div>
          )}

          {!hasExtension && (
            <div style={{ 
              marginTop: "3rem", 
              padding: "1.5rem", 
              background: "transparent", 
              border: "1px solid var(--hairline)",
              borderLeft: "4px solid var(--ink-muted)",
              textAlign: "left",
              maxWidth: "600px",
              margin: "3rem auto 0"
            }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "var(--ink-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                [ SYSTEM UPGRADE AVAILABLE ]
              </h4>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
                INSTALL THE OFFICIAL EXTENSION FOR 1-CLICK INJECTION. BYPASS CONSOLE COMMANDS.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <a 
                  href="https://microsoftedge.microsoft.com/addons/detail/smart-nid-helper/gakoiaflpofkoadcmbdeejpmhgnapbfm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                  style={{ textDecoration: "none" }}
                >
                  [ DOWNLOAD EXTENSION ]
                </a>
              </div>
            </div>
          )}

           {copyState === "copied" && (
            <div style={{
              marginTop: "3rem",
              textAlign: "left",
              maxWidth: "600px",
              margin: "3rem auto 0",
              borderTop: "1px solid var(--hairline)",
              paddingTop: "2rem"
            }}>
              <h4 style={{ 
                fontSize: "1rem", 
                color: "var(--ink-primary)", 
                marginBottom: "1.5rem",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                [ EXECUTION PROTOCOL ]
              </h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {/* Step 1 */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem 0", borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink-muted)", fontWeight: 700 }}>01.</div>
                  <div>
                    <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", color: "var(--ink-primary)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>OPEN PORTAL</h5>
                    <p style={{ margin: 0, color: "var(--ink-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>NAVIGATE TO <a href="https://enrollment.donidcr.gov.np/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink-primary)", fontWeight: 700, textDecoration: "underline" }}>ENROLLMENT.DONIDCR.GOV.NP</a></p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem 0", borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink-muted)", fontWeight: 700 }}>02.</div>
                  <div>
                    <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", color: "var(--ink-primary)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>AUTHENTICATE</h5>
                    <p style={{ margin: 0, color: "var(--ink-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>VERIFY MOBILE OTP AND INITIALIZE "NEW ENROLLMENT".</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem 0", borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink-muted)", fontWeight: 700 }}>03.</div>
                  <div>
                    <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", color: "var(--ink-primary)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{hasExtension ? "INJECT DATA" : "EXECUTE PAYLOAD"}</h5>
                    {hasExtension ? (
                      <p style={{ margin: 0, color: "var(--ink-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
                        CLICK THE <strong style={{ color: "var(--ink-primary)" }}>[ AUTO-FILL FORM ]</strong> OVERLAY IN THE BOTTOM RIGHT.
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: "var(--ink-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
                        OPEN CONSOLE [F12] -&gt; PASTE PAYLOAD [CTRL+V] -&gt; EXECUTE [ENTER].
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-start" }}>
                <a 
                  href="https://enrollment.donidcr.gov.np/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                  style={{ textDecoration: "none" }}
                >
                  [ LAUNCH DONIDCR PORTAL ]
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <button className="btn btn--outline" onClick={prevStep}>
          [ BACK ]
        </button>
        <div />
      </div>
    </div>
  );
}

