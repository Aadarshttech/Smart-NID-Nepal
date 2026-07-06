import { useState, useEffect } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";

export default function Dashboard({ onNewEnrollment, onEditProfile }: { onNewEnrollment: () => void, onEditProfile: () => void }) {
  const { loadProfile } = useEnrollmentStore();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Listen for the response from the extension
    const handleProfilesResponse = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.status === "success") {
        setProfiles(customEvent.detail.profiles || []);
        setError(null);
      } else {
        setError("Failed to load profiles from the extension.");
      }
      setLoading(false);
    };

    window.addEventListener("SMART_NID_PROFILES_RESPONSE", handleProfilesResponse);

    // 2. Request profiles from the extension
    window.dispatchEvent(new CustomEvent("SMART_NID_REQUEST_PROFILES"));

    // Fallback in case extension doesn't respond
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Extension didn't respond. Is it installed and active?");
      }
    }, 2000);

    return () => {
      window.removeEventListener("SMART_NID_PROFILES_RESPONSE", handleProfilesResponse);
      clearTimeout(timeout);
    };
  }, [loading]);

  const handleEdit = (profile: any) => {
    // Ensure both draftData and additionalData exist (backward compatibility for old profiles)
    const draft = profile.draftData || {};
    
    // Check if web app has a backup of the additional data for this CIT No (in case extension is outdated)
    const backupStr = localStorage.getItem(`smart_nid_backup_${draft.citizenshipNo}`);
    let backupAdditional = null;
    if (backupStr) {
      try { backupAdditional = JSON.parse(backupStr); } catch (e) {}
    }

    const additional = backupAdditional || profile.additionalData || {
      maritalStatus: "",
      educationLevel: "",
      profession: "",
      caste: "",
      religion: "",
      ccType: "1",
      phoneNo: "",
      mobileNo: "",
      temporaryAddressSameAsPermanent: true,
      temporaryAddress: { province: "", district: "", localLevel: "", wardNo: "", villageToleNp: "", villageToleEn: "" },
      grandmotherName: { nepali: "", english: "" },
      spouseFirstName: { nepali: "", english: "" },
      spouseMiddleName: { nepali: "", english: "" },
      spouseLastName: { nepali: "", english: "" },
    };
    loadProfile(draft, additional);
    onEditProfile(); // Switch view to UploadPage without wiping state
  };

  return (
    <div className="upload-page">
      <div className="form-container fade-in" style={{ maxWidth: "800px" }}>
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>Saved Profiles</h2>
            <button 
              onClick={onNewEnrollment}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Enrollment
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
              Loading profiles from extension...
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" }}>
              <p>{error}</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Please make sure the Smart NID extension is installed and enabled.</p>
            </div>
          ) : profiles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <svg style={{ margin: "0 auto 1rem", color: "#94a3b8" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>No profiles found</h3>
              <p>You haven't saved any enrollments yet. Start a new enrollment to begin.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {profiles.map((profile) => (
                <div key={profile.id} style={{
                  padding: "1.5rem",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "all 0.2s ease"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#0f172a" }}>
                      {profile.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                      Citizenship No: {profile.citNo || "N/A"}
                    </p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                      Saved: {profile.timestamp}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleEdit(profile)}
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center", display: "flex", gap: "8px", alignItems: "center" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit & Export
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
