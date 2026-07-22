import { useState, useCallback } from "react";
import DropZone from "../components/DropZone";
import FormTabs from "../components/FormTabs";
import { useEnrollmentStore, ENROLLMENT_STEPS } from "../store/enrollmentStore";
import type { ExtractResponse } from "../types/extraction";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function UploadPage() {
  const {
    extractedData,
    isExtracting,
    extractionError,
    frontPreview,
    backPreview,
    currentStep,
    setExtractedData,
    setIsExtracting,
    setExtractionError,
    setFrontPreview,
    setBackPreview,
    resetStore,
  } = useEnrollmentStore();

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFrontSelected = useCallback(
    (file: File) => {
      setFrontFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFrontPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [setFrontPreview]
  );

  const handleBackSelected = useCallback(
    (file: File) => {
      setBackFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBackPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [setBackPreview]
  );

  const handleExtract = useCallback(async () => {
    if (!frontFile || !backFile) return;

    setLoading(true);
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const formData = new FormData();
      formData.append("front", frontFile);
      formData.append("back", backFile);

      const response = await fetch(`${API_BASE}/api/extract`, {
        method: "POST",
        body: formData,
      });

      const result: ExtractResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to extract data from the images");
      }

      setExtractedData(result.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setExtractionError(message);
    } finally {
      setLoading(false);
      setIsExtracting(false);
    }
  }, [frontFile, backFile, setExtractedData, setIsExtracting, setExtractionError]);

  const handleRetry = useCallback(() => {
    setFrontFile(null);
    setBackFile(null);
    resetStore();
  }, [resetStore]);

  const canExtract = frontFile !== null && backFile !== null;

  return (
    <div className="upload-page">
      {/* ══════════════════════════════════════════════════════
          FULL-SCREEN LOADING OVERLAY
          Rendered at the TOP LEVEL — completely independent of
          currentStep, extractionError, or any other conditional.
          This guarantees it is always visible when isExtracting is true.
         ══════════════════════════════════════════════════════ */}
      {loading && (
        <div
          className="extraction-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="loading-spinner"
            style={{ width: "70px", height: "70px", borderWidth: "6px", marginBottom: "0" }}
          />
          <h3
            style={{
              marginTop: "1.5rem",
              color: "var(--nepal-blue)",
              fontFamily: "var(--font-nepali)",
              fontSize: "1.6rem",
              fontWeight: 700,
            }}
          >
            नागरिकता प्रमाणपत्र पढ्दै…
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
              fontSize: "1.05rem",
            }}
          >
            Extracting data with AI, please wait...
          </p>
          {/* Animated progress bar */}
          <div
            style={{
              marginTop: "2rem",
              width: "240px",
              height: "5px",
              background: "#e2e8f0",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "40%",
                height: "100%",
                background: "linear-gradient(90deg, var(--nepal-blue), var(--crimson))",
                borderRadius: "999px",
                animation: "progressPulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="upload-header">
        <div className="upload-header__flag" style={{ marginBottom: '0.5rem' }}>
          <img 
            src="/nepal-flag.svg" 
            alt="Nepal Flag" 
            style={{ height: "40px", width: "auto", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))", display: "inline-block" }} 
          />
        </div>
        <h1 className="upload-header__title">
          <span className="upload-header__title--np">स्मार्ट दर्ता</span>
          <span className="upload-header__title--en">Smart NID Nepal</span>
        </h1>
        <p className="upload-header__subtitle">
          AI-Powered National ID Pre-Enrollment
        </p>
        {currentStep === 0 && (
          <p className="upload-header__description">
            Upload both sides of your citizenship certificate. The AI will cross-reference
            the Nepali and English text to fill out your entire NID enrollment form.
          </p>
        )}
      </header>

      <main className="upload-main">
        {/* Step indicator */}
        <div className="step-indicator">
          {ENROLLMENT_STEPS.map((step, idx) => {
            const isActive = currentStep === idx;
            const isDone = currentStep > idx;

            return (
              <div key={step.label} className="step-indicator__item">
                {idx > 0 && <div className={`step__connector ${isDone ? "step__connector--done" : ""}`} />}
                <div className={`step ${isActive ? "step--active" : ""} ${isDone ? "step--done" : ""}`}>
                  <span className="step__number">{isDone ? "✓" : idx + 1}</span>
                  <span className="step__label">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Section (Step 0) */}
        {currentStep === 0 && !extractionError && (
          <div className="upload-section fade-in">
            <div className="upload-grid">
              <div className="upload-box">
                {frontPreview ? (
                  <div className="upload-preview-container">
                    <img src={frontPreview} alt="Front side" className="upload-preview-img" />
                    <button className="btn btn--outline btn--sm btn--full" disabled={isExtracting} onClick={() => { setFrontFile(null); setFrontPreview(null); }}>Remove</button>
                  </div>
                ) : (
                  <DropZone
                    onFileSelected={handleFrontSelected}
                    title="Front Side"
                    subtitle="नागरिकताको अगाडिको भाग"
                    disabled={isExtracting}
                  />
                )}
              </div>
              <div className="upload-box">
                {backPreview ? (
                  <div className="upload-preview-container">
                    <img src={backPreview} alt="Back side" className="upload-preview-img" />
                    <button className="btn btn--outline btn--sm btn--full" disabled={isExtracting} onClick={() => { setBackFile(null); setBackPreview(null); }}>Remove</button>
                  </div>
                ) : (
                  <DropZone
                    onFileSelected={handleBackSelected}
                    title="Back Side"
                    subtitle="नागरिकताको पछाडिको भाग (English)"
                    disabled={isExtracting}
                  />
                )}
              </div>
            </div>

            <div className="upload-action">
              <button
                className="btn btn--primary btn--lg"
                disabled={!canExtract || loading}
                onClick={handleExtract}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', minWidth: '280px' }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite'
                    }} />
                    <span>Extracting... Please wait</span>
                  </>
                ) : (
                  <span>Extract Data with AI ✨</span>
                )}
              </button>
              {!canExtract && !isExtracting && (
                <p className="upload-action__hint">Please upload both sides to continue.</p>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {extractionError && !isExtracting && (
          <div className="error-section fade-in">
            <div className="error-card">
              <div className="error-card__icon">⚠️</div>
              <h3 className="error-card__title">Extraction Failed</h3>
              <p className="error-card__message">{extractionError}</p>
              <button onClick={handleRetry} className="btn btn--primary">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Form Wizard (Steps 1-4) */}
        {extractedData && !isExtracting && currentStep >= 1 && (
          <div className="form-wizard-layout">
            {/* Collapsible image sidebar */}
            <aside className="form-sidebar">
              <details className="form-sidebar__details" open>
                <summary className="form-sidebar__summary">
                  📷 Front Side
                </summary>
                {frontPreview && <img src={frontPreview} alt="Front side" className="form-sidebar__img" />}
              </details>
              <details className="form-sidebar__details" open style={{ marginTop: "1rem" }}>
                <summary className="form-sidebar__summary">
                  📷 Back Side
                </summary>
                {backPreview && <img src={backPreview} alt="Back side" className="form-sidebar__img" />}
              </details>
              <button
                onClick={handleRetry}
                className="btn btn--outline btn--sm form-sidebar__reupload"
              >
                ↻ Re-upload Images
              </button>
            </aside>

            {/* Form tabs */}
            <div className="form-wizard-main">
              <FormTabs />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="upload-footer">
        <p>Smart NID Nepal is a prototype. No real data is submitted to DoNIDCR.</p>
        <p>Your images are processed securely and never stored.</p>
      </footer>
    </div>
  );
}
