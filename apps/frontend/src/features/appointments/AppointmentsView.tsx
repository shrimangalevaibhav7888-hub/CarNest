"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plus,
  Trash2,
  CheckCircle,
  Bell,
  User,
  Building,
  HeartHandshake,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    selectedElderly,
    createNewAppointment,
    removeAppointment,
    addToast,
  } = useCareNest();

  const elderly = selectedElderly || { fullName: 'Ramesh Chandra', id: 'eld-1' };
  const elderlyApts = appointments.filter((a) => a.elderlyId === elderly.id);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology & Geriatrics');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00 AM');
  const [purpose, setPurpose] = useState('');
  const [location, setLocation] = useState('Apollo Hospital, Indiranagar, Bengaluru');
  const [notes, setNotes] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('+91 98440 99887');
  const [accompanied, setAccompanied] = useState(true);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !hospitalName) {
      addToast('Missing Details', 'Doctor and hospital name are required', 'warning');
      return;
    }

    createNewAppointment({
      elderlyId: elderly.id,
      elderlyName: elderly.fullName,
      doctorName,
      hospitalName,
      specialty,
      date,
      time,
      purpose: purpose || 'Routine Follow-up',
      location,
      notes,
      doctorPhone,
      status: 'UPCOMING',
      reminderSent: true,
      accompaniedByCaregiver: accompanied,
      caregiverName: accompanied ? 'Sister Ananya Roy' : undefined,
    });

    // Reset Form
    setDoctorName('');
    setHospitalName('');
    setPurpose('');
    setNotes('');
    setIsAddOpen(false);
  };

  const upcomingApts = elderlyApts.filter((a) => a.status === 'UPCOMING');
  const pastApts = elderlyApts.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              Clinical Consultations
            </span>
            <span className="text-xs text-stone-500 font-medium">For {elderly.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Doctor & Hospital Appointments
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Schedule specialist checkups, set automated reminders, and assign caregiver accompaniment.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition transform active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Appointment</span>
        </button>
      </div>

      {/* 1. Upcoming Appointments */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-stone-900 font-display">
          Upcoming Scheduled Appointments ({upcomingApts.length})
        </h2>

        {upcomingApts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-xs text-stone-400">
            No upcoming doctor appointments scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingApts.map((apt) => (
              <div
                key={apt.id}
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                        {apt.specialty}
                      </span>
                      <h3 className="text-lg font-black text-stone-900 mt-1">{apt.doctorName}</h3>
                      <p className="text-xs font-semibold text-stone-600">{apt.hospitalName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-900 block">{apt.date}</span>
                      <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                        {apt.time}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs space-y-1.5">
                    <p className="text-stone-700 font-semibold">Purpose: {apt.purpose}</p>
                    <div className="flex items-start gap-1.5 text-stone-500">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{apt.location}</span>
                    </div>
                    {apt.notes && (
                      <p className="text-[11px] text-stone-400 italic">Note: {apt.notes}</p>
                    )}
                  </div>

                  {apt.accompaniedByCaregiver && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
                      <HeartHandshake className="h-4 w-4 text-emerald-600" />
                      <span>Accompanied by Caregiver: {apt.caregiverName || 'Sister Ananya'}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  {apt.doctorPhone && (
                    <a
                      href={`tel:${apt.doctorPhone}`}
                      className="text-burgundy-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Clinic
                    </a>
                  )}

                  <button
                    onClick={() => removeAppointment(apt.id)}
                    className="p-1.5 text-stone-400 hover:text-slate-800 rounded-lg transition"
                    title="Cancel Appointment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-burgundy-900 font-bold">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-black font-display">Schedule Doctor Appointment</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Srinivas Murthy"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Hospital / Clinic *</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Apollo Hospital"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Time *</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Cardiology"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Consultation Purpose</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Routine 6-month blood pressure review"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Location Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Apollo Clinic, 100ft Road, Indiranagar"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Preparation Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fasting blood sugar report needed"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition transform active:scale-95"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
