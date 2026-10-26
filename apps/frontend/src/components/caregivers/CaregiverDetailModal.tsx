"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { CaregiverProfile } from '../../types';
import {
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Award,
  CheckCircle,
  X,
  FileCheck,
  Calendar,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface CaregiverDetailModalProps {
  caregiver: CaregiverProfile | null;
  onClose: () => void;
}

export const CaregiverDetailModal: React.FC<CaregiverDetailModalProps> = ({ caregiver, onClose }) => {
  const { setTargetCaregiverForBooking, setIsQuickBookingModalOpen, reviews } = useCareNest();

  if (!caregiver) return null;

  const cgReviews = reviews.filter((r) => r.caregiverId === caregiver.id);
  const isVerified = caregiver.verificationStatus === 'VERIFIED';

  const handleBookNow = () => {
    setTargetCaregiverForBooking(caregiver);
    setIsQuickBookingModalOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={caregiver.avatarUrl}
              alt={caregiver.fullName}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-md shrink-0"
            />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-display">{caregiver.fullName}</h2>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-950 bg-emerald-300 px-2.5 py-0.5 rounded-full shadow-sm">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-900" />
                    Verified Caregiver
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-300 px-2.5 py-0.5 rounded-full shadow-sm">
                    <Clock className="h-3.5 w-3.5" />
                    Verification: {caregiver.verificationStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-200 mt-1">
                {caregiver.experienceYears} Years Clinical & In-Home Experience • {caregiver.city}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs font-semibold text-amber-200">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                  {caregiver.rating} ({caregiver.reviewCount} Family Reviews)
                </span>
                <span>•</span>
                <span>{caregiver.completedVisitsCount} Completed Home Visits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-6 space-y-6">
          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Professional Biography
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
              {caregiver.bio}
            </p>
          </div>

          {/* Specializations & Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Clinical Skills & Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {caregiver.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 text-warmOrange-900 border border-orange-200"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Document Checkpoints */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Background & Safety Verification Credentials
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold">Admin Approved</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-800">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Government National ID (Aadhaar / Passport)</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-800">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Nursing Degree / GDA Certification Verified</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-800">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Police Clearance & Criminal Background Check</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-800">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Certified Emergency First Aid & CPR Validated</span>
              </div>
            </div>
          </div>

          {/* Family Reviews */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Verified Family Reviews
            </h3>
            {cgReviews.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No public reviews written yet.</p>
            ) : (
              <div className="space-y-2.5">
                {cgReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">{rev.familyName}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-stone-400 block">{rev.date} • {rev.visitServiceType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-500">Standard In-Home Rate:</span>
              <div className="text-2xl font-black text-indigo-700">
                ₹{caregiver.hourlyRate} <span className="text-xs font-normal text-stone-500">/ hour</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-full border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
              >
                Close
              </button>
              {isVerified ? (
                <button
                  onClick={handleBookNow}
                  className="w-1/2 sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition transform active:scale-95"
                >
                  Schedule Home Visit →
                </button>
              ) : (
                <button
                  disabled
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-full bg-stone-300 text-stone-600 font-bold text-xs cursor-not-allowed"
                >
                  Verification Pending
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
