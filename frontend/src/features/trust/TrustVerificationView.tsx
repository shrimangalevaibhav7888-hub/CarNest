"use client";

import React from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  ShieldCheck,
  CheckCircle,
  FileCheck,
  UserCheck,
  Award,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const TrustVerificationView: React.FC = () => {
  const { setActiveView } = useCareNest();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
          CareNest Trust & Safety Standards
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
          Why Verified Caregivers?
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Inviting someone into your home to care for an elderly parent requires absolute trust, professional accountability, and transparency.
        </p>
      </div>

      {/* 5-Point Caregiver Verification Protocol */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-black text-stone-900 font-display">
          Our 5-Step Caregiver Verification Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-burgundy-900 font-bold text-sm">
              <span className="h-7 w-7 rounded-xl bg-burgundy-100 text-burgundy-900 flex items-center justify-center font-black text-xs">
                1
              </span>
              <span>Government Identity Verification</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Biometric Aadhaar and Passport records are cross-checked through national databases to authenticate government identity, age, and verified permanent home address.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-burgundy-900 font-bold text-sm">
              <span className="h-7 w-7 rounded-xl bg-burgundy-100 text-burgundy-900 flex items-center justify-center font-black text-xs">
                2
              </span>
              <span>Nursing Degree & GDA Accreditation</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every nurse’s council registration, General Duty Assistant (GDA) diploma, or clinical care certification is manually reviewed and confirmed with issuing institutions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-burgundy-900 font-bold text-sm">
              <span className="h-7 w-7 rounded-xl bg-burgundy-100 text-burgundy-900 flex items-center justify-center font-black text-xs">
                3
              </span>
              <span>Police Background & Criminal Record Check</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              State Police clearance certificates (PCC) are conducted to ensure zero criminal records, past misconduct, or safety violations before any patient matching.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-burgundy-900 font-bold text-sm">
              <span className="h-7 w-7 rounded-xl bg-burgundy-100 text-burgundy-900 flex items-center justify-center font-black text-xs">
                4
              </span>
              <span>CPR & First Aid Emergency Certification</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Caregivers must possess valid Red Cross or St. John Ambulance Basic Life Support (BLS) and CPR training for elderly choking and vital emergency stabilization.
            </p>
          </div>
        </div>

        {/* Step 5 Banner */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-950">5. In-Person Clinical Interview & Empathy Assessment</h4>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Our clinical supervisors conduct in-person evaluations assessing geriatric bedside manners, patience, emotional empathy, and hygiene standards.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Verification Disclaimer (Section 25) */}
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span>Transparency & Objective Trust Statement</span>
        </div>
        <p className="text-stone-700 leading-relaxed">
          CareNest verification is designed to improve screening transparency, eliminate unauthorized agents, and elevate quality benchmarks. While rigorous multi-step checks are performed, verification is intended to foster confidence and cannot guarantee caregiver outcomes in every clinical situation. Families are always encouraged to review profiles, communicate preferences, and monitor visit logs.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => setActiveView('CAREGIVER_SEARCH')}
          className="px-8 py-4 bg-gradient-to-r from-burgundy-800 to-warmOrange-600 hover:from-burgundy-900 hover:to-warmOrange-700 text-white font-bold text-sm rounded-2xl shadow-lg transition"
        >
          Explore Verified Caregivers Now →
        </button>
      </div>
    </div>
  );
};
