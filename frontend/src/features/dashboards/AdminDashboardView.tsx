"use client";

import React, { useState } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import {
  ShieldCheck,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Calendar,
  Activity,
  Award,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';
import { VerificationStatus, CaregiverProfile } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const {
    caregivers,
    verifyCaregiverStatus,
    elderlyProfiles,
    familyMembers,
    bookings,
    emergencyAlerts,
    resetDemoData,
    addToast,
    adminUsersList,
    adminStats,
    toggleUserStatus,
    refreshAdminData,
  } = useCareNest();

  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'USERS' | 'BOOKINGS' | 'EMERGENCY'>('VERIFICATIONS');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAdminData();
    setIsRefreshing(false);
    addToast('Admin Data Refreshed', 'Latest database records and statistics loaded.', 'info');
  };

  // Stats: use real adminStats if provided or calculate dynamically
  const totalElderly = adminStats?.patients_count ?? elderlyProfiles.length;
  const totalCaregivers = adminStats?.caregivers_count ?? caregivers.length;
  const verifiedCaregivers = adminStats?.verified_caregivers_count ?? caregivers.filter((c) => c.verificationStatus === 'VERIFIED').length;
  const pendingCaregivers = adminStats?.pending_caregivers_count ?? caregivers.filter((c) => c.verificationStatus !== 'VERIFIED').length;
  const activeBookings = bookings.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED').length;
  const totalUsers = adminStats?.total_users ?? adminUsersList.length;
  const totalEmergencyAlerts = emergencyAlerts.length;

  const filteredUsers = adminUsersList.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              Trust & Safety Operations
            </span>
            <span className="text-xs text-stone-500">CareNest Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-0.5">
            Operations & Caregiver Verification Desk
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Database</span>
          </button>

          <button
            onClick={resetDemoData}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-xl border border-purple-200 transition flex items-center gap-1.5"
          >
            <span>Reset Demo Sandbox</span>
          </button>
        </div>
      </div>

      {/* 1. Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-stone-900">{totalUsers}</p>
          <p className="text-[10px] uppercase font-bold text-stone-500 mt-0.5">Total Users</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-stone-900">{totalElderly}</p>
          <p className="text-[10px] uppercase font-bold text-stone-500 mt-0.5">Elderly Users</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-stone-900">{totalCaregivers}</p>
          <p className="text-[10px] uppercase font-bold text-stone-500 mt-0.5">Registered CGs</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-emerald-800">{verifiedCaregivers}</p>
          <p className="text-[10px] uppercase font-bold text-emerald-700 mt-0.5">Verified CGs</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-amber-800">{pendingCaregivers}</p>
          <p className="text-[10px] uppercase font-bold text-amber-700 mt-0.5">Pending Review</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-blue-800">{activeBookings}</p>
          <p className="text-[10px] uppercase font-bold text-blue-700 mt-0.5">Active Visits</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-soft-sm text-center">
          <p className="text-xl font-black text-amber-900">{totalEmergencyAlerts}</p>
          <p className="text-[10px] uppercase font-bold text-amber-700 mt-0.5">Emergency SOS</p>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('VERIFICATIONS')}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'VERIFICATIONS'
              ? 'border-burgundy-900 text-burgundy-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Caregiver Verifications ({pendingCaregivers} Pending)
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'border-burgundy-900 text-burgundy-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          User Accounts & Access ({adminUsersList.length})
        </button>

        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'BOOKINGS'
              ? 'border-burgundy-900 text-burgundy-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          All Home Care Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('EMERGENCY')}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'EMERGENCY'
              ? 'border-burgundy-900 text-burgundy-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Emergency Incident Log ({emergencyAlerts.length})
        </button>
      </div>

      {/* 3. Tab Contents */}
      {/* TAB 1: Caregiver Verifications */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-stone-900 font-display">
              Caregiver Document Verification Portal
            </h3>
            <span className="text-xs text-stone-500">
              Only verified caregivers appear in family booking searches
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm overflow-hidden divide-y divide-stone-100">
            {caregivers.length > 0 ? (
              caregivers.map((cg) => {
                return (
                  <div key={cg.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50 transition">
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={cg.avatarUrl || 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200'}
                        alt={cg.fullName}
                        className="h-14 w-14 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900 truncate">{cg.fullName}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              cg.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cg.verificationStatus === 'UNDER_REVIEW'
                                ? 'bg-blue-100 text-blue-800'
                                : cg.verificationStatus === 'REJECTED'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {cg.verificationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {cg.email} • {cg.experienceYears} yrs exp • {cg.city} • Rate: ₹{cg.hourlyRate}/hr
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Verification Note: {cg.verificationNotes || 'Awaiting supervisor sign-off'}
                        </p>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      {cg.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => verifyCaregiverStatus(cg.id, 'VERIFIED', 'All credentials approved by Admin.')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve & Verify</span>
                        </button>
                      )}

                      {cg.verificationStatus !== 'UNDER_REVIEW' && (
                        <button
                          onClick={() => verifyCaregiverStatus(cg.id, 'UNDER_REVIEW', 'Additional documents requested.')}
                          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition"
                        >
                          Request Documents
                        </button>
                      )}

                      {cg.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => verifyCaregiverStatus(cg.id, 'REJECTED', 'Documents failed verification check.')}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">
                No caregiver applications recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: User Accounts Management */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-stone-900 font-display">
                Registered Platform Accounts & Roles
              </h3>
              <p className="text-xs text-stone-500">
                Inspect registered users, role assignments, and toggle account activation status
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search name, email, role..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-burgundy-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-5 py-3">Member Name</th>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Assigned Role</th>
                    <th className="px-5 py-3">Account Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isActive = u.is_active !== false;
                      const roleBadgeColor =
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-900'
                          : u.role === 'CAREGIVER'
                          ? 'bg-emerald-100 text-emerald-900'
                          : u.role === 'FAMILY_MEMBER' || u.role === 'FAMILY'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900';

                      return (
                        <tr key={u.id} className="hover:bg-stone-50/80 transition">
                          <td className="px-5 py-4 font-bold text-stone-900 flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-[11px] text-stone-700">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <span>{u.full_name}</span>
                              <span className="block text-[10px] text-stone-400 font-normal">ID: #{u.id}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-stone-600">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${roleBadgeColor}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                              }`}
                            >
                              ● {isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => toggleUserStatus(u.id, !isActive)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                                  isActive
                                    ? 'bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isActive ? 'Suspend' : 'Reactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-stone-400">
                        No registered users found matching "{userSearchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: All Bookings */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-bold text-xs text-stone-500 uppercase tracking-wider">
            All Platform In-Home Bookings
          </div>
          <div className="divide-y divide-stone-100">
            {bookings.length > 0 ? (
              bookings.map((bk) => (
                <div key={bk.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{bk.elderlyName}</span>
                      <span className="text-[10px] font-extrabold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                        {bk.status}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-0.5">
                      Caregiver: <strong>{bk.caregiverName}</strong> • Service: {bk.serviceType}
                    </p>
                    <p className="text-[11px] text-stone-400">Date: {bk.date} ({bk.timeSlot}) • Paid: ₹{bk.totalAmount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-full">
                      {bk.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">
                No bookings registered on the platform yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Emergency SOS Incident Log */}
      {activeTab === 'EMERGENCY' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-soft-sm overflow-hidden divide-y divide-stone-100">
          <div className="p-4 border-b border-stone-100 font-bold text-xs text-stone-500 uppercase tracking-wider">
            Emergency SOS Incidents & Resolutions
          </div>
          {emergencyAlerts.length > 0 ? (
            emergencyAlerts.map((em) => (
              <div key={em.id} className="p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-amber-600">{em.elderlyName} (SOS Alert)</span>
                  <span className="font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {em.status}
                  </span>
                </div>
                <p className="text-stone-600">Location: {em.elderlyAddress}</p>
                <p className="text-stone-400 text-[11px]">Triggered: {em.triggeredAt}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-stone-400">
              No emergency incidents logged.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
