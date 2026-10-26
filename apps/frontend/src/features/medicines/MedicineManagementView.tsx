"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { Medicine } from '../../types';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Trash2,
  Bell,
  Volume2,
  Info,
  Sparkles,
} from 'lucide-react';

export const MedicineManagementView: React.FC = () => {
  const {
    medicines,
    medicineLogs,
    selectedElderly,
    takeMedicine,
    skipMedicine,
    snoozeMedicine,
    addNewMedicine,
    removeMedicine,
    addToast,
  } = useCareNest();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Medicine['frequency']>('Twice daily');
  const [times, setTimes] = useState('08:00 AM, 08:00 PM');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState('#881337');

  const elderly = selectedElderly || { fullName: 'Ramesh Chandra', id: 'eld-1' };
  const elderlyMeds = medicines.filter((m) => m.elderlyId === elderly.id);

  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) {
      addToast('Missing Details', 'Please fill medicine name and dosage', 'warning');
      return;
    }

    const parsedTimes = times.split(',').map((t) => t.trim()).filter(Boolean);

    addNewMedicine({
      elderlyId: elderly.id,
      name,
      dosage,
      frequency,
      times: parsedTimes.length > 0 ? parsedTimes : ['08:00 AM'],
      instructions: instructions || 'Take with water after meal.',
      startDate,
      endDate: endDate || undefined,
      color: selectedTagColor,
      isActive: true,
    });

    // Reset Form
    setName('');
    setDosage('');
    setInstructions('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-orange-100 text-warmOrange-900 px-2.5 py-0.5 rounded-full">
              Medication & Prescription Hub
            </span>
            <span className="text-xs text-stone-500 font-medium">For {elderly.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Smart Medicine Reminders
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track daily dosages, schedule reminders, and receive alerts if any doses are missed.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition transform active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Mandatory Non-Medical Advice Legal Disclaimer (Section 12) */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950">Non-Medical Advisory Disclaimer</p>
          <p className="text-stone-700 mt-0.5 leading-relaxed">
            CareNest does <strong>NOT</strong> provide medical diagnoses or alter prescribed prescriptions. This platform only manages reminders and schedules entered directly by the patient, family members, or attending physician. Always consult your certified doctor before starting, stopping, or changing any medication dosage.
          </p>
        </div>
      </div>

      {/* 1. Today's Medicine Schedule & 1-Click Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 font-display">
            Today's Scheduled Medication Timetable
          </h2>
          <span className="text-xs text-stone-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {elderlyMeds.map((med) => {
            const todayLog = medicineLogs.find(
              (l) => l.medicineId === med.id && l.scheduledDate === new Date().toISOString().split('T')[0]
            );
            const isTaken = todayLog?.status === 'TAKEN';
            const isSkipped = todayLog?.status === 'SKIPPED';

            return (
              <div
                key={med.id}
                className={`p-5 rounded-3xl border shadow-soft-sm space-y-4 transition ${
                  isTaken
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : isSkipped
                    ? 'bg-stone-50 border-stone-200 opacity-75'
                    : 'bg-white border-stone-200'
                }`}
              >
                {/* Time header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: med.color || '#ea580c' }}
                    />
                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
                      {med.times.join(' • ')}
                    </span>
                  </div>

                  {isTaken ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Taken ({todayLog?.loggedBy?.split(' ')[0]})
                    </span>
                  ) : isSkipped ? (
                    <span className="text-xs font-bold text-stone-600 bg-stone-200 px-2.5 py-0.5 rounded-full">
                      Skipped
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Medicine info */}
                <div>
                  <h3 className="text-lg font-black text-stone-900">{med.name}</h3>
                  <p className="text-xs font-bold text-burgundy-900 mt-0.5">
                    Dosage: {med.dosage} ({med.frequency})
                  </p>
                  <p className="text-xs text-stone-600 mt-1 italic bg-white/70 p-2.5 rounded-xl border border-stone-200">
                    "{med.instructions}"
                  </p>
                </div>

                {/* Interactive Action Buttons (Taken, Snooze, Skip) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => takeMedicine(med.id)}
                    className={`py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1 transition ${
                      isTaken
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{isTaken ? '✓ Taken' : 'Mark Taken'}</span>
                  </button>

                  <button
                    onClick={() => snoozeMedicine(med.id, 15)}
                    className="py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200/80 transition"
                  >
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    Snooze
                  </button>

                  <button
                    onClick={() => skipMedicine(med.id, 'Patient feeling full / nauseous')}
                    className="py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs border border-slate-200/80 transition"
                  >
                    Skip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Registered Medicine List & Removal */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm p-6 space-y-4">
        <h3 className="text-base font-black text-stone-900 font-display">
          Active Prescription Catalog ({elderlyMeds.length} Prescriptions)
        </h3>

        <div className="divide-y divide-stone-100">
          {elderlyMeds.map((med) => (
            <div key={med.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold"
                  style={{ backgroundColor: med.color || '#ea580c' }}
                >
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">{med.name}</p>
                  <p className="text-stone-500">{med.dosage} • {med.frequency} • Times: {med.times.join(', ')}</p>
                </div>
              </div>

              <button
                onClick={() => removeMedicine(med.id)}
                className="p-2 text-stone-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                title="Remove Medicine"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Pill className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-black font-display">Add Medicine Schedule</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Medicine Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dosage *</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet, 5 ml syrup"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Every 4 hours">Every 4 hours</option>
                    <option value="As needed">As needed (SOS)</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Scheduled Time(s) (comma separated)
                </label>
                <input
                  type="text"
                  value={times}
                  onChange={(e) => setTimes(e.target.value)}
                  placeholder="e.g. 08:00 AM, 08:00 PM"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Instructions / Meal Note</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take after breakfast with warm water"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition transform active:scale-95"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
