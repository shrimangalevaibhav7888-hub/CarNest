"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  MapPin,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Clock,
  User,
  Heart,
  Navigation,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const LocationSharingView: React.FC = () => {
  const { selectedElderly, toggleElderlyLocationSharing, addToast } = useCareNest();

  const elderly = selectedElderly || {
    fullName: 'Ramesh Chandra',
    address: 'Flat 402, Shanti Niketan, Indiranagar, Bengaluru',
    isLocationSharingOn: true,
    lastKnownLocation: {
      lat: 12.9784,
      lng: 77.6408,
      address: 'Indiranagar 100ft Road, Bengaluru',
      updatedAt: '10 mins ago',
    },
  };

  const isSharing = elderly.isLocationSharingOn;
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  const handleRefresh = () => {
    setLastRefreshed('Just now');
    addToast('GPS Location Refreshed', 'Received latest verified coordinates.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full">
              Privacy-First Geolocation
            </span>
            <span className="text-xs text-stone-500 font-medium">For {elderly.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Caregiver Visit & Patient Location Sharing
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time live location coordinates enabled exclusively during active care visits.
          </p>
        </div>

        {/* Location Toggle (Section 15) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-700">
            Location Sharing: <strong className={isSharing ? 'text-emerald-700' : 'text-stone-500'}>{isSharing ? 'ON' : 'OFF'}</strong>
          </span>
          <button
            onClick={toggleElderlyLocationSharing}
            className={`p-2 rounded-2xl border transition flex items-center gap-1.5 ${
              isSharing
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                : 'bg-stone-200 text-stone-700 border-stone-300'
            }`}
          >
            {isSharing ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-stone-900">Explicit Permission & Privacy Architecture</p>
          <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
            CareNest respects personal dignity. Location is only shared with verified family members and assigned caregivers when explicitly toggled ON. CareNest does not continuously track users in the background without active care session authorization.
          </p>
        </div>
      </div>

      {/* Simulated Live Map Visualization */}
      <div className="relative rounded-3xl bg-stone-900 overflow-hidden shadow-2xl border border-stone-800 h-96 sm:h-[420px] flex items-center justify-center">
        {/* Map Grid Graphic Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #18181b 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Map UI Floating Overlay */}
        <div className="absolute top-4 left-4 z-10 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 text-xs max-w-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900">Live Geofence Monitor</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              GPS Active
            </span>
          </div>
          <p className="text-stone-600 text-[11px]">
            {elderly.address}
          </p>
          <p className="text-[10px] text-stone-400">
            Last Updated: {lastRefreshed}
          </p>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleRefresh}
            className="p-3 rounded-2xl bg-white/95 hover:bg-white text-stone-800 shadow-lg border border-stone-200 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="h-4 w-4 text-warmOrange-600" />
            <span>Refresh Coordinates</span>
          </button>
        </div>

        {/* Center Markers (Elderly Home + Caregiver) */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Elderly Home Pin */}
          <div className="relative flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-burgundy-600/30 animate-ping absolute inset-0 m-auto" />
            <div className="h-12 w-12 rounded-2xl bg-burgundy-900 text-white shadow-xl border-2 border-white flex items-center justify-center font-bold relative z-10">
              👴
            </div>
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-stone-200 mt-2 text-center text-xs">
              <p className="font-bold text-stone-900">{elderly.fullName} (Home)</p>
              <p className="text-[10px] text-stone-500">Indiranagar 100ft Rd</p>
            </div>
          </div>

          {/* Caregiver Nearby Pin */}
          <div className="mt-6 flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-white px-4 py-2 rounded-2xl shadow-lg text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sister Ananya Roy (Caregiver) is on site with patient</span>
          </div>
        </div>

        {/* Bottom Bar on Map */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 text-xs">
          <div className="flex items-center gap-2 text-stone-800">
            <MapPin className="h-4 w-4 text-burgundy-700" />
            <span>Lat: <strong>12.9784° N</strong>, Lng: <strong>77.6408° E</strong> (Accuracy: ±5m)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Encrypted GPS Session Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
