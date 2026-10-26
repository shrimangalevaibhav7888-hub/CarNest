"use client";

import React, { useState } from 'react';
import { useCareNest, AppView, VIEW_TO_HASH } from '../../context/CareNestContext';
import { Heart, ShieldCheck, Phone, Mail, MapPin, AlertCircle, RefreshCw, Lock, X } from 'lucide-react';

export const CareNestFooter: React.FC = () => {
  const { setActiveView, resetDemoData } = useCareNest();
  const [legalModal, setLegalModal] = useState<'TERMS' | 'PRIVACY' | null>(null);

  const createNavProps = (view: AppView) => ({
    href: VIEW_TO_HASH[view] || '#home',
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
        e.preventDefault();
        setActiveView(view);
      }
    },
  });

  return (
    <footer className="bg-charcoal-900 text-stone-300 pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Medical Legal Disclaimer Box */}
        <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Emergency Medical Services Disclaimer</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                CareNest is a digital home-care coordination platform and is <strong className="text-white">NOT</strong> an emergency medical dispatch provider. In case of acute chest pain, stroke, heavy bleeding, or severe unconsciousness, immediately call emergency numbers <strong className="text-white">112 / 108 / 911</strong> or visit your nearest hospital emergency department.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-900/60 border border-indigo-700/60 text-xs font-bold text-white flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              National Helpline: 112
            </span>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-800">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <a {...createNavProps('HOME')} className="flex items-center gap-2.5 no-underline">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
                <Heart className="h-5 w-5 fill-white" />
              </div>
              <span className="text-2xl font-black text-white font-display">CareNest</span>
            </a>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Care at Home. Peace of Mind. We connect elderly patients aged 60+ with verified, background-checked caregivers, helping families track medicines, visits, vitals, and emergency safety.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" /> 100% Background Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-300">
                <Lock className="h-4 w-4" /> AES-256 Encrypted
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Care Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a {...createNavProps('CAREGIVER_SEARCH')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Verified In-Home Caregivers
                </a>
              </li>
              <li>
                <a {...createNavProps('MEDICINES')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Medicine Reminders & Logging
                </a>
              </li>
              <li>
                <a {...createNavProps('DAILY_CARE')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Daily-Care Checklist
                </a>
              </li>
              <li>
                <a {...createNavProps('EMERGENCY')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Emergency SOS Alert System
                </a>
              </li>
              <li>
                <a {...createNavProps('APPOINTMENTS')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Doctor Visit Accompaniment
                </a>
              </li>
              <li>
                <a {...createNavProps('FAMILY_UPDATES')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Family Health Timeline
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: For Stakeholders */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a {...createNavProps('ELDERLY_DASHBOARD')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Elderly Portal (Senior View)
                </a>
              </li>
              <li>
                <a {...createNavProps('FAMILY_DASHBOARD')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Family Member Dashboard
                </a>
              </li>
              <li>
                <a {...createNavProps('CAREGIVER_DASHBOARD')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Caregiver Work Hub
                </a>
              </li>
              <li>
                <a {...createNavProps('ADMIN_DASHBOARD')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Admin Verification Desk
                </a>
              </li>
              <li>
                <a {...createNavProps('SUBSCRIPTION')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Membership Plans (From ₹349/mo)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Trust & Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a {...createNavProps('TRUST_SAFETY')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Why Verified Caregivers?
                </a>
              </li>
              <li>
                <a {...createNavProps('HOW_IT_WORKS')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  How CareNest Works
                </a>
              </li>
              <li>
                <a {...createNavProps('LOCATION')} className="hover:text-white transition no-underline text-stone-400 hover:underline">
                  Location Sharing Privacy
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('TERMS')}
                  className="hover:text-white transition text-stone-400 hover:underline text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('PRIVACY')}
                  className="hover:text-white transition text-stone-400 hover:underline text-left"
                >
                  HIPAA / Patient Privacy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Prototype Reset Tool */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} CareNest Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={resetDemoData}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition underline"
              title="Reset sample data to initial state for testing"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Demo Sandbox
            </button>
            <span>•</span>
            <span className="text-stone-400">Built for Senior Care Dignity & Family Peace</span>
          </div>
        </div>
      </div>

      {/* Legal & Privacy Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold font-display text-slate-900">
                  {legalModal === 'TERMS' ? 'CareNest Terms of Service' : 'Patient Health Data & HIPAA Privacy Policy'}
                </h3>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 text-xs text-slate-600 leading-relaxed pr-2">
              {legalModal === 'TERMS' ? (
                <>
                  <p>
                    <strong>1. Platform Purpose:</strong> CareNest provides matching and scheduling tools connecting certified independent caregivers with families seeking assisted in-home living and routine medical monitoring.
                  </p>
                  <p>
                    <strong>2. Emergency Medical Services:</strong> CareNest does NOT directly operate ambulance dispatch or hospital emergency rooms. In acute medical crises, official helpline 112 / 108 should be dialed immediately.
                  </p>
                  <p>
                    <strong>3. Caregiver Verification:</strong> All registered nurses undergo police background checks and document verification. Families are encouraged to review badges and clinical profiles prior to confirming visits.
                  </p>
                  <p>
                    <strong>4. Cancellation & Refunds:</strong> Home visits may be rescheduled up to 4 hours in advance with zero penalty.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Medical Privacy:</strong> All senior health records, prescription logs, and vitals readings are encrypted with AES-256 and only visible to authorized family members and active attending nurses.
                  </p>
                  <p>
                    <strong>2. Geolocation Control:</strong> GPS tracking is strictly active during confirmed care visit hours and can be toggled off at any time by the senior or primary family contact.
                  </p>
                  <p>
                    <strong>3. No Third-Party Data Selling:</strong> CareNest will never sell or monetize personal senior health data or contact records to commercial pharmaceutical or insurance entities.
                  </p>
                  <p>
                    <strong>4. Compliance:</strong> We adhere to Indian Digital Personal Data Protection (DPDP) Act and international healthcare data storage guidelines.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
