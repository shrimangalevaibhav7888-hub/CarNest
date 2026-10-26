"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  AlertTriangle,
  Phone,
  CheckCircle,
  MapPin,
  Clock,
  Shield,
  Activity,
  User,
  Heart,
  AlertCircle,
  Send,
  Building,
  Ambulance,
} from 'lucide-react';

export const EmergencyHubView: React.FC = () => {
  const {
    emergencyAlerts,
    selectedElderly,
    triggerSosAlert,
    resolveSosAlert,
    setIsSosModalOpen,
    addToast,
  } = useCareNest();

  const elderly = selectedElderly || {
    fullName: 'Ramesh Chandra',
    phone: '+91 98450 12345',
    address: 'Flat 402, Shanti Niketan, Indiranagar, Bengaluru',
    emergencyContactName: 'Vikram Chandra (Son)',
    emergencyContactPhone: '+91 98111 22334',
    doctorName: 'Dr. Srinivas Murthy (Cardiologist)',
    doctorPhone: '+91 98440 99887',
  };

  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const activeAlerts = emergencyAlerts.filter((a) => a.status !== 'RESOLVED');
  const pastAlerts = emergencyAlerts.filter((a) => a.status === 'RESOLVED');

  const handleResolveAlert = (id: string) => {
    resolveSosAlert(id, resolutionNote || 'Caregiver checked on patient. Patient is safe and vitals normal.');
    setSelectedAlertId(null);
    setResolutionNote('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-indigo-100 text-indigo-800 px-3 py-0.5 rounded-full">
              24/7 Rapid Incident Escalation
            </span>
            <span className="text-xs text-slate-500 font-medium">For {elderly.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-0.5">
            Emergency SOS & Incident Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            One-touch multi-channel alert system connecting family, assigned nurses, and local paramedics.
          </p>
        </div>

        <button
          onClick={() => triggerSosAlert()}
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-full shadow-md shadow-amber-500/20 transition transform active:scale-95 flex items-center gap-2 animate-sos"
        >
          <AlertTriangle className="h-5 w-5 text-slate-950" />
          <span>TRIGGER TEST SOS ALERT</span>
        </button>
      </div>

      {/* Mandatory Legal & Paramedic Advisory Box (Section 14) */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-lg border border-slate-800 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-300">
              Important Emergency Protocol Notice
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CareNest is an in-home care platform and is <strong className="text-white">NOT a substitute for emergency government ambulance or hospital trauma services</strong>. For critical life-threatening situations (unconsciousness, heart attack symptoms, major trauma), please dial official emergency numbers <strong className="text-amber-300">112 / 108</strong> immediately.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span>City Emergency Helpline: <strong className="text-white">112 / 108</strong></span>
            <span>•</span>
            <span>Apollo Emergency Desk: <strong className="text-white">1066</strong></span>
          </div>
          <a
            href="tel:112"
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-full text-xs flex items-center gap-1.5 transition"
          >
            <Phone className="h-3.5 w-3.5" /> Direct Dial 112
          </a>
        </div>
      </div>

      {/* 1. Active Emergency Workflow Tracker */}
      {activeAlerts.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-soft-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md animate-bounce">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Live Emergency Incident Active
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Incident for {elderly.fullName}
                </h3>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-300">
              Triggered: {activeAlerts[0].triggeredAt}
            </span>
          </div>

          {/* 4 Statuses (Alert triggered → Family notified → Caregiver contacted → Resolved) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex items-start gap-2 text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">1. Alert Triggered</p>
                <p className="text-[10px] text-slate-400">System broadcasted</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex items-start gap-2 text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">2. Family Notified</p>
                <p className="text-[10px] text-slate-400">SMS & Push sent</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex items-start gap-2 text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">3. Caregiver Alerted</p>
                <p className="text-[10px] text-slate-400">Nurse contacted</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-400/40 flex items-start gap-2 text-xs">
              <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-bold text-white">4. Resolution Pending</p>
                <p className="text-[10px] text-slate-400">Assisting patient</p>
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span><strong>Incident Address:</strong> {elderly.address}</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              GPS Verified
            </span>
          </div>

          {/* Resolution action */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              type="text"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Enter resolution notes (e.g. Patient checked, vitals stable)..."
              className="flex-1 p-2.5 rounded-xl border border-slate-700 text-xs bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleResolveAlert(activeAlerts[0].id)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md transition"
            >
              Mark Incident Resolved ✓
            </button>
          </div>
        </div>
      )}

      {/* 2. Emergency Contacts Directory (1-Click Dial) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-4">
        <h2 className="text-lg font-black text-slate-900 font-display">
          Emergency Response Contacts Directory
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Family */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                👨‍👦
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{elderly.emergencyContactName}</p>
                <p className="text-[11px] text-slate-500">Primary Family Member</p>
              </div>
            </div>
            <a
              href={`tel:${elderly.emergencyContactPhone}`}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="h-3.5 w-3.5" /> Call {elderly.emergencyContactPhone}
            </a>
          </div>

          {/* Doctor */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                👨‍⚕️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{elderly.doctorName}</p>
                <p className="text-[11px] text-slate-500">Attending Physician</p>
              </div>
            </div>
            <a
              href={`tel:${elderly.doctorPhone}`}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="h-3.5 w-3.5" /> Call {elderly.doctorPhone}
            </a>
          </div>

          {/* Ambulance - Non-red sleek emergency card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                🚑
              </div>
              <div>
                <p className="text-xs font-bold text-white">City Emergency Ambulance</p>
                <p className="text-[11px] text-slate-400">Immediate Trauma Dispatch</p>
              </div>
            </div>
            <a
              href="tel:112"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" /> Direct Dial 112 / 108
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
