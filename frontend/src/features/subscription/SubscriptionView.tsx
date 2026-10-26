"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from '../../types';

export const SubscriptionView: React.FC = () => {
  const { subscription, updateSubscription, addToast } = useCareNest();

  const plans = [
    {
      id: 'BASIC',
      name: 'CareNest Basic' as const,
      priceINR: 349,
      formattedPrice: '₹349',
      period: '/month',
      description: 'Essential elderly-care support for you and your family.',
      features: [
        'Medication and appointment reminders',
        'Daily well-being check-ins',
        'Family care dashboard',
      ],
      popular: false,
      buttonText: 'Choose CareNest Basic',
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#e8f1ff] flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.8L3.2 10.3a1 1 0 0 0-.2.7v9.5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V11a1 1 0 0 0-.2-.7L12 2.8z"
              fill="#2563eb"
            />
            <path
              d="M12 11.2c-.8-1-2.1-1.1-2.9-.2-.8.8-.7 2.1.2 3l2.7 2.6 2.7-2.6c.9-.9 1-2.2.2-3-.8-.9-2.1-.8-2.9.2z"
              fill="white"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'PLUS',
      name: 'CareNest Plus' as const,
      priceINR: 699,
      formattedPrice: '₹699',
      period: '/month',
      description: 'More support, more peace of mind for your loved ones.',
      features: [
        'Everything in CareNest Basic',
        'Caregiver search and booking coordination',
        'Family care updates',
        'Priority support',
      ],
      popular: true,
      buttonText: 'Choose CareNest Plus',
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#ede8ff] flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-[#583beb]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6.2c-.85-1.1-2.3-1.3-3.3-.4-1.1.9-1.2 2.5-.2 3.6L12 13.2l3.5-3.8c1-1.1.9-2.7-.2-3.6-1-.9-2.45-.7-3.3.4z" />
            <path d="M6.2 11.2c-.6.4-1.2 1.2-1.2 2.2 0 2.4 2 4.4 4.5 5.4l.6-1.6c-1.8-.8-3.1-2.2-3.1-3.8 0-.6.3-1.1.7-1.4l-1.5-.8z" />
            <path d="M17.8 11.2l-1.5.8c.4.3.7.8.7 1.4 0 1.6-1.3 3-3.1 3.8l.6 1.6c2.5-1 4.5-3 4.5-5.4 0-1-.6-1.8-1.2-2.2z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'PREMIUM',
      name: 'CareNest Premium' as const,
      priceINR: 1099,
      formattedPrice: '₹1,099',
      period: '/month',
      description: 'Comprehensive care support for round-the-clock peace of mind.',
      features: [
        'Everything in CareNest Plus',
        'Dedicated care coordinator',
        'Weekly care summaries',
        'Priority emergency assistance coordination',
      ],
      popular: false,
      buttonText: 'Choose CareNest Premium',
      icon: (
        <div className="w-14 h-14 rounded-full bg-[#ffede2] flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path d="M12 2.5L4 5.5v6c0 5.3 3.4 10.3 8 11.5 4.6-1.2 8-6.2 8-11.5v-6l-8-3z" fill="#d8521d" />
            <path d="M10.8 8h2.4v2.8H16v2.4h-2.8V16h-2.4v-2.8H8v-2.4h2.8V8z" fill="white" />
          </svg>
        </div>
      ),
    },
  ];

  const handleSelectPlan = (p: typeof plans[0]) => {
    updateSubscription({
      id: `sub-${Date.now()}`,
      userId: 'user-family-1',
      planName: p.name,
      monthlyRateINR: p.priceINR,
      status: 'ACTIVE',
      renewalDate: new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      paymentMethod: 'UPI AutoPay (vikram@oksbi)',
      features: p.features,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Active Subscription Status Banner */}
      {subscription && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-soft-lg space-y-4 border border-indigo-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full inline-block">
                Active Family Membership
              </span>
              <h2 className="text-2xl font-black font-display mt-2">
                {subscription.planName}
              </h2>
              <p className="text-xs text-slate-300">
                Billing: ₹{subscription.monthlyRateINR}/month • Payment Method: {subscription.paymentMethod || 'UPI AutoPay'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-xs text-slate-200 space-y-1 sm:text-right">
              <span className="text-slate-400 block">Next Auto-Renewal:</span>
              <span className="text-sm font-black text-amber-300 block">
                {subscription.renewalDate || 'April 15, 2026'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                ● Status: Active & Secured
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Pricing Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Simple, Transparent Monthly Plans
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Choose a plan that fits your family's needs. Get access to trusted caregivers, care coordination and more.
        </p>
      </div>

      {/* 3-Column Membership Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch pt-4">
        {plans.map((p) => {
          const isCurrent = subscription?.planName === p.name;
          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition duration-200 ${
                p.popular
                  ? 'border-2 border-[#583beb] shadow-[0_12px_40px_rgba(88,59,235,0.12)]'
                  : 'border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#583beb] text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                  MOST POPULAR
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Icon */}
                <div className="pt-2">{p.icon}</div>

                {/* Plan Title */}
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {p.name}
                  </h3>
                </div>

                {/* Price Display */}
                <div className="text-center flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#3a3ee6]">
                    {p.formattedPrice}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-slate-500">
                    {p.period}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed min-h-[38px] max-w-xs mx-auto">
                  {p.description}
                </p>

                {/* Feature List */}
                <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  onClick={() => handleSelectPlan(p)}
                  className={`w-full py-3 px-6 rounded-full font-bold text-xs sm:text-sm transition text-center ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400 cursor-default'
                      : p.popular
                      ? 'bg-[#583beb] hover:bg-[#482fe0] text-white shadow-md active:scale-[0.99]'
                      : 'border-2 border-[#583beb] text-[#583beb] hover:bg-[#583beb]/5 active:scale-[0.99]'
                  }`}
                >
                  {isCurrent ? `✓ Current Plan (${p.name})` : p.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
