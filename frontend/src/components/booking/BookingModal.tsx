"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { CaregiverProfile, Booking } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  X,
  User,
  ShieldCheck,
  CreditCard,
  Sparkles,
  MapPin,
  Heart,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    isQuickBookingModalOpen,
    setIsQuickBookingModalOpen,
    targetCaregiverForBooking,
    setTargetCaregiverForBooking,
    caregivers,
    selectedElderly,
    createNewBooking,
    setActiveView,
    addToast,
  } = useCareNest();

  const [selectedCgId, setSelectedCgId] = useState<string>(
    targetCaregiverForBooking?.id || caregivers.find((c) => c.verificationStatus === 'VERIFIED')?.id || 'cg-1'
  );
  const [date, setDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 01:00 PM');
  const [serviceType, setServiceType] = useState<Booking['serviceType']>('Medication & Vitals');
  const [durationHours, setDurationHours] = useState<number>(4);
  const [instructions, setInstructions] = useState<string>(
    'Administer morning medicines, check blood pressure, and assist with 20-min knee physiotherapy.'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isQuickBookingModalOpen) return null;

  const currentCaregiver = caregivers.find((c) => c.id === selectedCgId) || caregivers[0];
  const hourlyRate = currentCaregiver?.hourlyRate || 350;
  const totalCost = hourlyRate * durationHours;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCaregiver.verificationStatus !== 'VERIFIED') {
      addToast('Cannot Book Unverified Caregiver', 'CareNest policy only permits bookings with verified caregivers.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await createNewBooking({
        elderlyId: selectedElderly?.id || 'eld-1',
        elderlyName: selectedElderly?.fullName || 'Ramesh Chandra',
        elderlyAddress: selectedElderly?.address || 'Flat 402, Shanti Niketan, Indiranagar',
        familyId: 'fam-1',
        familyName: 'Vikram Chandra',
        familyPhone: '+91 98111 22334',
        caregiverId: currentCaregiver.id,
        caregiverName: currentCaregiver.fullName,
        caregiverPhone: currentCaregiver.phone,
        caregiverAvatar: currentCaregiver.avatarUrl,
        date,
        timeSlot,
        serviceType,
        durationHours,
        instructions,
        status: 'CONFIRMED',
        totalAmount: totalCost,
        paymentStatus: 'PAID',
      });

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      setIsProcessing(false);
      addToast('Booking Failed', 'Please try again or check connection.', 'error');
    }
  };

  const handleClose = () => {
    setIsQuickBookingModalOpen(false);
    setIsSuccess(false);
    setTargetCaregiverForBooking(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-warmOrange-300">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">Schedule Verified Home Care Visit</h2>
              <p className="text-xs text-stone-300">Fast, trusted booking for your loved one</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="h-10 w-10" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Payment & Visit Confirmed
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-2">
                Home Visit Scheduled!
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
                <strong>{currentCaregiver.fullName}</strong> will arrive on <strong>{date}</strong> ({timeSlot}) for <strong>{selectedElderly?.fullName || 'Ramesh Chandra'}</strong>.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500">Service:</span>
                <span className="font-bold text-stone-800">{serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Patient:</span>
                <span className="font-bold text-stone-800">{selectedElderly?.fullName || 'Ramesh Chandra'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Paid (Razorpay / UPI):</span>
                <span className="font-bold text-emerald-700">₹{totalCost}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleClose();
                  setActiveView('FAMILY_DASHBOARD');
                }}
                className="px-6 py-3 bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Go to Family Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
            {/* Step 1: Caregiver Selector */}
            <div>
              <label className="text-xs font-bold uppercase text-stone-500 block mb-1.5">
                1. Select Verified Caregiver
              </label>
              <select
                value={selectedCgId}
                onChange={(e) => setSelectedCgId(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-burgundy-700 bg-white"
              >
                {caregivers
                  .filter((c) => c.verificationStatus === 'VERIFIED')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} • {c.specializations.join(', ')} (₹{c.hourlyRate}/hr, ★{c.rating})
                    </option>
                  ))}
              </select>
            </div>

            {/* Caregiver preview card */}
            {currentCaregiver && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <img
                  src={currentCaregiver.avatarUrl}
                  alt={currentCaregiver.fullName}
                  className="h-12 w-12 rounded-xl object-cover border border-stone-200 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {currentCaregiver.fullName}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {currentCaregiver.experienceYears} yrs exp • {currentCaregiver.city}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-burgundy-900">₹{currentCaregiver.hourlyRate}</span>
                  <span className="text-[10px] text-stone-500 block">/ hour</span>
                </div>
              </div>
            )}

            {/* Step 2: Date, Slot & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Visit Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white"
                >
                  <option value="08:00 AM - 12:00 PM">08:00 AM - 12:00 PM</option>
                  <option value="09:00 AM - 01:00 PM">09:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 06:00 PM">02:00 PM - 06:00 PM</option>
                  <option value="05:00 PM - 09:00 PM">05:00 PM - 09:00 PM</option>
                  <option value="08:00 PM - 08:00 AM">Night Shift (12 hrs)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Duration</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white"
                >
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours (Standard)</option>
                  <option value={8}>8 Hours (Full Day)</option>
                  <option value={12}>12 Hours (Night/Day)</option>
                </select>
              </div>
            </div>

            {/* Step 3: Service Type */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Care Service Required</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 bg-white"
              >
                <option value="Companion Care">Companion Care & Socialization</option>
                <option value="Medication & Vitals">Medication Administration & Vitals Monitoring</option>
                <option value="Full Day Assistance">Full Day Assistance & Hygiene Care</option>
                <option value="Mobility & Physical Therapy">Mobility & Knee / Stroke Exercise Support</option>
                <option value="Post-Hospitalization Support">Post-Hospitalization & Wound Recovery</option>
                <option value="Dementia / Memory Care">Dementia / Alzheimer Memory Care</option>
              </select>
            </div>

            {/* Step 4: Special Instructions */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Care Instructions for Caregiver
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder="Specific instructions, diet, allergies, or tasks for the caregiver..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white"
                required
              />
            </div>

            {/* Price & Summary Box */}
            <div className="p-4 rounded-2xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Calculated Total (No hidden fee)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-burgundy-900">₹{totalCost}</span>
                  <span className="text-xs text-stone-600">
                    (₹{hourlyRate}/hr × {durationHours} hrs)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
                <CreditCard className="h-3.5 w-3.5" />
                <span>UPI / Card Ready</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-burgundy-800 to-warmOrange-700 hover:from-burgundy-900 hover:to-warmOrange-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {isProcessing ? 'Processing Secure Booking...' : `Confirm & Book Visit (₹${totalCost})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
