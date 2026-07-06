import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import Dashboard from "./pages/Dashboard";
import { useEnrollmentStore } from "./store/enrollmentStore";

function App() {
  const [view, setView] = useState<"dashboard" | "enrollment">("dashboard");
  const { resetStore } = useEnrollmentStore();

  const handleNewEnrollment = () => {
    resetStore();
    setView("enrollment");
  };

  const handleEditProfile = () => {
    setView("enrollment");
  };

  return (
    <>
      {view === "dashboard" ? (
        <Dashboard onNewEnrollment={handleNewEnrollment} onEditProfile={handleEditProfile} />
      ) : (
        <>
          <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 100 }}>
            <button 
              onClick={() => setView("dashboard")}
              className="btn btn-secondary"
              style={{ padding: "8px 12px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Dashboard
            </button>
          </div>
          <UploadPage />
        </>
      )}
    </>
  );
}

export default App;
