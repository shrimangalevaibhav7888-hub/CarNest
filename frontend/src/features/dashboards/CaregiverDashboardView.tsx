"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  CheckSquare,
  AlertTriangle,
  Phone,
  MapPin,
  FileText,
  Activity,
  Plus,
  Send,
  Star,
  Calendar,
  Heart,
} from 'lucide-react';
import { BookingStatus } from '../../types';

export const CaregiverDashboardView: React.FC = () => {
  const {
    currentUser,
    isDemoMode,
    selectedCaregiver,
    bookings,
    changeBookingStatus,
    dailyCareLog,
    toggleDailyCare,
    postCareUpdate,
    triggerSosAlert,
    addToast,
    setActiveView,
  } = useCareNest();

  const caregiver = selectedCaregiver || {
    id: currentUser?.caregiverId || (currentUser ? `cg-${currentUser.id}` : 'cg-1'),
    fullName: currentUser?.displayName || (isDemoMode ? 'Sister Ananya Roy' : 'Caregiver Nurse'),
    phone: currentUser?.phone || '+91 99887 76655',
    experienceYears: 4,
    skills: ['Medication Administration', 'Vitals & BP Monitoring', 'Post-Op Care'],
    verificationStatus: (currentUser?.verificationStatus || (isDemoMode ? 'VERIFIED' : 'PENDING')) as any,
    rating: 4.9,
    reviewCount: 38,
    completedVisitsCount: 142,
    avatarUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200',
  };

  const displayName = currentUser?.displayName || caregiver.fullName;
  const verificationStatus = currentUser?.verificationStatus || caregiver.verificationStatus;

  // State for adding note / vitals
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [bpValue, setBpValue] = useState('124/82');
  const [pulseValue, setPulseValue] = useState('74');
  const [sugarValue, setSugarValue] = useState('112');
  const [isAddingVitals, setIsAddingVitals] = useState(false);

  // Strict data isolation: filter bookings for this caregiver only (or demo mode default)
  const caregiverBookings = bookings.filter((b) => {
    if (isDemoMode) return true;
    return b.caregiverId === caregiver.id || (currentUser?.caregiverId && b.caregiverId === String(currentUser.caregiverId));
  });

  const todayVisits = caregiverBookings.filter(
    (b) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED' || b.status === 'PENDING'
  );
  const historyVisits = caregiverBookings.filter((b) => b.status === 'COMPLETED');

  const handlePostVitalsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle && !noteDesc) {
      addToast('Please enter a note', 'Title or description is required', 'warning');
      return;
    }
    postCareUpdate(
      noteTitle || 'Daily Care & Vitals Check',
      noteDesc || `Vitals verified normal. BP: ${bpValue} mmHg, Heart Rate: ${pulseValue} bpm, Blood Sugar: ${sugarValue} mg/dL.`,
      'VITALS',
      {
        bloodPressure: `${bpValue} mmHg`,
        heartRate: Number(pulseValue) || 74,
        bloodSugar: `${sugarValue} mg/dL`,
      }
    );
    setNoteTitle('');
    setNoteDesc('');
    setIsAddingVitals(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Verification Status Banner if not verified */}
      {verificationStatus !== 'VERIFIED' && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Application Status: <span className="uppercase text-amber-900 font-extrabold">{verificationStatus}</span>
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                {verificationStatus === 'PENDING'
                  ? 'Your GDA nursing certificates and identity documents are under review by CareNest Operations.'
                  : verificationStatus === 'UNDER_REVIEW'
                  ? 'Operations has requested secondary verification. You will be notified once complete.'
                  : 'Your caregiver profile requires updated documentation. Contact operations@carenest.ai.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-3 py-1 rounded-full shrink-0">
            Pending Admin Approval
          </span>
        </div>
      )}

      {/* 1. Caregiver Header & Verification Badge */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={caregiver.avatarUrl}
            alt={displayName}
            className="h-20 w-20 rounded-2xl object-cover border-2 border-stone-200 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 font-display">{displayName}</h1>
              {verificationStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified GDA Nurse
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  <Clock className="h-3.5 w-3.5" /> {verificationStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {caregiver.experienceYears} Years Experience • ★ {caregiver.rating} ({caregiver.reviewCount} Reviews) • {caregiver.completedVisitsCount} Completed Visits
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {caregiver.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Escalation Button */}
        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => triggerSosAlert(`Home Emergency Escalation logged by Caregiver ${displayName}`)}
            className="w-full md:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow-sm flex items-center justify-center gap-1.5 transition"
          >
            <AlertTriangle className="h-4 w-4 text-slate-950" />
            <span>Report Emergency Escalation</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Assigned Home Visits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-stone-900 font-display">
              Today's Assigned Patient Visits
            </h2>
            <p className="text-xs text-stone-500">Manage visit workflow, start care, and record logs</p>
          </div>
          <span className="text-xs font-bold text-burgundy-900 bg-burgundy-50 px-3 py-1 rounded-full">
            {todayVisits.length} Active / Scheduled
          </span>
        </div>

        {todayVisits.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {todayVisits.map((visit) => (
              <div
                key={visit.id}
                className={`p-6 rounded-3xl border shadow-soft-sm space-y-4 transition ${
                  visit.status === 'IN_PROGRESS'
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-white border-stone-200'
                }`}
              >
                {/* Top Meta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Patient
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          visit.status === 'IN_PROGRESS'
                            ? 'bg-emerald-200 text-emerald-950'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {visit.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-stone-900 mt-0.5">{visit.elderlyName}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-burgundy-900 bg-burgundy-50 px-2.5 py-1 rounded-xl block">
                      {visit.timeSlot}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1 block">Date: {visit.date}</span>
                  </div>
                </div>

                {/* Location & Instructions */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200 text-xs space-y-2">
                  <div className="flex items-start gap-2 text-stone-700">
                    <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{visit.elderlyAddress}</span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-700">
                    <FileText className="h-4 w-4 text-warmOrange-600 shrink-0 mt-0.5" />
                    <span><strong>Care Instructions:</strong> {visit.instructions}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                    <span className="text-stone-500">Family: {visit.familyName}</span>
                    {visit.familyPhone && (
                      <a
                        href={`tel:${visit.familyPhone}`}
                        className="text-burgundy-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" /> Call Family
                      </a>
                    )}
                  </div>
                </div>

                {/* Visit Progression Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {visit.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => changeBookingStatus(visit.id, 'CONFIRMED')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                      >
                        <CheckCircle className="h-4 w-4" /> Accept Visit
                      </button>
                      <button
                        onClick={() => changeBookingStatus(visit.id, 'CANCELLED')}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 transition"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {visit.status === 'CONFIRMED' && (
                    <button
                      onClick={() => changeBookingStatus(visit.id, 'IN_PROGRESS', 'Arrived at patient residence.')}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Play className="h-4 w-4" /> Start Shift & Check In
                    </button>
                  )}

                  {visit.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => setIsAddingVitals(true)}
                        className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-300 transition"
                      >
                        <Activity className="h-4 w-4 text-burgundy-800" /> Log Vitals
                      </button>
                      <button
                        onClick={() => changeBookingStatus(visit.id, 'COMPLETED', 'Daily shift completed successfully.')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <CheckCircle className="h-4 w-4" /> Complete Shift
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No Patient Visits Scheduled Today</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              When clients or family members book your nursing care, their visit appointments, address, and special medical instructions will appear here.
            </p>
          </div>
        )}
      </div>

      {/* 3. Daily Care & Vitals Logger (Modal or Collapsible) */}
      {isAddingVitals && (
        <div className="p-6 rounded-3xl bg-white border-2 border-burgundy-800 shadow-soft-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-burgundy-900 font-bold text-sm">
              <Activity className="h-5 w-5 text-burgundy-700" />
              <span>Record Patient Vitals & Clinical Note</span>
            </div>
            <button
              onClick={() => setIsAddingVitals(false)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handlePostVitalsUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={bpValue}
                  onChange={(e) => setBpValue(e.target.value)}
                  placeholder="120/80"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-burgundy-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600">Pulse (bpm)</label>
                <input
                  type="text"
                  value={pulseValue}
                  onChange={(e) => setPulseValue(e.target.value)}
                  placeholder="72"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-burgundy-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600">Random Blood Sugar (mg/dL)</label>
                <input
                  type="text"
                  value={sugarValue}
                  onChange={(e) => setSugarValue(e.target.value)}
                  placeholder="110"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-burgundy-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600">Clinical Summary Note</label>
              <textarea
                value={noteDesc}
                onChange={(e) => setNoteDesc(e.target.value)}
                placeholder="Observed patient mobility, afternoon lunch intake, and normal temperature..."
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-burgundy-700 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingVitals(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Save Vitals to Daily Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Daily Care Tasks Checklist (If Active) */}
      {dailyCareLog && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <span>Assigned Daily Care Tasks & Mobility Log</span>
            </div>
            <span className="text-xs text-stone-500">Tap to toggle completion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dailyCareLog.items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleDailyCare(item.id)}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition ${
                  item.completed
                    ? 'bg-emerald-50/70 border-emerald-300 text-stone-900'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                      item.completed ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    {item.completed ? '✓' : ''}
                  </span>
                  <div>
                    <p className={`text-xs font-bold truncate ${item.completed ? 'line-through text-stone-500' : ''}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-stone-400">{item.timeTarget || 'Daily Routine'}</p>
                  </div>
                </div>
                {item.completed && (
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Completed
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
