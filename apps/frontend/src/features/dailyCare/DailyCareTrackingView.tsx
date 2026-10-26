"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  CheckSquare,
  CheckCircle,
  Clock,
  Pill,
  Coffee,
  Droplet,
  Heart,
  Footprints,
  Calendar,
  Smile,
  Edit,
  Save,
  Activity,
  User,
} from 'lucide-react';

export const DailyCareTrackingView: React.FC = () => {
  const {
    dailyCareLog,
    toggleDailyCare,
    saveDailyCareGeneralNote,
    selectedElderly,
    currentRole,
    currentUser,
    addToast,
  } = useCareNest();

  const elderly = selectedElderly || { fullName: 'Ramesh Chandra' };
  const items = dailyCareLog?.items || [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [generalNote, setGeneralNote] = useState(dailyCareLog?.generalNote || 'Patient is cheerful and active.');

  const handleSaveNote = () => {
    saveDailyCareGeneralNote(generalNote);
    setIsEditingNote(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MEDICINE':
        return <Pill className="h-5 w-5 text-warmOrange-600" />;
      case 'MEAL':
        return <Coffee className="h-5 w-5 text-amber-600" />;
      case 'HYDRATION':
        return <Droplet className="h-5 w-5 text-blue-600" />;
      case 'PERSONAL_CARE':
        return <Heart className="h-5 w-5 text-indigo-600" />;
      case 'EXERCISE':
        return <Footprints className="h-5 w-5 text-emerald-600" />;
      case 'APPOINTMENT':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <Smile className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-softGreen-100 text-softGreen-800 px-2.5 py-0.5 rounded-full">
              Daily Health Routine
            </span>
            <span className="text-xs text-stone-500 font-medium">For {elderly.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Today's Daily-Care Tracking
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time checklist shared between attending caregivers and family members.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            {completedCount} of {totalCount} Completed ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar & Status Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-soft-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span>Today's Overall Routine Status</span>
          </div>
          <span className="text-xs text-emerald-200">
            Updated: {dailyCareLog?.updatedAt ? new Date(dailyCareLog.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
          </span>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-300 block font-bold">Medicines:</span>
            <span>Morning Done, Eve Scheduled</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-300 block font-bold">Hydration:</span>
            <span>1.2L of 1.5L Target</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-300 block font-bold">Physiotherapy:</span>
            <span>15 Mins Knee Flexion</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-300 block font-bold">Mobility:</span>
            <span>850 Steps Walked</span>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="text-base font-black text-stone-900 font-display">
            Daily Care Checklist Items
          </h2>
          <span className="text-xs text-stone-500">Click any item to toggle completed</span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleDailyCare(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                item.completed
                  ? 'bg-emerald-50/60 border-emerald-200 text-stone-900'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0 ${
                    item.completed ? 'bg-emerald-600 text-white shadow-sm' : 'border-2 border-stone-300 bg-white'
                  }`}
                >
                  {item.completed && '✓'}
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-stone-200 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${item.completed ? 'text-stone-900' : 'text-stone-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-stone-500">
                      Target: <strong>{item.timeTarget || 'Flexible'}</strong> {item.notes && `• ${item.notes}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 text-right">
                {item.completed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" /> Completed at {item.timeCompleted}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Well-Being Note */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-stone-900 font-display">
            General Well-Being & Caregiver Summary
          </h3>
          {!isEditingNote ? (
            <button
              onClick={() => setIsEditingNote(true)}
              className="text-xs text-burgundy-800 font-bold hover:underline flex items-center gap-1"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Note
            </button>
          ) : (
            <button
              onClick={handleSaveNote}
              className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Save className="h-3.5 w-3.5" /> Save Note
            </button>
          )}
        </div>

        {!isEditingNote ? (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed space-y-2">
            <p>"{dailyCareLog?.generalNote || 'Patient was active and completed all morning exercises.'}"</p>
            <p className="text-[11px] text-stone-400">
              Logged by: {dailyCareLog?.updatedBy || 'Sister Ananya Roy (GDA Nurse)'}
            </p>
          </div>
        ) : (
          <textarea
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs rounded-2xl border border-stone-300 focus:ring-2 focus:ring-burgundy-700 bg-white"
          />
        )}
      </div>
    </div>
  );
};
