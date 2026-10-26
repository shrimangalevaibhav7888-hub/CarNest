"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useCareNest, AppView, VIEW_TO_HASH } from '../../context/CareNestContext';
import { UserRole } from '../../types';
import {
  Heart,
  Home,
  Users,
  ShieldCheck,
  Bell,
  Sparkles,
  PhoneCall,
  Menu,
  X,
  User as UserIcon,
  Search,
  Pill,
  CheckSquare,
  Calendar,
  MapPin,
  Clock,
  LogOut,
  ChevronDown,
  Activity,
  CreditCard,
  Eye,
  AlertTriangle,
  FileCheck,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const CareNestNavbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activeView,
    setActiveView,
    isAuthenticated,
    isDemoMode,
    switchDemoPersona,
    exitDemoMode,
    realLogout,
    loginAsRole,
    logout,
    seniorMode,
    toggleSeniorMode,
    unreadNotificationsCount,
    notifications,
    markAllNotificationsRead,
    triggerSosAlert,
    setIsSosModalOpen,
  } = useCareNest();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPortalsMenuOpen, setIsPortalsMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const portalsMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
      if (portalsMenuRef.current && !portalsMenuRef.current.contains(target)) {
        setIsPortalsMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setIsNotifDropdownOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const personas: { role: UserRole; title: string; label: string; desc: string; icon: string; color: string }[] = [
    {
      role: 'ELDERLY',
      title: 'Elderly Patient (60+)',
      label: 'Ramesh Chandra (74)',
      desc: 'Big buttons, simplified health reminders & 1-click SOS',
      icon: '👴',
      color: 'border-orange-200 hover:border-orange-400 bg-orange-50/50',
    },
    {
      role: 'FAMILY',
      title: 'Family Member',
      label: 'Vikram Chandra (Son)',
      desc: 'Live visits, medication tracking, caregiver booking',
      icon: '👨‍👩‍👧',
      color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50',
    },
    {
      role: 'CAREGIVER',
      title: 'Verified Caregiver / Nurse',
      label: 'Sister Ananya Roy (GDA)',
      desc: 'Active visits, vitals entry, care checklist & notes',
      icon: '🩺',
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50',
    },
    {
      role: 'ADMIN',
      title: 'CareNest Operations Admin',
      label: 'Platform Admin',
      desc: 'Caregiver verification, safety audit & bookings monitor',
      icon: '🛡️',
      color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50',
    },
  ];

  const handleNavClick = (view: AppView) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    setIsNotifDropdownOpen(false);
    setIsRoleMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsPortalsMenuOpen(false);
  };

  // Helper providing real anchor link properties for browser tabs, right-click, middle-click
  const createNavProps = (view: AppView) => ({
    href: VIEW_TO_HASH[view] || '#home',
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow default browser handling for ctrl-click, middle-click, command-click
      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
        e.preventDefault();
        handleNavClick(view);
      }
    },
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] transition-all">
      {/* Top Banner for 24/7 Care & Senior Mode */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/30">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-white">CareNest 24/7 Verified In-Home Caregiver & Nursing Network Active</span>
          <span className="hidden md:inline text-slate-400">| Emergency Helpline: Call 112 / 108</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <a
            {...createNavProps('TRUST_SAFETY')}
            className="hover:underline flex items-center gap-1 text-indigo-300 font-medium"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            100% Background-Verified Nurses & Caregivers
          </a>
          <span className="hidden sm:inline text-white/30">|</span>
          <button
            onClick={toggleSeniorMode}
            className={`px-2.5 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
              seniorMode ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Eye className="h-3 w-3" />
            {seniorMode ? 'Senior Mode: ON' : 'Senior Mode'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            {...createNavProps('HOME')}
            className="flex items-center gap-3 cursor-pointer group select-none no-underline"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 text-white shadow-[0_6px_20px_-2px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform">
              <Heart className="h-6 w-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
                  CareNest
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                  AI Home Care
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Elderly Care & Verified Nursing
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links - Signature Floating Pill Nav */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
            {/* Home Pill */}
            <a
              {...createNavProps('HOME')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 no-underline ${
                activeView === 'HOME'
                  ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                  : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
              }`}
            >
              <Home className="h-3.5 w-3.5 text-indigo-600" />
              Home
            </a>

            {/* Find Caregivers Pill */}
            <a
              {...createNavProps('CAREGIVER_SEARCH')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 no-underline ${
                activeView === 'CAREGIVER_SEARCH'
                  ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                  : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-indigo-600" />
              Find Caregivers
            </a>

            {/* Daily Care Pill */}
            <a
              {...createNavProps('DAILY_CARE')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 no-underline ${
                activeView === 'DAILY_CARE'
                  ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                  : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
              Daily Care
            </a>

            {/* Medicines Reminder Pill */}
            <a
              {...createNavProps('MEDICINES')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 no-underline ${
                activeView === 'MEDICINES'
                  ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                  : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
              }`}
            >
              <Pill className="h-3.5 w-3.5 text-indigo-600" />
              Medicines
            </a>

            {/* Appointments Pill */}
            <a
              {...createNavProps('APPOINTMENTS')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 no-underline ${
                activeView === 'APPOINTMENTS'
                  ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                  : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Appointments
            </a>

            {/* More Services Dropdown Tab */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(!isMoreMenuOpen);
                  setIsPortalsMenuOpen(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  ['EMERGENCY', 'LOCATION', 'FAMILY_UPDATES', 'SUBSCRIPTION', 'TRUST_SAFETY', 'HOW_IT_WORKS'].includes(activeView)
                    ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                    : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                <span>More Features</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-soft-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Additional Care & Trust Tools
                  </div>
                  <div className="space-y-1">
                    <a
                      {...createNavProps('EMERGENCY')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-slate-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Emergency Incident Hub</div>
                        <div className="text-[10px] text-slate-500">SOS coordination & paramedic protocol</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('LOCATION')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Location Sharing</div>
                        <div className="text-[10px] text-slate-500">GPS verified visit coordinates</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('FAMILY_UPDATES')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Family Health Timeline</div>
                        <div className="text-[10px] text-slate-500">Chronological health notes & updates</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('SUBSCRIPTION')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Plans & Membership</div>
                        <div className="text-[10px] text-slate-500">From ₹349/mo & hourly caregiver rates</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('TRUST_SAFETY')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Trust & Safety Guarantee</div>
                        <div className="text-[10px] text-slate-500">4-step vetting & background audit</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('HOW_IT_WORKS')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-stone-100 text-slate-700">
                        <Sparkles className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">How CareNest Works</div>
                        <div className="text-[10px] text-slate-500">Step-by-step guide for seniors & family</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Portals Dropdown Tab */}
            <div className="relative" ref={portalsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsPortalsMenuOpen(!isPortalsMenuOpen);
                  setIsMoreMenuOpen(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView.includes('DASHBOARD')
                    ? 'bg-gradient-to-r from-indigo-100/90 to-violet-100/90 text-indigo-700 shadow-sm border border-indigo-200/70'
                    : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60'
                }`}
              >
                <Activity className="h-3.5 w-3.5 text-indigo-600" />
                <span>Portals</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isPortalsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPortalsMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-soft-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Direct Portal Views
                  </div>
                  <div className="space-y-1">
                    <a
                      {...createNavProps('ELDERLY_DASHBOARD')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-orange-50 text-slate-800 transition"
                    >
                      <span className="text-xl">👴</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Elderly Senior Portal</div>
                        <div className="text-[10px] text-slate-500">Accessible high-contrast buttons & voice</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('FAMILY_DASHBOARD')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-indigo-50 text-slate-800 transition"
                    >
                      <span className="text-xl">👨‍👩‍👧</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Family Member Dashboard</div>
                        <div className="text-[10px] text-slate-500">Live visit tracking, meds & linking</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('CAREGIVER_DASHBOARD')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50 text-slate-800 transition"
                    >
                      <span className="text-xl">🩺</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Caregiver Nurse Work Hub</div>
                        <div className="text-[10px] text-slate-500">Active visits, vitals entry & notes</div>
                      </div>
                    </a>

                    <a
                      {...createNavProps('ADMIN_DASHBOARD')}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-50 text-slate-800 transition"
                    >
                      <span className="text-xl">🛡️</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Admin Operations Desk</div>
                        <div className="text-[10px] text-slate-500">Caregiver verification & audit log</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* High-Visibility Emergency Alert Button */}
            <button
              onClick={() => triggerSosAlert()}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-full shadow-[0_4px_14px_rgba(245,158,11,0.3)] flex items-center gap-1.5 transition transform active:scale-95 animate-sos"
              title="Click for Emergency Assistance"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-slate-950" />
              <span>SOS Alert</span>
            </button>

            {/* Authenticated User Profile Pill or Log In/Sign Up */}
            {currentUser && !isDemoMode ? (
              <div className="flex items-center gap-2">
                <div id="nav-user-pill" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-[11px] flex items-center justify-center shadow-sm">
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'CN'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                      {currentUser.displayName}
                    </div>
                    <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  id="nav-sign-out-btn"
                  onClick={realLogout}
                  className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  title="Sign Out of CareNest"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : isDemoMode ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full hidden sm:inline">
                  Sandbox: {currentUser?.displayName}
                </span>
                <button
                  onClick={exitDemoMode}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
                >
                  Exit Demo
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  {...createNavProps('LOGIN')}
                  className="hidden sm:inline-flex px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm transition no-underline"
                >
                  Log In
                </a>
                <a
                  {...createNavProps('REGISTER')}
                  className="hidden sm:inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-[0_6px_20px_-2px_rgba(79,70,229,0.45)] transition no-underline"
                >
                  Sign Up
                </a>
              </div>
            )}

            {/* Notifications Button */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-sm relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-indigo-600" />
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {notifications.length}
                      </span>
                    </div>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">No notifications right now.</div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-slate-50 transition flex items-start gap-3 ${
                            !notif.isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                            {notif.type === 'EMERGENCY' ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            ) : notif.type === 'MEDICINE' ? (
                              <Pill className="h-4 w-4 text-indigo-600" />
                            ) : notif.type === 'VISIT' ? (
                              <Users className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Activity className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{notif.createdAt}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Demo Personas Sandbox Menu */}
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-slate-800 text-xs sm:text-sm font-semibold"
                title="Explore Simulated Personas"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden md:inline font-bold">
                  {isDemoMode ? `Demo (${currentRole})` : 'Demo Sandbox'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-xl border border-slate-200 p-3 z-50">
                  <div className="pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Demo Sandbox Personas
                      </span>
                      <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-full">
                        Preview Only
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Test simulated scenarios without altering real production user accounts.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {personas.map((p) => (
                      <button
                        key={p.role}
                        onClick={() => {
                          switchDemoPersona(p.role);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                          isDemoMode && currentRole === p.role
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">{p.title}</span>
                            {isDemoMode && currentRole === p.role && (
                              <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">
                                Active Demo
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] truncate ${
                              isDemoMode && currentRole === p.role ? 'text-indigo-100' : 'text-slate-500'
                            }`}
                          >
                            {p.label}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {isDemoMode ? (
                      <button
                        onClick={() => {
                          exitDemoMode();
                          setIsRoleMenuOpen(false);
                        }}
                        className="text-amber-800 font-bold hover:underline"
                      >
                        Exit Demo Mode
                      </button>
                    ) : (
                      <a
                        {...createNavProps('LOGIN')}
                        className="text-indigo-600 hover:text-indigo-800 font-bold no-underline"
                      >
                        Sign In with Real Account
                      </a>
                    )}

                    {currentUser && (
                      <button
                        onClick={() => {
                          realLogout();
                          setIsRoleMenuOpen(false);
                        }}
                        className="text-slate-600 hover:text-rose-600 font-semibold flex items-center gap-1"
                      >
                        <LogOut className="h-3 w-3" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with ALL openable tabs */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
          {/* Main Services */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Care & Health Services
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                {...createNavProps('HOME')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'HOME' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Home className="h-4 w-4 text-indigo-600" />
                Home
              </a>
              <a
                {...createNavProps('CAREGIVER_SEARCH')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'CAREGIVER_SEARCH' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Search className="h-4 w-4 text-indigo-600" />
                Find Caregivers
              </a>
              <a
                {...createNavProps('DAILY_CARE')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'DAILY_CARE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                Daily Care
              </a>
              <a
                {...createNavProps('MEDICINES')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'MEDICINES' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Pill className="h-4 w-4 text-indigo-600" />
                Medicines
              </a>
              <a
                {...createNavProps('APPOINTMENTS')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'APPOINTMENTS' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Calendar className="h-4 w-4 text-blue-600" />
                Appointments
              </a>
              <a
                {...createNavProps('EMERGENCY')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'EMERGENCY' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Emergency Hub
              </a>
              <a
                {...createNavProps('LOCATION')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'LOCATION' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-4 w-4 text-indigo-600" />
                Location Sharing
              </a>
              <a
                {...createNavProps('FAMILY_UPDATES')}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border no-underline ${
                  activeView === 'FAMILY_UPDATES' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Activity className="h-4 w-4 text-blue-600" />
                Family Updates
              </a>
            </div>
          </div>

          {/* Membership & Trust */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Trust & Membership
            </span>
            <div className="grid grid-cols-3 gap-2">
              <a
                {...createNavProps('SUBSCRIPTION')}
                className={`p-2 rounded-xl font-bold text-xs text-center border no-underline ${
                  activeView === 'SUBSCRIPTION' ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <CreditCard className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                Plans
              </a>
              <a
                {...createNavProps('TRUST_SAFETY')}
                className={`p-2 rounded-xl font-bold text-xs text-center border no-underline ${
                  activeView === 'TRUST_SAFETY' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                Trust & Safety
              </a>
              <a
                {...createNavProps('HOW_IT_WORKS')}
                className={`p-2 rounded-xl font-bold text-xs text-center border no-underline ${
                  activeView === 'HOW_IT_WORKS' ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Sparkles className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                How it Works
              </a>
            </div>
          </div>

          {/* Direct Portals Access */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              All Portals (Openable Directly)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                {...createNavProps('ELDERLY_DASHBOARD')}
                className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 text-orange-950 font-bold text-xs flex items-center gap-2 no-underline"
              >
                <span className="text-lg">👴</span>
                <span>Elderly Portal</span>
              </a>
              <a
                {...createNavProps('FAMILY_DASHBOARD')}
                className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 font-bold text-xs flex items-center gap-2 no-underline"
              >
                <span className="text-lg">👨‍👩‍👧</span>
                <span>Family Portal</span>
              </a>
              <a
                {...createNavProps('CAREGIVER_DASHBOARD')}
                className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-bold text-xs flex items-center gap-2 no-underline"
              >
                <span className="text-lg">🩺</span>
                <span>Caregiver Hub</span>
              </a>
              <a
                {...createNavProps('ADMIN_DASHBOARD')}
                className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 font-bold text-xs flex items-center gap-2 no-underline"
              >
                <span className="text-lg">🛡️</span>
                <span>Admin Operations</span>
              </a>
            </div>
          </div>

          {/* Auth in Mobile */}
          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <a
                {...createNavProps('LOGIN')}
                className="py-2.5 text-center rounded-full border border-slate-200 bg-white text-slate-800 font-bold text-xs shadow-sm no-underline"
              >
                Log In
              </a>
              <a
                {...createNavProps('REGISTER')}
                className="py-2.5 text-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-sm no-underline"
              >
                Sign Up
              </a>
            </div>
          )}

          {/* Sandbox Personas */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase text-slate-400">Switch Demo Sandbox Persona</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {personas.map((p) => (
                <button
                  key={p.role}
                  onClick={() => {
                    loginAsRole(p.role);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-2 ${
                    currentRole === p.role
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span className="truncate">{p.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
