import { useCallback } from "react";
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
    imagePreview,
    currentStep,
    setExtractedData,
    setIsExtracting,
    setExtractionError,
    setImagePreview,
    resetStore,
  } = useEnrollmentStore();

  const handleFileSelected = useCallback(
    async (file: File) => {
      // Show image preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Start extraction
      setIsExtracting(true);
      setExtractionError(null);

      try {
        const formData = new FormData();
        formData.append("citizenship", file);

        const response = await fetch(`${API_BASE}/api/extract`, {
          method: "POST",
          body: formData,
        });

        const result: ExtractResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.error || "Failed to extract data from the image"
          );
        }

        setExtractedData(result.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";
        setExtractionError(message);
      }
    },
    [setExtractedData, setIsExtracting, setExtractionError, setImagePreview]
  );

  const handleRetry = useCallback(() => {
    resetStore();
  }, [resetStore]);

  return (
    <div className="upload-page">
      {/* Hero Header */}
      <header className="upload-header">
        <div className="upload-header__flag">🇳🇵</div>
        <h1 className="upload-header__title">
          <span className="upload-header__title--np">स्मार्ट दर्ता</span>
          <span className="upload-header__title--en">Smart NID Nepal</span>
        </h1>
        <p className="upload-header__subtitle">
          AI-Powered National ID Pre-Enrollment
        </p>
        {currentStep === 0 && (
          <p className="upload-header__description">
            Upload your citizenship certificate — AI will read it and fill out the
            entire NID enrollment form for you.
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
                  <span className="step__number">
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span className="step__label">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Section (Step 0) */}
        {currentStep === 0 && !isExtracting && !extractionError && (
          <div className="upload-section fade-in">
            <DropZone
              onFileSelected={handleFileSelected}
              disabled={isExtracting}
            />
          </div>
        )}

        {/* Loading State */}
        {isExtracting && (
          <div className="loading-section fade-in">
            {imagePreview && (
              <div className="loading-preview">
                <img
                  src={imagePreview}
                  alt="Uploaded citizenship certificate"
                  className="loading-preview__image"
                />
                <div className="loading-preview__overlay">
                  <div className="scan-line" />
                </div>
              </div>
            )}
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
            {imagePreview && (
              <aside className="form-sidebar">
                <details className="form-sidebar__details" open>
                  <summary className="form-sidebar__summary">
                    📷 Uploaded Document
                  </summary>
                  <img
                    src={imagePreview}
                    alt="Citizenship certificate"
                    className="form-sidebar__img"
                  />
                </details>
                <button
                  onClick={handleRetry}
                  className="btn btn--outline btn--sm form-sidebar__reupload"
                >
                  ↻ Re-upload
                </button>
              </aside>
            )}

            {/* Form tabs */}
            <div className="form-wizard-main">
              <FormTabs />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="upload-footer">
        <p>
          Smart NID Nepal is a prototype. No real data is submitted to DoNIDCR.
        </p>
        <p>
          Your image is processed securely and never stored.
        </p>
      </footer>
    </div>
  );
}
