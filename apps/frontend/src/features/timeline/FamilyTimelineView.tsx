"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  Activity,
  Heart,
  Pill,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Send,
  Sparkles,
  Filter,
} from 'lucide-react';
import { CareUpdate } from '../../types';

export const FamilyTimelineView: React.FC = () => {
  const { careUpdates, selectedElderly, postCareUpdate, currentRole, addToast } = useCareNest();

  const elderly = selectedElderly || { fullName: 'Ramesh Chandra', id: 'eld-1' };
  const updates = careUpdates.filter((u) => u.elderlyId === elderly.id);

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'VITALS' | 'MEDICINE' | 'ACTIVITY' | 'VISIT'>('ALL');
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');

  const filteredUpdates = updates.filter((u) => {
    if (selectedFilter === 'ALL') return true;
    return u.category === selectedFilter;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postDesc) {
      addToast('Missing Fields', 'Title and description are required', 'warning');
      return;
    }

    postCareUpdate(postTitle, postDesc, 'ACTIVITY');
    setPostTitle('');
    setPostDesc('');
    setIsQuickPostOpen(false);
  };

  const getCategoryBadge = (cat: CareUpdate['category']) => {
    switch (cat) {
      case 'VITALS':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Vitals Check</span>;
      case 'MEDICINE':
        return <span className="bg-orange-100 text-warmOrange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Medicine Log</span>;
      case 'VISIT':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Caregiver Visit</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Daily Update</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full">
              Live Health Journal
            </span>
            <span className="text-xs text-stone-500 font-medium">For {elderly.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Family Care & Health Timeline
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            A chronological timeline of care visits, taken medicines, recorded vitals, and daily well-being notes.
          </p>
        </div>

        <button
          onClick={() => setIsQuickPostOpen(!isQuickPostOpen)}
          className="px-4 py-2.5 bg-gradient-to-r from-burgundy-800 to-warmOrange-600 hover:from-burgundy-900 hover:to-warmOrange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Care Note</span>
        </button>
      </div>

      {/* Quick Post Box */}
      {isQuickPostOpen && (
        <form onSubmit={handleCreatePost} className="p-5 rounded-3xl bg-white border border-stone-200 shadow-soft space-y-3 animate-in fade-in text-xs">
          <h3 className="font-black text-stone-900 text-sm">Post a Note to Family Timeline</h3>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Title (e.g. Completed afternoon walk in park)"
            className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
            required
          />
          <textarea
            value={postDesc}
            onChange={(e) => setPostDesc(e.target.value)}
            placeholder="Details about patient mood, meals, or observations..."
            rows={2}
            className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-800 bg-white"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsQuickPostOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold rounded-xl shadow-sm"
            >
              Publish Update
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {(['ALL', 'VITALS', 'MEDICINE', 'ACTIVITY', 'VISIT'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl border transition shrink-0 ${
              selectedFilter === filter
                ? 'bg-burgundy-900 text-white border-burgundy-950 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {filter === 'ALL' ? 'All Updates' : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-stone-200 space-y-6">
        {filteredUpdates.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-6 w-6 rounded-full bg-white border-2 border-burgundy-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition">
              <span className="h-2 w-2 rounded-full bg-burgundy-700" />
            </div>

            {/* Card Content */}
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-soft-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-stone-900">{item.title}</h3>
                  {getCategoryBadge(item.category)}
                </div>
                <span className="text-[11px] font-bold text-stone-400">{item.timestamp}</span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>

              {/* Vitals metrics box if present */}
              {item.vitals && (
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {item.vitals.bloodPressure && (
                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold">Blood Pressure</span>
                      <span className="font-bold text-stone-900">{item.vitals.bloodPressure}</span>
                    </div>
                  )}
                  {item.vitals.heartRate && (
                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold">Heart Rate</span>
                      <span className="font-bold text-stone-900">{item.vitals.heartRate} bpm</span>
                    </div>
                  )}
                  {item.vitals.bloodSugar && (
                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold">Blood Sugar</span>
                      <span className="font-bold text-stone-900">{item.vitals.bloodSugar}</span>
                    </div>
                  )}
                  {item.vitals.oxygenLevel && (
                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold">Oxygen (SpO2)</span>
                      <span className="font-bold text-stone-900">{item.vitals.oxygenLevel}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Author Footer */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Posted by: <strong className="text-stone-700">{item.authorName}</strong></span>
                <span className="capitalize">{item.authorRole.toLowerCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
