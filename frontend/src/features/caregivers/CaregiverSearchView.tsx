"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { CaregiverProfile } from '../../types';
import { CaregiverDetailModal } from '../../components/caregivers/CaregiverDetailModal';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const CaregiverSearchView: React.FC = () => {
  const {
    caregivers,
    setTargetCaregiverForBooking,
    setIsQuickBookingModalOpen,
    setActiveView,
  } = useCareNest();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [minExp, setMinExp] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(true);
  const [modalCaregiver, setModalCaregiver] = useState<CaregiverProfile | null>(null);

  const filteredCaregivers = caregivers.filter((cg) => {
    // Search text in name, bio, skills
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = cg.fullName.toLowerCase().includes(q);
      const matchBio = cg.bio.toLowerCase().includes(q);
      const matchSkills = cg.skills.some((s) => s.toLowerCase().includes(q));
      const matchSpecialization = cg.specializations.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchSkills && !matchSpecialization) return false;
    }

    // Verified only filter
    if (onlyVerified && cg.verificationStatus !== 'VERIFIED') return false;

    // Area
    if (selectedArea !== 'ALL') {
      const matchArea = cg.serviceAreas.some((a) => a.toLowerCase().includes(selectedArea.toLowerCase()));
      if (!matchArea) return false;
    }

    // Gender
    if (selectedGender !== 'ALL' && cg.gender !== selectedGender) return false;

    // Availability
    if (selectedAvailability !== 'ALL' && cg.availability !== selectedAvailability) return false;

    // Experience
    if (cg.experienceYears < minExp) return false;

    return true;
  });

  const handleBookClick = (cg: CaregiverProfile) => {
    setTargetCaregiverForBooking(cg);
    setIsQuickBookingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-warmOrange-100 text-warmOrange-900 px-2.5 py-0.5 rounded-full">
              Trust & Safety Guaranteed
            </span>
            <span className="text-xs text-stone-500 font-medium">100% Background Checked</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Find Verified In-Home Caregivers
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse registered General Duty Assistants (GDA), geriatric nurses, and companion caregivers in Bengaluru.
          </p>
        </div>

        <button
          onClick={() => setActiveView('TRUST_SAFETY')}
          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center gap-1.5"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>Why Verified Caregivers?</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-soft-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, condition (diabetes, stroke, dementia, physiotherapy), or skill..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 bg-stone-50/50"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Area */}
          <div>
            <label className="font-bold text-stone-600 block mb-1">Service Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
            >
              <option value="ALL">All Areas (Bengaluru)</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Whitefield">Whitefield</option>
              <option value="Bellandur">Bellandur</option>
              <option value="Jayanagar">Jayanagar</option>
              <option value="Malleshwaram">Malleshwaram</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="font-bold text-stone-600 block mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
            >
              <option value="ALL">Any Schedule</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Night Shift">Night Shift</option>
              <option value="On-demand">On-demand</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="font-bold text-stone-600 block mb-1">Gender Preference</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
            >
              <option value="ALL">No Preference</option>
              <option value="Female">Female Caregiver</option>
              <option value="Male">Male Caregiver</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="font-bold text-stone-600 block mb-1">Min. Experience</label>
            <select
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
            >
              <option value={0}>Any Experience</option>
              <option value={3}>3+ Years</option>
              <option value={5}>5+ Years</option>
              <option value={7}>7+ Years</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`w-full p-2.5 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                onlyVerified
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm'
                  : 'bg-stone-50 text-stone-600 border-stone-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Only: {onlyVerified ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
          <span>Showing {filteredCaregivers.length} Verified Caregivers</span>
          <span>Hourly rates include platform insurance & GPS tracking</span>
        </div>

        {filteredCaregivers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-soft-sm space-y-3">
            <AlertCircle className="h-12 w-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-900">No caregivers found in your selected area</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing the area filter, or switching to another schedule.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('ALL');
                setSelectedGender('ALL');
                setSelectedAvailability('ALL');
                setMinExp(0);
                setOnlyVerified(false);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaregivers.map((cg) => {
              const isVerified = cg.verificationStatus === 'VERIFIED';
              return (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl border border-stone-200 hover:border-burgundy-200 shadow-soft-sm hover:shadow-soft-lg transition p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={cg.avatarUrl}
                        alt={cg.fullName}
                        className="h-16 w-16 rounded-2xl object-cover border border-stone-200 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-black text-stone-900 truncate">{cg.fullName}</h3>
                          {isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {cg.experienceYears} yrs experience • {cg.city}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{cg.rating}</span>
                          <span className="text-stone-400 font-normal">({cg.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {cg.bio}
                    </p>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {cg.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-orange-50 text-warmOrange-900 border border-orange-100 px-2 py-0.5 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Starting at</span>
                      <span className="text-lg font-black text-indigo-700">₹{cg.hourlyRate}</span>
                      <span className="text-[10px] text-slate-500 font-medium"> / hour</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalCaregiver(cg)}
                        className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition shadow-sm"
                      >
                        Profile
                      </button>

                      {isVerified ? (
                        <button
                          onClick={() => handleBookClick(cg)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition transform active:scale-95"
                        >
                          Book Visit
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
                        >
                          Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <CaregiverDetailModal
        caregiver={modalCaregiver}
        onClose={() => setModalCaregiver(null)}
      />
    </div>
  );
};
