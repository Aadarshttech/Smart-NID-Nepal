/**
 * Zustand enrollment store — holds extracted data, draft,
 * additional user-entered fields, and UI state for the entire enrollment flow.
 */

import { create } from "zustand";
import type {
  ExtractionResult,
  AdditionalFields,
} from "../types/extraction";

/** Steps in the enrollment wizard */
export const ENROLLMENT_STEPS = [
  { label: "Upload", labelNp: "अपलोड" },
  { label: "Personal Info", labelNp: "व्यक्तिगत विवरण" },
  { label: "Family Info", labelNp: "पारिवारिक विवरण" },
  { label: "Export", labelNp: "निर्यात" },
] as const;

/** Default values for user-entered additional fields */
const DEFAULT_ADDITIONAL: AdditionalFields = {
  maritalStatus: "",
  educationLevel: "",
  profession: "",
  caste: "",
  religion: "",
  ccType: "1", // Default: Citizenship by Descent (most common)
  phoneNo: "",
  mobileNo: "",
  temporaryAddressSameAsPermanent: true,
  temporaryAddress: {
    province: "",
    district: "",
    localLevel: "",
    wardNo: "",
    villageToleNp: "",
    villageToleEn: "",
  },
  grandmotherName: { nepali: "", english: "" },
  spouseFirstName: { nepali: "", english: "" },
  spouseMiddleName: { nepali: "", english: "" },
  spouseLastName: { nepali: "", english: "" },
};

interface EnrollmentState {
  /** Raw extraction result from OCR */
  extractedData: ExtractionResult | null;

  /** Working draft pre-filled from extraction, editable by user */
  draft: ExtractionResult | null;

  /** Additional fields not present on citizenship certificate */
  additional: AdditionalFields;

  /** Current step in the enrollment wizard (0-3) */
  currentStep: number;

  /** Extraction UI state */
  isExtracting: boolean;
  extractionError: string | null;

  /** The uploaded images as data URLs for preview */
  frontPreview: string | null;
  backPreview: string | null;

  /** Timestamp when user reviewed extraction (Phase 3) */
  reviewedAt: string | null;

  /** Actions */
  setExtractedData: (data: ExtractionResult) => void;
  setIsExtracting: (value: boolean) => void;
  setExtractionError: (error: string | null) => void;
  setFrontPreview: (url: string | null) => void;
  setBackPreview: (url: string | null) => void;
  updateDraftField: <K extends keyof ExtractionResult>(
    field: K,
    value: ExtractionResult[K]
  ) => void;
  updateAdditionalField: <K extends keyof AdditionalFields>(
    field: K,
    value: AdditionalFields[K]
  ) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  loadProfile: (draft: ExtractionResult, additional: AdditionalFields) => void;
  resetStore: () => void;
}

const initialState = {
  extractedData: null,
  draft: null,
  additional: { ...DEFAULT_ADDITIONAL },
  currentStep: 0,
  isExtracting: false,
  extractionError: null,
  frontPreview: null,
  backPreview: null,
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

  setFrontPreview: (url) =>
    set({ frontPreview: url }),

  setBackPreview: (url) =>
    set({ backPreview: url }),

  updateDraftField: (field, value) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, [field]: value },
      };
    }),

  updateAdditionalField: (field, value) =>
    set((state) => ({
      additional: { ...state.additional, [field]: value },
    })),

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

  loadProfile: (draft, additional) =>
    set({
      draft,
      extractedData: draft,
      additional,
      currentStep: 1, // Jump to Personal Info step
      isExtracting: false,
      extractionError: null,
      frontPreview: null, // Clear previews since we're loading from saved state
      backPreview: null
    }),

  resetStore: () => set(initialState),
}));
