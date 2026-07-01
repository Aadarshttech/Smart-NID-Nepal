/**
 * AppointmentTab — User selects where and when they want
 * to visit for their NID biometric enrollment.
 */

import { useState, useMemo } from "react";
import { useEnrollmentStore } from "../store/enrollmentStore";
import { getDistrictList, getOfficesByDistrict, getAvailableDates } from "../data/daoOffices";
import type { DAOOffice } from "../types/extraction";

export default function AppointmentTab() {
  const { appointmentPreferences, setAppointmentPreferences, nextStep, prevStep } =
    useEnrollmentStore();

  const [selectedDistrict, setSelectedDistrict] = useState(
    appointmentPreferences?.district || ""
  );
  const [selectedOffice, setSelectedOffice] = useState<DAOOffice | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    appointmentPreferences?.selectedDate || ""
  );
  const [selectedSlot, setSelectedSlot] = useState(
    appointmentPreferences?.selectedSlot || ""
  );

  const districts = useMemo(() => getDistrictList(), []);
  const offices = useMemo(
    () => (selectedDistrict ? getOfficesByDistrict(selectedDistrict) : []),
    [selectedDistrict]
  );
  const availableDates = useMemo(
    () => (selectedOffice ? getAvailableDates(selectedOffice) : []),
    [selectedOffice]
  );
  const slotsForDate = useMemo(
    () =>
      selectedOffice
        ? selectedOffice.availableSlots.filter(
            (s) => s.date === selectedDate && s.capacity > 0
          )
        : [],
    [selectedOffice, selectedDate]
  );

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedOffice(null);
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleOfficeSelect = (office: DAOOffice) => {
    setSelectedOffice(office);
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  const handleSlotSelect = (slotTime: string) => {
    setSelectedSlot(slotTime);
  };

  const canProceed =
    selectedDistrict && selectedOffice && selectedDate && selectedSlot;

  const handleNext = () => {
    if (!selectedOffice) return;
    setAppointmentPreferences({
      district: selectedDistrict,
      officeId: selectedOffice.id,
      officeName: selectedOffice.name,
      selectedDate,
      selectedSlot,
    });
    nextStep();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="form-tab-panel fade-in">
      <div className="form-section">
        <h3 className="form-section__title">
          🏛️ भेटघाट छान्नुहोस् / Choose Your Appointment
        </h3>
        <p className="form-section__hint">
          तपाईं कहाँबाट र कहिले आवेदन दिन चाहनुहुन्छ? आफ्नो सुविधा अनुसार
          जिल्ला, कार्यालय, र समय छान्नुहोस्।
        </p>

        {/* Step 1: District */}
        <div className="appointment-step">
          <h4 className="appointment-step__title">
            <span className="appointment-step__num">1</span>
            जिल्ला छान्नुहोस् / Select District
          </h4>
          <select
            className="form-field__input form-field__select appointment-select"
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            <option value="">-- Choose a district --</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.nameNp}) — {d.province}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Office */}
        {selectedDistrict && offices.length > 0 && (
          <div className="appointment-step fade-in">
            <h4 className="appointment-step__title">
              <span className="appointment-step__num">2</span>
              कार्यालय छान्नुहोस् / Select Office
            </h4>
            <div className="office-cards">
              {offices.map((office) => (
                <button
                  key={office.id}
                  className={`office-card ${selectedOffice?.id === office.id ? "office-card--selected" : ""}`}
                  onClick={() => handleOfficeSelect(office)}
                >
                  <div className="office-card__icon">🏛️</div>
                  <div className="office-card__info">
                    <h5 className="office-card__name">{office.name}</h5>
                    <p className="office-card__name-np">{office.nameNp}</p>
                    <p className="office-card__address">📍 {office.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date */}
        {selectedOffice && availableDates.length > 0 && (
          <div className="appointment-step fade-in">
            <h4 className="appointment-step__title">
              <span className="appointment-step__num">3</span>
              मिति छान्नुहोस् / Select Date
            </h4>
            <div className="date-grid">
              {availableDates.map((date) => (
                <button
                  key={date}
                  className={`date-chip ${selectedDate === date ? "date-chip--selected" : ""}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="date-chip__day">{formatDate(date)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Time Slot */}
        {selectedDate && slotsForDate.length > 0 && (
          <div className="appointment-step fade-in">
            <h4 className="appointment-step__title">
              <span className="appointment-step__num">4</span>
              समय छान्नुहोस् / Select Time
            </h4>
            <div className="slot-grid">
              {slotsForDate.map((slot) => (
                <button
                  key={slot.time}
                  className={`slot-card ${selectedSlot === slot.time ? "slot-card--selected" : ""}`}
                  onClick={() => handleSlotSelect(slot.time)}
                >
                  <span className="slot-card__label">{slot.label}</span>
                  <span className="slot-card__time">{slot.time}</span>
                  <span className="slot-card__capacity">
                    {slot.capacity} slots available
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="form-nav">
        <button className="btn btn--outline" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn btn--primary"
          onClick={handleNext}
          disabled={!canProceed}
        >
          Next: Review →
        </button>
      </div>
    </div>
  );
}
