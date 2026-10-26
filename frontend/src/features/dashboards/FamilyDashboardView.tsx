"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  Heart,
  Pill,
  Users,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Activity,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Eye,
  CreditCard,
  ChevronRight,
  Info,
  UserCheck,
  Loader2,
} from 'lucide-react';

export const FamilyDashboardView: React.FC = () => {
  const {
    currentUser,
    isDemoMode,
    selectedElderly,
    setSelectedElderly,
    elderlyProfiles,
    medicines,
    medicineLogs,
    bookings,
    dailyCareLog,
    careUpdates,
    appointments,
    emergencyAlerts,
    subscription,
    setActiveView,
    setIsQuickBookingModalOpen,
    toggleElderlyLocationSharing,
    triggerSosAlert,
    addToast,
    linkFamilyMember,
  } = useCareNest();

  const [linkEmail, setLinkEmail] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleLinkSenior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim()) {
      addToast('Email Required', 'Please enter your senior relative\'s registered email.', 'warning');
      return;
    }
    setIsLinking(true);
    const success = await linkFamilyMember(linkEmail.trim());
    setIsLinking(false);
    if (success) {
      setLinkEmail('');
      setShowLinkModal(false);
    }
  };

  const elderly = selectedElderly || (elderlyProfiles.length > 0 ? elderlyProfiles[0] : null);

  const todayMeds = elderly ? medicines.filter((m) => m.elderlyId === elderly.id && m.isActive) : [];
  const todayLogs = elderly ? medicineLogs.filter((l) => l.elderlyId === elderly.id) : [];
  const takenCount = todayLogs.filter((l) => l.status === 'TAKEN').length;
  const missedCount = todayLogs.filter((l) => l.status === 'MISSED').length;

  const currentVisit = elderly
    ? bookings.find(
        (b) => b.elderlyId === elderly.id && (b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED')
      )
    : null;

  const elderlyCareLog = dailyCareLog || {
    items: [],
    generalNote: 'Daily care record initialized.',
  };
  const careCompleted = elderlyCareLog.items.filter((i) => i.completed).length;
  const careTotal = elderlyCareLog.items.length;

  const upcomingApt = appointments.find((a) => a.status === 'UPCOMING');
  const activeEmergency = emergencyAlerts.find((e) => e.status !== 'RESOLVED');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // If no senior is linked yet for a real family account
  if (!elderly && elderlyProfiles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-warmOrange-800 text-white shadow-soft-lg space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-amber-200">
            Family Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display">
            {greeting}, {currentUser?.displayName || 'Family Member'}
          </h1>
          <p className="text-stone-200 text-sm sm:text-base max-w-xl">
            Stay connected with your loved one's daily medications, scheduled nurse visits, care journal, and real-time emergency alerts.
          </p>
        </div>

        {/* Link Senior Card */}
        <div className="p-8 rounded-3xl bg-white border-2 border-stone-200 shadow-soft-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-700">
              <UserCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-stone-900 font-display">
                Connect Your Elderly Family Member
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                To respect medical privacy and secure sensitive health data, family members only view senior records after explicit linking. Enter the registered email address of your parent or relative.
              </p>
            </div>
          </div>

          <form onSubmit={handleLinkSenior} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                Senior's Registered CareNest Email Address
              </label>
              <input
                type="email"
                required
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="e.g. priya.sharma@carenest.ai or patient@carenest.ai"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-burgundy-700 text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLinking}
                className="px-6 py-3 bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>{isLinking ? 'Linking Senior Profile...' : 'Link Senior Profile'}</span>
              </button>
            </div>
          </form>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 space-y-1">
            <p className="font-bold text-stone-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Family Access Control
            </p>
            <p>
              Once linked, your family account can view their daily medicine compliance, upcoming doctor appointments, caregiver visit updates, and receive instant 1-touch SOS alerts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Header with Linked Senior Selector & Quick Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <img
            src={elderly?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
            alt={elderly?.fullName || 'Senior'}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-stone-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full">
                Monitoring Senior Profile
              </span>
              {elderly?.age && (
                <span className="text-xs text-stone-500 font-medium">Age {elderly.age} • {elderly.city || 'Home'}</span>
              )}
            </div>

            {/* If multiple seniors are connected, show selector */}
            {elderlyProfiles.length > 1 ? (
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={elderly?.id}
                  onChange={(e) => {
                    const found = elderlyProfiles.find((p) => p.id === e.target.value);
                    if (found) setSelectedElderly(found);
                  }}
                  className="text-xl sm:text-2xl font-black text-stone-900 font-display bg-stone-50 border border-stone-300 rounded-xl px-2 py-1 focus:outline-none"
                >
                  {elderlyProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
                {elderly?.fullName}
              </h1>
            )}

            <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">
              {elderly?.medicalNotes || 'Health profile and medical records active.'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowLinkModal(!showLinkModal)}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center gap-1.5"
            title="Link another elderly family member"
          >
            <UserCheck className="h-4 w-4 text-indigo-600" />
            <span>+ Link Senior</span>
          </button>

          <button
            onClick={() => setIsQuickBookingModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-burgundy-800 to-warmOrange-600 hover:from-burgundy-900 hover:to-warmOrange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Book Caregiver Visit</span>
          </button>

          <button
            onClick={() => setActiveView('MEDICINES')}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center gap-1.5"
          >
            <Pill className="h-4 w-4 text-warmOrange-600" />
            <span>Manage Meds</span>
          </button>

          <button
            onClick={() => setActiveView('LOCATION')}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center gap-1.5"
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>GPS Tracking</span>
          </button>
        </div>
      </div>

      {/* Inline Link Modal / Collapsible */}
      {showLinkModal && (
        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-700" />
              Link Another Elderly Family Member
            </h3>
            <button
              onClick={() => setShowLinkModal(false)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              ✕ Close
            </button>
          </div>
          <form onSubmit={handleLinkSenior} className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              type="email"
              required
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="Enter senior's registered email"
              className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={isLinking}
              className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              {isLinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>Link</span>
            </button>
          </form>
        </div>
      )}

      {/* 2. Active Emergency Alert Banner (If Any) */}
      {activeEmergency && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-sos">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  Emergency Alert Active
                </span>
                <span className="text-xs text-slate-300">{activeEmergency.triggeredAt}</span>
              </div>
              <p className="text-sm font-bold mt-0.5">
                SOS dispatched for {activeEmergency.elderlyName}. Location: {activeEmergency.elderlyAddress}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('EMERGENCY')}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow-md transition"
          >
            View Live SOS Status →
          </button>
        </div>
      )}

      {/* 3. The 5 Core Family Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Today's Care */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <span>Today's Care</span>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                {careCompleted}/{careTotal > 0 ? careTotal : 0} Completed
              </span>
            </div>

            {/* Checklist Preview */}
            <div className="space-y-2 pt-1">
              {elderlyCareLog.items.length > 0 ? (
                elderlyCareLog.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.completed ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                      <span className={`truncate ${item.completed ? 'text-stone-800 font-medium' : 'text-stone-500'}`}>
                        {item.title}
                      </span>
                    </div>
                    {item.completed ? (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Done {item.timeCompleted || ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Pending</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                  No care tasks scheduled for today.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveView('DAILY_CARE')}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span>View Full Care Checklist</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 2: Medication Status */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-xl bg-orange-50 text-warmOrange-700">
                  <Pill className="h-5 w-5" />
                </div>
                <span>Medication Status</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {takenCount} Taken Today
              </span>
            </div>

            {/* Meds Preview */}
            <div className="space-y-2 pt-1">
              {todayMeds.length > 0 ? (
                todayMeds.slice(0, 3).map((med) => {
                  const log = todayLogs.find((l) => l.medicineId === med.id);
                  const isTaken = log?.status === 'TAKEN';
                  return (
                    <div
                      key={med.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 truncate">{med.name}</p>
                        <p className="text-[11px] text-stone-500">{med.dosage} • {med.times?.[0] || 'Scheduled'}</p>
                      </div>
                      {isTaken ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle className="h-3 w-3" /> Taken
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                          Scheduled
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                  No active medicines recorded for this profile.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveView('MEDICINES')}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span>Open Medicine Schedule & Alerts</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 3: Caregiver Visit */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-xl bg-emerald-50 text-softGreen-800">
                  <Users className="h-5 w-5" />
                </div>
                <span>Caregiver Visit</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {currentVisit?.status === 'IN_PROGRESS' ? 'Active Now' : currentVisit ? 'Confirmed' : 'None Booked'}
              </span>
            </div>

            {currentVisit ? (
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={currentVisit.caregiverAvatar || 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200'}
                    alt={currentVisit.caregiverName}
                    className="h-10 w-10 rounded-xl object-cover border border-emerald-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{currentVisit.caregiverName}</p>
                    <p className="text-[11px] text-emerald-800">{currentVisit.serviceType}</p>
                  </div>
                </div>
                <div className="text-[11px] text-stone-600 pt-1 border-t border-emerald-100 flex items-center justify-between">
                  <span>Slot: <strong>{currentVisit.timeSlot}</strong></span>
                  {currentVisit.caregiverPhone && (
                    <a href={`tel:${currentVisit.caregiverPhone}`} className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Call
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                No active visits today.
              </div>
            )}
          </div>

          <button
            onClick={() => setIsQuickBookingModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span>Book Home Nursing Visit</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 4: Recent Updates & Timeline */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Activity className="h-5 w-5" />
                </div>
                <span>Recent Updates</span>
              </div>
              <span className="text-xs text-stone-500">Live Stream</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {careUpdates.length > 0 ? (
                careUpdates.slice(0, 2).map((up) => (
                  <div key={up.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 truncate">{up.title}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">{up.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2">{up.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                  No care notes posted yet.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveView('FAMILY_UPDATES')}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span>Open Full Health Timeline</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 5: Emergency Status & Contact Directory */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <span>Emergency Status</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                ● Normal / Standby
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Contact:</span>
                <span className="font-bold text-slate-800">{elderly?.emergencyContactName || 'Family Member'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="font-bold text-slate-800">{elderly?.emergencyContactPhone || '112'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{elderly?.address || 'Metro City'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('EMERGENCY')}
            className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span>Emergency Hub & Protocols</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bonus Card 6: Upcoming Doctor Appointment */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Calendar className="h-5 w-5" />
                </div>
                <span>Upcoming Appointment</span>
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                {upcomingApt ? 'Scheduled' : 'None'}
              </span>
            </div>

            {upcomingApt ? (
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1 text-xs">
                <p className="font-bold text-purple-950">{upcomingApt.doctorName}</p>
                <p className="text-[11px] text-purple-800">{upcomingApt.hospitalName} • {upcomingApt.specialty}</p>
                <p className="text-[11px] text-stone-600 pt-1">
                  📅 {upcomingApt.date} at <strong>{upcomingApt.time}</strong>
                </p>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                No doctor visits scheduled.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveView('APPOINTMENTS')}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span>Manage Doctor Appointments</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
