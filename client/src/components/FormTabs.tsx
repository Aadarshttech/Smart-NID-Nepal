/**
 * FormTabs — Tab-based form wizard that renders the active
 * enrollment step. Controls navigation between the 3 tabs:
 * Personal Info → Family Info → Export
 */

import { useEnrollmentStore, ENROLLMENT_STEPS } from "../store/enrollmentStore";
import PersonalDetailsTab from "./PersonalDetailsTab";
import DocumentFamilyTab from "./DocumentFamilyTab";
import ExportTab from "./ExportTab";

export default function FormTabs() {
  const { currentStep, setCurrentStep } = useEnrollmentStore();

  const tabs = ENROLLMENT_STEPS.slice(1); // Skip "Upload" — that's handled separately

  const renderActiveTab = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetailsTab />;
      case 2:
        return <DocumentFamilyTab />;
      case 3:
        return <ExportTab />;
      default:
        return <PersonalDetailsTab />;
    }
  };

  return (
    <div className="form-wizard fade-in">
      {/* Tab Navigation */}
      <nav className="form-tabs" role="tablist">
        {tabs.map((tab, idx) => {
          const stepNum = idx + 1; // 1-based since step 0 is Upload
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          const isClickable = stepNum <= currentStep;

          return (
            <button
              key={tab.label}
              role="tab"
              aria-selected={isActive}
              className={`form-tab ${isActive ? "form-tab--active" : ""} ${isCompleted ? "form-tab--completed" : ""}`}
              onClick={() => isClickable && setCurrentStep(stepNum)}
              disabled={!isClickable}
            >
              <span className="form-tab__number">
                {isCompleted ? "✓" : stepNum}
              </span>
              <span className="form-tab__label">{tab.label}</span>
              <span className="form-tab__label-np">{tab.labelNp}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Tab Content */}
      <div className="form-tab-content">
        {renderActiveTab()}
      </div>
    </div>
  );
}
