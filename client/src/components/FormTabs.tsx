/**
 * FormTabs — Tab-based form wizard that renders the active
 * enrollment step. Controls navigation between the 3 tabs:
 * Personal Info → Family Info → Export
 */

import { useEnrollmentStore } from "../store/enrollmentStore";
import ApplicantDataTab from "./ApplicantDataTab";
import ContactDetailsTab from "./ContactDetailsTab";
import FamilyDetailsTab from "./FamilyDetailsTab";
import AppointmentTab from "./AppointmentTab";
import ExportTab from "./ExportTab";

export default function FormTabs() {
  const { currentStep } = useEnrollmentStore();


  const renderActiveTab = () => {
    switch (currentStep) {
      case 1:
        return <ApplicantDataTab />;
      case 2:
        return <ContactDetailsTab />;
      case 3:
        return <FamilyDetailsTab />;
      case 4:
        return <AppointmentTab />;
      case 5:
        return <ExportTab />;
      default:
        return <ApplicantDataTab />;
    }
  };

  return (
    <div className="form-wizard fade-in">
      {/* Tab Navigation removed to prevent duplicate pipelines (UploadPage renders the Stepper) */}

      {/* Active Tab Content */}
      <div className="form-tab-content">
        {renderActiveTab()}
      </div>
    </div>
  );
}
