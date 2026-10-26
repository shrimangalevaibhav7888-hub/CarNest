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
  X,
  User,
  Activity,
  HeartHandshake,
  AlertCircle,
  Send,
} from 'lucide-react';

export const EmergencySosModal: React.FC = () => {
  const {
    isSosModalOpen,
    setIsSosModalOpen,
    selectedElderly,
    emergencyAlerts,
    resolveSosAlert,
    addToast,
  } = useCareNest();

  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!isSosModalOpen) return null;

  const currentAlert = emergencyAlerts[0];
  const elderly = selectedElderly || {
    fullName: 'Ramesh Chandra',
    phone: '+91 98450 12345',
    address: 'Flat 402, Shanti Niketan, Indiranagar, Bengaluru',
    emergencyContactName: 'Vikram Chandra (Son)',
    emergencyContactPhone: '+91 98111 22334',
    doctorName: 'Dr. Srinivas Murthy',
    doctorPhone: '+91 98440 99887',
  };

  const handleResolve = () => {
    if (!currentAlert) {
      setIsSosModalOpen(false);
      return;
    }
    resolveSosAlert(currentAlert.id, resolutionNote || 'Caregiver checked in on patient. Patient is safe and stable.');
    setIsResolving(false);
    setResolutionNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header - Sleek High-Contrast Alert Header without aggressive red */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsSosModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg animate-bounce">
              <AlertTriangle className="h-9 w-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Active Emergency Protocol
              </div>
              <h2 className="text-2xl font-black font-display tracking-tight text-white">
                Emergency Alert Triggered
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Patient: <strong className="text-white">{elderly.fullName}</strong> • Dispatched at {currentAlert?.triggeredAt || 'Just now'}
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Reminder */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-amber-900 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Crucial Notice:</strong> If this is a life-threatening medical emergency (cardiac arrest, unconsciousness, severe fall), please dial <strong>112 / 108</strong> immediately.
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Status Tracker Steps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Live Alert Workflow Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">1. Alert Broadcast</p>
                  <p className="text-[11px] text-emerald-800">Triggered to platform network</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">2. Family & Caregiver</p>
                  <p className="text-[11px] text-emerald-800">SMS & Push dispatched</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5 animate-pulse">
                <Activity className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-indigo-950">3. Rapid Assistance</p>
                  <p className="text-[11px] text-indigo-800">Caregiver dispatched / nearby</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Patient Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Incident Location</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                GPS Validated
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-800 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{elderly.address}</span>
            </div>
          </div>

          {/* Instant 1-Click Dial Emergency Contacts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Direct Emergency Contacts (1-Click Call)
            </h3>
            <div className="space-y-2.5">
              {/* Family Contact */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    👨‍👦
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{elderly.emergencyContactName}</p>
                    <p className="text-xs text-slate-500">Primary Family Contact</p>
                  </div>
                </div>
                <a
                  href={`tel:${elderly.emergencyContactPhone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call {elderly.emergencyContactPhone}</span>
                </a>
              </div>

              {/* Assigned Nurse / Caregiver */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    🩺
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sister Ananya Roy (Assigned GDA)</p>
                    <p className="text-xs text-slate-500">Verified Home Nurse</p>
                  </div>
                </div>
                <a
                  href="tel:+919988776655"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call +91 99887 76655</span>
                </a>
              </div>

              {/* Ambulance Helpline */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    🚑
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">City Emergency Ambulance Desk</p>
                    <p className="text-xs text-slate-400">Immediate Paramedic Hotline</p>
                  </div>
                </div>
                <a
                  href="tel:112"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full font-black text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Dial 112 / 108</span>
                </a>
              </div>
            </div>
          </div>

          {/* Incident Resolution Section */}
          <div className="pt-4 border-t border-slate-200">
            {!isResolving ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Are all stakeholders connected and the patient safe?
                </p>
                <button
                  onClick={() => setIsResolving(true)}
                  className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
                >
                  Resolve Alert & Archive
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block">
                  Incident Resolution Summary / Care Notes:
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Caregiver Ananya arrived at home, checked vitals (BP 126/84), patient is resting comfortably."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsResolving(false)}
                    className="px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Confirm Resolution
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
