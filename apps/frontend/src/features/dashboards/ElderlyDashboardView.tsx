"use client";

import React from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  Heart,
  Pill,
  Users,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Activity,
  Clock,
  CheckCircle,
  Phone,
  Volume2,
  Eye,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const ElderlyDashboardView: React.FC = () => {
  const {
    currentUser,
    isDemoMode,
    selectedElderly,
    medicines,
    medicineLogs,
    bookings,
    dailyCareLog,
    appointments,
    takeMedicine,
    snoozeMedicine,
    skipMedicine,
    triggerSosAlert,
    setActiveView,
    seniorMode,
    toggleSeniorMode,
    addToast,
  } = useCareNest();

  const elderly = selectedElderly || {
    fullName: currentUser?.displayName || (isDemoMode ? 'Ramesh Chandra' : 'Valued Senior'),
    age: 74,
    emergencyContactName: 'Family Member',
    emergencyContactPhone: '+91 98111 22334',
    address: 'Indiranagar, Bangalore',
  };

  const displayName = currentUser?.displayName || elderly.fullName || (isDemoMode ? 'Ramesh Chandra' : 'Senior');

  // Next upcoming or pending medicine
  const todayMeds = medicines.filter((m) => m.isActive);
  const pendingMed = todayMeds.length > 0 ? todayMeds[0] : null;

  // Today's visit
  const activeVisit = bookings.find(
    (b) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED'
  );

  // Daily care completed count
  const hasCareItems = dailyCareLog && dailyCareLog.items.length > 0;
  const completedCareCount = hasCareItems ? dailyCareLog.items.filter((i) => i.completed).length : 0;
  const totalCareCount = hasCareItems ? dailyCareLog.items.length : 0;
  const carePercent = totalCareCount > 0 ? Math.round((completedCareCount / totalCareCount) * 100) : 0;

  // Time based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const readAloudSummary = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const medSnippet = pendingMed
        ? `Your next medicine is ${pendingMed.name}, ${pendingMed.dosage}.`
        : 'You have no medicines scheduled at this moment.';
      const visitSnippet = activeVisit
        ? `Your caregiver ${activeVisit.caregiverName} is arriving today.`
        : 'You have no caregiver visits booked today.';
      const careSnippet = totalCareCount > 0
        ? `You have completed ${completedCareCount} of ${totalCareCount} daily care tasks.`
        : 'Your daily care checklist is ready.';

      const text = `${greeting}, ${displayName}. ${medSnippet} ${visitSnippet} ${careSnippet} Emergency help is always one touch away.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      addToast('Voice Assist Speaking', 'Reading your daily care overview aloud.', 'info');
    } else {
      addToast('Voice Assist', 'Speech synthesis is not supported on this browser.', 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Senior Friendly Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-warmOrange-800 text-white shadow-soft-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full text-amber-200">
              👴 Elderly Care Portal
            </span>
            <span className="text-xs text-stone-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display">
            {greeting}, <span className="text-amber-300">{displayName}</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-200 max-w-xl">
            Everything is set for your health and comfort today. Your family and caregivers are connected with you.
          </p>
        </div>

        {/* Audio / Senior Mode Controls */}
        <div className="flex sm:flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={readAloudSummary}
            className="flex-1 sm:flex-initial px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/30 shadow-sm transition"
            title="Read today's schedule aloud"
          >
            <Volume2 className="h-5 w-5 text-amber-300 animate-pulse" />
            <span>Read Aloud</span>
          </button>

          <button
            onClick={toggleSeniorMode}
            className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              seniorMode
                ? 'bg-amber-400 text-burgundy-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Eye className="h-5 w-5" />
            <span>{seniorMode ? 'Senior Font: ON' : 'Senior Font'}</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Overview Grid (Medicines, Visit, Daily Care, SOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Medicine Card or Helpful Empty State */}
        {pendingMed ? (
          <div className="p-6 rounded-3xl bg-white border-2 border-orange-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-warmOrange-800 font-bold text-sm">
                <Pill className="h-5 w-5 text-warmOrange-600" />
                <span>Next Medicine Scheduled</span>
              </div>
              <span className="text-xs font-bold text-warmOrange-700 bg-orange-100 px-3 py-1 rounded-full">
                {pendingMed.times?.[0] || '08:00 AM'}
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">{pendingMed.name}</h3>
              <p className="text-sm font-semibold text-stone-600 mt-1">
                Dosage: <span className="text-burgundy-900 font-bold">{pendingMed.dosage}</span>
              </p>
              {pendingMed.instructions && (
                <p className="text-xs text-stone-500 mt-1 italic">"{pendingMed.instructions}"</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => takeMedicine(pendingMed.id, 'Self-taken with water')}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Taken</span>
              </button>
              <button
                onClick={() => snoozeMedicine(pendingMed.id, 15)}
                className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm rounded-2xl border border-stone-300 transition"
              >
                <Clock className="h-4 w-4 inline mr-1" />
                Snooze
              </button>
              <button
                onClick={() => skipMedicine(pendingMed.id, 'Elderly skipped dose')}
                className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs rounded-2xl border border-stone-200 transition"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border-2 border-stone-200 shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-warmOrange-800 font-bold text-sm">
                <Pill className="h-5 w-5 text-warmOrange-600" />
                <span>No Medicines Scheduled</span>
              </div>
              <h3 className="text-xl font-black text-stone-900">Your Pill Box is Clear</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                You haven't scheduled any prescriptions yet. Add your medications to receive reminders and let family members track daily doses.
              </p>
            </div>
            <button
              onClick={() => setActiveView('MEDICINES')}
              className="w-full py-3 bg-gradient-to-r from-warmOrange-600 to-amber-600 hover:from-warmOrange-700 hover:to-amber-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <Pill className="h-4 w-4" />
              <span>+ Add My First Medicine</span>
            </button>
          </div>
        )}

        {/* Caregiver Visit Status or Empty State */}
        {activeVisit ? (
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-softGreen-800 font-bold text-sm">
                <Users className="h-5 w-5 text-softGreen-700" />
                <span>Today's Caregiver Visit</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                {activeVisit.status === 'IN_PROGRESS' ? '● In Progress' : 'Scheduled'}
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">{activeVisit.caregiverName}</h3>
              <p className="text-sm text-stone-600 mt-1">
                Time Slot: <strong className="text-stone-900">{activeVisit.timeSlot}</strong>
              </p>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                ✓ Verified Nurse • Vitals, Meds & Mobility Support
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {activeVisit.caregiverPhone && (
                <a
                  href={`tel:${activeVisit.caregiverPhone}`}
                  className="flex-1 py-3 bg-softGreen-700 hover:bg-softGreen-800 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Caregiver</span>
                </a>
              )}
              <button
                onClick={() => setActiveView('DAILY_CARE')}
                className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-200 transition"
              >
                View Tasks
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border-2 border-stone-200 shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-softGreen-800 font-bold text-sm">
                <Users className="h-5 w-5 text-softGreen-700" />
                <span>Today's Caregiver Visit</span>
              </div>
              <h3 className="text-xl font-black text-stone-900">No Visits Scheduled Today</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Need certified GDA nursing care, mobility assistance, or vital monitoring at home? Professional caregivers are available.
              </p>
            </div>
            <button
              onClick={() => setActiveView('CAREGIVER_SEARCH')}
              className="w-full py-3 bg-softGreen-700 hover:bg-softGreen-800 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Find a Verified Nurse</span>
            </button>
          </div>
        )}

        {/* Daily Care Progress */}
        <div className="p-6 rounded-3xl bg-white border-2 border-blue-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              Today's Care Progress
            </span>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
              {completedCareCount} of {totalCareCount} Done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden border border-stone-200">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${carePercent}%` }}
            />
          </div>

          <p className="text-xs text-stone-600">
            {totalCareCount > 0
              ? 'Morning routine, vitals monitoring, and meals logged!'
              : 'Your daily care routine checklist is ready to be started.'}
          </p>

          <button
            onClick={() => setActiveView('DAILY_CARE')}
            className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition text-center block"
          >
            {totalCareCount > 0
              ? `Open Full Checklist (${totalCareCount - completedCareCount} remaining) →`
              : 'Open Care Routine Checklist →'}
          </button>
        </div>

        {/* Emergency SOS Big Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl space-y-3 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              1-Touch Emergency Alert
            </span>
            <span className="text-xs text-slate-300">National: 112</span>
          </div>

          <div>
            <h3 className="text-2xl font-black font-display text-white">Need Immediate Help?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Pressing this alerts {elderly.emergencyContactName || 'your family members'} and emergency responders instantly with your GPS location.
            </p>
          </div>

          <button
            onClick={() => triggerSosAlert()}
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="h-6 w-6 text-slate-950" />
            <span>PRESS FOR EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* 3. 6 Large High-Contrast Navigation Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 font-display">
            Quick Actions & Daily Tools
          </h2>
          <span className="text-xs text-stone-500">Tap any card to view details</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. My Medicines */}
          <button
            onClick={() => setActiveView('MEDICINES')}
            className="p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-warmOrange-500 hover:shadow-soft-lg text-left transition transform active:scale-95 group space-y-3 min-h-[140px]"
          >
            <div className="h-14 w-14 rounded-2xl bg-orange-100 text-warmOrange-700 group-hover:bg-warmOrange-600 group-hover:text-white transition flex items-center justify-center font-bold">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 group-hover:text-warmOrange-700 transition">
                1. My Medicines
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Morning & evening pill reminders</p>
            </div>
          </button>

          {/* 2. My Caregiver */}
          <button
            onClick={() => setActiveView('CAREGIVER_SEARCH')}
            className="p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-emerald-500 hover:shadow-soft-lg text-left transition transform active:scale-95 group space-y-3 min-h-[140px]"
          >
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-softGreen-800 group-hover:bg-emerald-700 group-hover:text-white transition flex items-center justify-center font-bold">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 group-hover:text-emerald-700 transition">
                2. My Caregiver
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeVisit ? activeVisit.caregiverName : 'Find & book verified nurses'}
              </p>
            </div>
          </button>

          {/* 3. Today's Care */}
          <button
            onClick={() => setActiveView('DAILY_CARE')}
            className="p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-blue-500 hover:shadow-soft-lg text-left transition transform active:scale-95 group space-y-3 min-h-[140px]"
          >
            <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center font-bold">
              <CheckSquare className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 group-hover:text-blue-700 transition">
                3. Today's Care
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Meals, walks & vitals checklist</p>
            </div>
          </button>

          {/* 4. Appointments */}
          <button
            onClick={() => setActiveView('APPOINTMENTS')}
            className="p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-purple-500 hover:shadow-soft-lg text-left transition transform active:scale-95 group space-y-3 min-h-[140px]"
          >
            <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition flex items-center justify-center font-bold">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 group-hover:text-purple-700 transition">
                4. Appointments
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Doctor consults & clinic visits</p>
            </div>
          </button>

          {/* 5. Emergency SOS */}
          <button
            onClick={() => triggerSosAlert()}
            className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 hover:border-amber-500 hover:shadow-soft-lg text-left transition transform active:scale-95 group space-y-3 min-h-[140px]"
          >
            <div className="h-14 w-14 rounded-2xl bg-amber-400 text-slate-950 group-hover:bg-amber-500 transition flex items-center justify-center font-bold shadow-md">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-amber-800 transition">
                5. Emergency SOS
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 font-semibold">Immediate family broadcast</p>
            </div>
          </button>

          {/* 6. Family Updates */}
          <button
            onClick={() => setActiveView('FAMILY_UPDATES')}
            className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-indigo-500 hover:shadow-soft-lg text-left transition transform active:scale-95 group space-y-3 min-h-[140px]"
          >
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition flex items-center justify-center font-bold">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-indigo-800 transition">
                6. Family Updates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Stay connected with loved ones</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
