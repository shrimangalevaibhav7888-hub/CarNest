"use client";

import React from "react";
import { useCareNest } from "@/context/CareNestContext";
import { LandingPageView } from "@/features/landing/LandingPageView";
import { ElderlyDashboardView } from "@/features/dashboards/ElderlyDashboardView";
import { FamilyDashboardView } from "@/features/dashboards/FamilyDashboardView";
import { CaregiverDashboardView } from "@/features/dashboards/CaregiverDashboardView";
import { AdminDashboardView } from "@/features/dashboards/AdminDashboardView";
import { CaregiverSearchView } from "@/features/caregivers/CaregiverSearchView";
import { MedicineManagementView } from "@/features/medicines/MedicineManagementView";
import { DailyCareTrackingView } from "@/features/dailyCare/DailyCareTrackingView";
import { EmergencyHubView } from "@/features/emergency/EmergencyHubView";
import { AppointmentsView } from "@/features/appointments/AppointmentsView";
import { LocationSharingView } from "@/features/location/LocationSharingView";
import { FamilyTimelineView } from "@/features/timeline/FamilyTimelineView";
import { SubscriptionView } from "@/features/subscription/SubscriptionView";
import { TrustVerificationView } from "@/features/trust/TrustVerificationView";
import { HowItWorksView } from "@/features/howItWorks/HowItWorksView";
import { AuthView } from "@/features/auth/AuthView";

export default function Home() {
  const { activeView } = useCareNest();

  return (
    <div className="min-h-screen">
      {activeView === "HOME" && <LandingPageView />}
      {activeView === "ELDERLY_DASHBOARD" && <ElderlyDashboardView />}
      {activeView === "FAMILY_DASHBOARD" && <FamilyDashboardView />}
      {activeView === "CAREGIVER_DASHBOARD" && <CaregiverDashboardView />}
      {activeView === "ADMIN_DASHBOARD" && <AdminDashboardView />}
      {activeView === "CAREGIVER_SEARCH" && <CaregiverSearchView />}
      {activeView === "MEDICINES" && <MedicineManagementView />}
      {activeView === "DAILY_CARE" && <DailyCareTrackingView />}
      {activeView === "EMERGENCY" && <EmergencyHubView />}
      {activeView === "APPOINTMENTS" && <AppointmentsView />}
      {activeView === "LOCATION" && <LocationSharingView />}
      {activeView === "FAMILY_UPDATES" && <FamilyTimelineView />}
      {activeView === "SUBSCRIPTION" && <SubscriptionView />}
      {activeView === "TRUST_SAFETY" && <TrustVerificationView />}
      {activeView === "HOW_IT_WORKS" && <HowItWorksView />}
      {(activeView === "LOGIN" || activeView === "REGISTER" || activeView === "FORGOT_PASSWORD") && <AuthView />}
    </div>
  );
}
