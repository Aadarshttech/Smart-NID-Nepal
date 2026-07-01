import { useState, useCallback } from "react";
import DropZone from "../components/DropZone";
import FormTabs from "../components/FormTabs";
import { useEnrollmentStore, ENROLLMENT_STEPS } from "../store/enrollmentStore";
import type { ExtractResponse } from "../types/extraction";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

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
      {/* Hero Header */}
      <header className="upload-header">
        <div className="upload-header__flag" style={{ marginBottom: '0.5rem' }}>
          <img 
            src="/nepal-flag.svg" 
            alt="Nepal Flag" 
            height="32" 
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))", display: "inline-block" }} 
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
        {currentStep === 0 && !isExtracting && !extractionError && (
          <div className="upload-section fade-in">
            <div className="upload-grid">
              <div className="upload-box">
                {frontPreview ? (
                  <div className="upload-preview-container">
                    <img src={frontPreview} alt="Front side" className="upload-preview-img" />
                    <button className="btn btn--outline btn--sm btn--full" onClick={() => { setFrontFile(null); setFrontPreview(null); }}>Remove</button>
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
                    <button className="btn btn--outline btn--sm btn--full" onClick={() => { setBackFile(null); setBackPreview(null); }}>Remove</button>
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
                disabled={!canExtract}
                onClick={handleExtract}
              >
                Extract Data with AI ✨
              </button>
              {!canExtract && (
                <p className="upload-action__hint">Please upload both sides to continue.</p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isExtracting && (
          <div className="loading-section fade-in">
            <div className="loading-status">
              <div className="loading-spinner" />
              <p className="loading-status__text">
                📄 Reading your citizenship certificate…
              </p>
              <p className="loading-status__subtext">
                नागरिकता प्रमाणपत्र पढ्दै…
              </p>
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
