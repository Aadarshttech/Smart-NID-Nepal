/**
 * Zustand enrollment store — holds extracted data, draft,
 * appointment preferences, and UI state for the entire enrollment flow.
 */

import { create } from "zustand";
import type { ExtractionResult, AppointmentPreferences } from "../types/extraction";

/** Steps in the enrollment wizard */
export const ENROLLMENT_STEPS = [
  { label: "Upload", labelNp: "अपलोड" },
  { label: "Edit Details", labelNp: "विवरण सम्पादन" },
  { label: "Appointment", labelNp: "भेटघाट" },
  { label: "Review", labelNp: "समीक्षा" },
] as const;

interface EnrollmentState {
  /** Raw extraction result from OCR */
  extractedData: ExtractionResult | null;

  /** Working draft pre-filled from extraction, editable by user */
  draft: ExtractionResult | null;

  /** Current step in the enrollment wizard (0-3) */
  currentStep: number;

  /** Appointment preferences selected by user */
  appointmentPreferences: AppointmentPreferences | null;

  /** Extraction UI state */
  isExtracting: boolean;
  extractionError: string | null;

  /** The uploaded image as a data URL for preview */
  imagePreview: string | null;

  /** Timestamp when user reviewed extraction (Phase 3) */
  reviewedAt: string | null;

  /** Actions */
  setExtractedData: (data: ExtractionResult) => void;
  setIsExtracting: (value: boolean) => void;
  setExtractionError: (error: string | null) => void;
  setImagePreview: (url: string | null) => void;
  updateDraftField: <K extends keyof ExtractionResult>(
    field: K,
    value: ExtractionResult[K]
  ) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAppointmentPreferences: (prefs: AppointmentPreferences) => void;
  resetStore: () => void;
}

const initialState = {
  extractedData: null,
  draft: null,
  currentStep: 0,
  appointmentPreferences: null,
  isExtracting: false,
  extractionError: null,
  imagePreview: null,
  reviewedAt: null,
};

export const useEnrollmentStore = create<EnrollmentState>((set) => ({
  ...initialState,

  setExtractedData: (data) =>
    set({
      extractedData: data,
      draft: { ...data }, // Deep copy for independent editing
      extractionError: null,
      currentStep: 1, // Auto-advance to edit step
    }),

  setIsExtracting: (value) =>
    set({ isExtracting: value }),

  setExtractionError: (error) =>
    set({ extractionError: error, isExtracting: false }),

  setImagePreview: (url) =>
    set({ imagePreview: url }),

  updateDraftField: (field, value) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, [field]: value },
      };
    }),

  setCurrentStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(step, ENROLLMENT_STEPS.length - 1)) }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, ENROLLMENT_STEPS.length - 1),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  setAppointmentPreferences: (prefs) =>
    set({ appointmentPreferences: prefs }),

  resetStore: () => set(initialState),
}));
