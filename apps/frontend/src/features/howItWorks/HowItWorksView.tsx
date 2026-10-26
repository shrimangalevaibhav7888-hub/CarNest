"use client";

import React from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  User,
  ShieldCheck,
  Calendar,
  CheckSquare,
  Activity,
  Heart,
  ArrowRight,
  Sparkles,
  Phone,
  Pill,
} from 'lucide-react';

export const HowItWorksView: React.FC = () => {
  const { setActiveView, loginAsRole } = useCareNest();

  const steps = [
    {
      number: '01',
      title: 'Create Elderly Profile',
      desc: 'Fill in basic details for your loved one: age, medical history, allergies, regular prescriptions, primary doctor contact, and emergency phone numbers.',
      icon: User,
      color: 'bg-burgundy-100 text-burgundy-800',
    },
    {
      number: '02',
      title: 'Choose Care Requirements',
      desc: 'Select the needed support: medication administration, vitals check, mobility & physiotherapy support, post-op care, dementia routine, or companionship.',
      icon: Heart,
      color: 'bg-orange-100 text-warmOrange-800',
    },
    {
      number: '03',
      title: 'Find Verified Caregiver',
      desc: 'Browse background-verified General Duty Assistants (GDA) and nurses in your local neighborhood. Filter by experience, hourly rates, and family reviews.',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-softGreen-800',
    },
    {
      number: '04',
      title: 'Schedule In-Home Visit',
      desc: 'Pick your preferred date, morning/afternoon slot, or 12-hour night shift. Confirm booking with our transparent subscription model.',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      number: '05',
      title: 'Track Daily Care Live',
      desc: 'The caregiver arrives, marks attendance, checks blood pressure & blood sugar, administers medicines, and updates the real-time checklist.',
      icon: CheckSquare,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      number: '06',
      title: 'Family Receives Instant Updates',
      desc: 'Stay informed wherever you are. Receive push notifications for taken meds, vitals charts, and caregiver visit summary notes with complete peace of mind.',
      icon: Activity,
      color: 'bg-indigo-100 text-indigo-800',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-wider bg-burgundy-100 text-burgundy-900 px-3 py-1 rounded-full">
          Simple & Transparent
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
          How CareNest Works
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          From finding a trusted caregiver to tracking daily vitals, CareNest is designed for maximum simplicity for seniors and total clarity for families.
        </p>
      </div>

      {/* 6 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-4 flex flex-col justify-between hover:shadow-soft-lg transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold ${s.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black text-stone-300 font-display">{s.number}</span>
                </div>

                <h3 className="text-lg font-black text-stone-900 font-display">{s.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center text-[11px] font-bold text-burgundy-900">
                <span>Step {s.number} of 06</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-burgundy-900 to-warmOrange-800 text-white text-center space-y-4 shadow-xl">
        <h2 className="text-2xl font-black font-display">Ready to Coordinate Trusted Home Care?</h2>
        <p className="text-xs text-stone-200 max-w-md mx-auto">
          Start in 2 minutes. Search verified caregivers near you or view our family dashboard demo.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveView('CAREGIVER_SEARCH')}
            className="px-6 py-3 bg-white hover:bg-stone-100 text-burgundy-950 font-bold text-xs rounded-xl shadow-md transition"
          >
            Find Caregivers Nearby
          </button>
          <button
            onClick={() => loginAsRole('FAMILY')}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30 transition"
          >
            Explore Demo Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
