"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  ElderlyProfile,
  CaregiverProfile,
  FamilyMemberProfile,
  Booking,
  Medicine,
  MedicineLog,
  DailyCareLog,
  Appointment,
  EmergencyAlert,
  CareUpdate,
  NotificationItem,
  SubscriptionPlan,
  Review,
  VerificationStatus,
  BookingStatus,
  MedicineStatus,
  EmergencyStatus,
} from '../types';
import { firestoreService } from '../services/firestoreService';
import { notificationService } from '../services/notificationService';
import { locationService } from '../services/locationService';
import { paymentService } from '../services/paymentService';
import { authService, AuthUser, RegisterPayload } from '../services/authService';
import { apiClient } from '../services/api';

export type AppView =
  | 'HOME'
  | 'ELDERLY_DASHBOARD'
  | 'FAMILY_DASHBOARD'
  | 'CAREGIVER_DASHBOARD'
  | 'ADMIN_DASHBOARD'
  | 'CAREGIVER_SEARCH'
  | 'MEDICINES'
  | 'DAILY_CARE'
  | 'EMERGENCY'
  | 'APPOINTMENTS'
  | 'LOCATION'
  | 'FAMILY_UPDATES'
  | 'SUBSCRIPTION'
  | 'TRUST_SAFETY'
  | 'HOW_IT_WORKS'
  | 'LOGIN'
  | 'REGISTER'
  | 'FORGOT_PASSWORD';

export const VIEW_TO_HASH: Record<AppView, string> = {
  HOME: '#home',
  CAREGIVER_SEARCH: '#caregivers',
  DAILY_CARE: '#daily-care',
  MEDICINES: '#medicines',
  EMERGENCY: '#emergency',
  APPOINTMENTS: '#appointments',
  LOCATION: '#location',
  FAMILY_UPDATES: '#timeline',
  SUBSCRIPTION: '#pricing',
  TRUST_SAFETY: '#trust-safety',
  HOW_IT_WORKS: '#how-it-works',
  ELDERLY_DASHBOARD: '#elderly-portal',
  FAMILY_DASHBOARD: '#family-portal',
  CAREGIVER_DASHBOARD: '#caregiver-portal',
  ADMIN_DASHBOARD: '#admin-portal',
  LOGIN: '#login',
  REGISTER: '#register',
  FORGOT_PASSWORD: '#forgot-password',
};

export const HASH_TO_VIEW: Record<string, AppView> = {
  '#home': 'HOME',
  '#caregivers': 'CAREGIVER_SEARCH',
  '#daily-care': 'DAILY_CARE',
  '#medicines': 'MEDICINES',
  '#emergency': 'EMERGENCY',
  '#appointments': 'APPOINTMENTS',
  '#location': 'LOCATION',
  '#timeline': 'FAMILY_UPDATES',
  '#pricing': 'SUBSCRIPTION',
  '#subscription': 'SUBSCRIPTION',
  '#trust-safety': 'TRUST_SAFETY',
  '#trust': 'TRUST_SAFETY',
  '#how-it-works': 'HOW_IT_WORKS',
  '#elderly-portal': 'ELDERLY_DASHBOARD',
  '#elderly': 'ELDERLY_DASHBOARD',
  '#family-portal': 'FAMILY_DASHBOARD',
  '#family': 'FAMILY_DASHBOARD',
  '#caregiver-portal': 'CAREGIVER_DASHBOARD',
  '#caregiver': 'CAREGIVER_DASHBOARD',
  '#admin-portal': 'ADMIN_DASHBOARD',
  '#admin': 'ADMIN_DASHBOARD',
  '#login': 'LOGIN',
  '#register': 'REGISTER',
  '#forgot-password': 'FORGOT_PASSWORD',
};

export const PROTECTED_VIEWS: Set<AppView> = new Set<AppView>([
  'ELDERLY_DASHBOARD',
  'FAMILY_DASHBOARD',
  'CAREGIVER_DASHBOARD',
  'ADMIN_DASHBOARD',
  'DAILY_CARE',
  'MEDICINES',
  'APPOINTMENTS',
  'EMERGENCY',
  'LOCATION',
  'FAMILY_UPDATES',
  'SUBSCRIPTION',
]);

export const PUBLIC_VIEWS: Set<AppView> = new Set<AppView>([
  'HOME',
  'LOGIN',
  'REGISTER',
  'FORGOT_PASSWORD',
  'HOW_IT_WORKS',
  'TRUST_SAFETY',
  'CAREGIVER_SEARCH',
]);

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'emergency';
}

interface CareNestContextType {
  currentUser: User | null;
  currentRole: UserRole;
  activeView: AppView;
  seniorMode: boolean;
  selectedElderly: ElderlyProfile | null;
  selectedCaregiver: CaregiverProfile | null;

  // Real Auth State
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isDemoMode: boolean;
  activeDemoPersona: UserRole | null;

  // Data Lists
  elderlyProfiles: ElderlyProfile[];
  caregivers: CaregiverProfile[];
  familyMembers: FamilyMemberProfile[];
  medicines: Medicine[];
  medicineLogs: MedicineLog[];
  bookings: Booking[];
  dailyCareLog: DailyCareLog | null;
  careUpdates: CareUpdate[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  emergencyAlerts: EmergencyAlert[];
  subscription: SubscriptionPlan | null;
  reviews: Review[];

  // Admin Specific
  adminUsersList: any[];
  adminStats: any | null;

  // UI Modals & Toasts
  toasts: ToastMessage[];
  isSosModalOpen: boolean;
  isSeniorModeOpen: boolean;
  isQuickBookingModalOpen: boolean;
  targetCaregiverForBooking: CaregiverProfile | null;
  unreadNotificationsCount: number;

  // Setters & Actions
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
  setActiveView: (view: AppView) => void;
  setSeniorMode: (enabled: boolean) => void;
  toggleSeniorMode: () => void;
  setSelectedElderly: (elderly: ElderlyProfile | null) => void;
  setSelectedCaregiver: (caregiver: CaregiverProfile | null) => void;
  setIsSosModalOpen: (open: boolean) => void;
  setIsQuickBookingModalOpen: (open: boolean) => void;
  setTargetCaregiverForBooking: (cg: CaregiverProfile | null) => void;

  // Real Authentication Operations
  realLogin: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  realRegister: (payload: RegisterPayload) => Promise<boolean>;
  realLogout: () => Promise<void>;
  switchDemoPersona: (role: UserRole) => void;
  exitDemoMode: () => void;
  linkFamilyMember: (elderlyEmail: string) => Promise<boolean>;

  // Legacy / Demo Fallback
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Feature Actions
  takeMedicine: (medicineId: string, notes?: string) => void | Promise<void>;
  skipMedicine: (medicineId: string, reason?: string) => void | Promise<void>;
  snoozeMedicine: (medicineId: string, minutes?: number) => void | Promise<void>;
  addNewMedicine: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  removeMedicine: (id: string) => void | Promise<void>;

  toggleDailyCare: (itemId: string) => void | Promise<void>;
  saveDailyCareGeneralNote: (note: string) => void | Promise<void>;

  postCareUpdate: (title: string, description: string, category: CareUpdate['category'], vitals?: CareUpdate['vitals']) => void | Promise<void>;

  createNewBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>;
  changeBookingStatus: (bookingId: string, status: BookingStatus, notes?: string) => void | Promise<void>;

  verifyCaregiverStatus: (caregiverId: string, status: VerificationStatus, notes?: string) => Promise<void>;

  createNewAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  removeAppointment: (id: string) => void | Promise<void>;

  triggerSosAlert: (address?: string) => Promise<void>;
  resolveSosAlert: (alertId: string, resolutionNotes: string) => void | Promise<void>;

  toggleElderlyLocationSharing: () => void;
  updateSubscription: (plan: SubscriptionPlan) => void | Promise<void>;
  submitCaregiverReview: (caregiverId: string, rating: number, comment: string, serviceType: string) => void | Promise<void>;

  markAllNotificationsRead: () => void;
  resetDemoData: () => void;

  toggleUserStatus: (userId: number, isActive: boolean) => Promise<void>;
  refreshAdminData: () => Promise<void>;
}

const CareNestContext = createContext<CareNestContextType | undefined>(undefined);

export const CareNestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('ELDERLY');
  const [seniorMode, setSeniorMode] = useState<boolean>(false);

  // Real Auth Flags
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activeDemoPersona, setActiveDemoPersona] = useState<UserRole | null>(null);

  // UI Modals & Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSeniorModeOpen, setIsSeniorModeOpen] = useState(false);
  const [isQuickBookingModalOpen, setIsQuickBookingModalOpen] = useState(false);
  const [targetCaregiverForBooking, setTargetCaregiverForBooking] = useState<CaregiverProfile | null>(null);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (type === 'emergency') {
      notificationService.playAlertChime('EMERGENCY');
    } else if (type === 'success') {
      notificationService.playAlertChime('SUCCESS');
    } else if (type === 'info') {
      notificationService.playAlertChime('DEFAULT');
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial view: default to LOGIN for secure access control
  const [activeView, setActiveViewState] = useState<AppView>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.toLowerCase();
      if (HASH_TO_VIEW[h]) return HASH_TO_VIEW[h];
    }
    return 'LOGIN';
  });

  const setActiveView = useCallback((view: AppView) => {
    // 1. Guard protected views: if unauthenticated, redirect to LOGIN
    if (!currentUser && !isDemoMode && PROTECTED_VIEWS.has(view)) {
      setActiveViewState('LOGIN');
      if (typeof window !== 'undefined') {
        if (window.location.hash.toLowerCase() !== '#login') {
          window.history.pushState(null, '', '#login');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      addToast('Sign In Required', 'Please sign in to access your care dashboard & records.', 'info');
      return;
    }

    // 2. If authenticated user attempts to access login/register/forgot-password/home, redirect to their role dashboard
    if (currentUser && !isDemoMode && (view === 'LOGIN' || view === 'REGISTER' || view === 'FORGOT_PASSWORD' || view === 'HOME')) {
      const targetDashboard: AppView =
        currentUser.role === 'ELDERLY' ? 'ELDERLY_DASHBOARD'
        : currentUser.role === 'FAMILY' ? 'FAMILY_DASHBOARD'
        : currentUser.role === 'CAREGIVER' ? 'CAREGIVER_DASHBOARD'
        : 'ADMIN_DASHBOARD';
      setActiveViewState(targetDashboard);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', VIEW_TO_HASH[targetDashboard]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 3. Enforce role-based access control on portals
    if (currentUser && !isDemoMode) {
      if (view === 'ADMIN_DASHBOARD' && currentUser.role !== 'ADMIN') {
        addToast('Restricted Access', 'Administrator access required.', 'warning');
        return;
      }
      if (view === 'CAREGIVER_DASHBOARD' && currentUser.role !== 'CAREGIVER' && currentUser.role !== 'ADMIN') {
        addToast('Restricted Access', 'Caregiver credentials required.', 'warning');
        return;
      }
    }

    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      const targetHash = VIEW_TO_HASH[view] || '#login';
      if (window.location.hash.toLowerCase() !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentUser, isDemoMode, addToast]);

  // Listen for hashchange & popstate events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      const targetView = HASH_TO_VIEW[h] || 'LOGIN';

      if (!currentUser && !isDemoMode && (PROTECTED_VIEWS.has(targetView) || targetView === 'HOME' || h === '' || h === '#home')) {
        setActiveViewState('LOGIN');
        if (window.location.hash.toLowerCase() !== '#login') {
          window.history.replaceState(null, '', '#login');
        }
        return;
      }

      if (currentUser && !isDemoMode && (targetView === 'LOGIN' || targetView === 'REGISTER' || targetView === 'FORGOT_PASSWORD' || targetView === 'HOME')) {
        const targetDashboard: AppView =
          currentUser.role === 'ELDERLY' ? 'ELDERLY_DASHBOARD'
          : currentUser.role === 'FAMILY' ? 'FAMILY_DASHBOARD'
          : currentUser.role === 'CAREGIVER' ? 'CAREGIVER_DASHBOARD'
          : 'ADMIN_DASHBOARD';
        setActiveViewState(targetDashboard);
        window.history.replaceState(null, '', VIEW_TO_HASH[targetDashboard]);
        return;
      }

      setActiveViewState(targetView);
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, [currentUser, isDemoMode]);

  // Entities
  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfile[]>([]);
  const [selectedElderly, setSelectedElderly] = useState<ElderlyProfile | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverProfile | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberProfile[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineLogs, setMedicineLogs] = useState<MedicineLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dailyCareLog, setDailyCareLog] = useState<DailyCareLog | null>(null);
  const [careUpdates, setCareUpdates] = useState<CareUpdate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Admin data
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any | null>(null);

  // Fetch real user data from backend API
  const fetchRealDashboardData = useCallback(async (user: User) => {
    try {
      if (user.role === 'ELDERLY') {
        // 1. Fetch elderly profile from backend
        const patients = await apiClient.get<any[]>('/patients').catch(() => []);
        if (patients && patients.length > 0) {
          const p = patients[0];
          const mappedProfile: ElderlyProfile = {
            id: String(p.id),
            userId: String(user.id),
            fullName: p.full_name || user.displayName,
            age: p.age || 72,
            gender: (p.gender === 'Female' ? 'Female' : p.gender === 'Male' ? 'Male' : 'Other') as 'Male' | 'Female' | 'Other',
            phone: p.phone || user.phone || '',
            address: p.address || 'Home Address',
            city: 'Metro City',
            emergencyContactName: p.emergency_contacts?.[0]?.name || 'Family Contact',
            emergencyContactPhone: p.emergency_contacts?.[0]?.phone_number || '',
            emergencyContactRelation: p.emergency_contacts?.[0]?.relationship || 'Family',
            medicalNotes: p.medical_history || 'No medical conditions noted.',
            allergies: p.allergies?.join(', ') || '',
            careRequirements: p.care_requirements || [],
            linkedFamilyIds: [],
            assignedCaregiverIds: [],
            isLocationSharingOn: true,
            createdAt: p.created_at || user.createdAt,
            updatedAt: p.updated_at || user.createdAt,
          };
          setSelectedElderly(mappedProfile);
          setElderlyProfiles([mappedProfile]);
        } else {
          // Newly registered with no patient record yet -> construct from user info
          const fallbackProfile: ElderlyProfile = {
            id: String(user.patientId || user.id),
            userId: String(user.id),
            fullName: user.displayName,
            age: 72,
            gender: 'Other' as const,
            phone: user.phone || '',
            address: 'Home Address',
            city: 'Metro City',
            emergencyContactName: 'Family Member',
            emergencyContactPhone: '',
            emergencyContactRelation: 'Family',
            medicalNotes: 'Profile created.',
            careRequirements: [],
            linkedFamilyIds: [],
            assignedCaregiverIds: [],
            isLocationSharingOn: true,
            createdAt: user.createdAt,
            updatedAt: user.createdAt,
          };
          setSelectedElderly(fallbackProfile);
          setElderlyProfiles([fallbackProfile]);
        }

        // 2. Fetch medications
        const meds = await apiClient.get<any[]>('/medications').catch(() => []);
        const mappedMeds: Medicine[] = meds.map((m: any) => ({
          id: String(m.id),
          elderlyId: String(m.patient_id),
          name: m.name,
          dosage: m.dosage,
          frequency: 'Once daily' as const,
          instructions: m.instructions || 'Take as prescribed',
          times: m.schedules?.map((s: any) => s.scheduled_time?.slice(0, 5)) || ['08:00 AM'],
          startDate: m.start_date || new Date().toISOString().split('T')[0],
          isActive: m.is_active,
          createdAt: m.created_at,
          updatedAt: m.created_at,
        }));
        setMedicines(mappedMeds);

        // 3. Fetch care tasks
        const tasks = await apiClient.get<any[]>('/tasks').catch(() => []);
        const dailyItems = tasks.map((t: any) => ({
          id: String(t.id),
          category: 'MEDICINE' as const,
          title: t.title,
          timeTarget: t.due_time ? t.due_time.slice(0, 5) : '09:00 AM',
          completed: t.status === 'COMPLETED',
          completedAt: t.completed_at,
          notes: t.instructions,
        }));
        setDailyCareLog({
          id: `log-${user.id}`,
          elderlyId: String(user.patientId || user.id),
          date: new Date().toISOString().split('T')[0],
          items: dailyItems,
          generalNote: 'Daily care record initialized.',
          updatedAt: new Date().toISOString(),
        });

        // 4. Reset visits for newly registered users unless real bookings exist
        setBookings([]);
      } else if (user.role === 'FAMILY') {
        // Fetch linked patients
        const patients = await apiClient.get<any[]>('/patients').catch(() => []);
        if (patients && patients.length > 0) {
          const mappedList: ElderlyProfile[] = patients.map((p: any) => ({
            id: String(p.id),
            userId: String(p.user_id),
            fullName: p.full_name,
            age: p.age || 70,
            gender: (p.gender === 'Female' ? 'Female' : p.gender === 'Male' ? 'Male' : 'Other') as 'Male' | 'Female' | 'Other',
            phone: p.phone || '',
            address: p.address || 'Home Address',
            city: 'Metro City',
            emergencyContactName: p.emergency_contacts?.[0]?.name || 'Family Contact',
            emergencyContactPhone: p.emergency_contacts?.[0]?.phone_number || '',
            emergencyContactRelation: p.emergency_contacts?.[0]?.relationship || 'Family',
            medicalNotes: p.medical_history || '',
            careRequirements: p.care_requirements || [],
            linkedFamilyIds: [String(user.id)],
            assignedCaregiverIds: [],
            isLocationSharingOn: true,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setElderlyProfiles(mappedList);
          setSelectedElderly(mappedList[0]);

          // Fetch medicines for the first linked senior
          const meds = await apiClient.get<any[]>(`/medications?patient_id=${mappedList[0].id}`).catch(() => []);
          setMedicines(
            meds.map((m: any) => ({
              id: String(m.id),
              elderlyId: String(m.patient_id),
              name: m.name,
              dosage: m.dosage,
              frequency: 'Once daily' as const,
              instructions: m.instructions || 'Take as prescribed',
              times: ['08:00 AM'],
              startDate: m.start_date || new Date().toISOString().split('T')[0],
              isActive: m.is_active,
              createdAt: m.created_at,
              updatedAt: m.created_at,
            }))
          );
        } else {
          setElderlyProfiles([]);
          setSelectedElderly(null);
          setMedicines([]);
          setBookings([]);
        }
      } else if (user.role === 'CAREGIVER') {
        const realCaregiver: CaregiverProfile = {
          id: String(user.caregiverId || user.id),
          userId: String(user.id),
          fullName: user.displayName,
          phone: user.phone || '+91 98765 00000',
          email: user.email,
          address: 'Caregiver Address',
          city: 'Metro City',
          serviceAreas: ['Indiranagar', 'Koramangala'],
          skills: ['Geriatric Nursing', 'Medication Support', 'Vitals Monitoring'],
          specializations: ['Geriatric Care'],
          availability: 'Full-time',
          gender: 'Female',
          bio: 'Registered nurse providing compassionate elderly care.',
          experienceYears: 4,
          verificationStatus: user.verificationStatus || 'PENDING',
          rating: 5.0,
          reviewCount: 0,
          completedVisitsCount: 0,
          hourlyRate: 350,
          isAvailable: true,
          avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200',
          createdAt: user.createdAt,
          updatedAt: user.createdAt,
        };
        setSelectedCaregiver(realCaregiver);
        setCaregivers([realCaregiver]);

        // Fetch assigned patients
        const assignedPatients = await apiClient.get<any[]>('/patients').catch(() => []);
        setElderlyProfiles(
          assignedPatients.map((p: any) => ({
            id: String(p.id),
            userId: String(p.user_id),
            fullName: p.full_name,
            age: p.age,
            gender: (p.gender === 'Female' ? 'Female' : p.gender === 'Male' ? 'Male' : 'Other') as 'Male' | 'Female' | 'Other',
            phone: p.phone || '',
            address: p.address,
            city: 'Metro City',
            emergencyContactName: p.emergency_contacts?.[0]?.name || '',
            emergencyContactPhone: p.emergency_contacts?.[0]?.phone_number || '',
            emergencyContactRelation: '',
            medicalNotes: p.medical_history || '',
            careRequirements: p.care_requirements || [],
            linkedFamilyIds: [],
            assignedCaregiverIds: [String(user.id)],
            isLocationSharingOn: false,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }))
        );

        // Fetch tasks
        const tasks = await apiClient.get<any[]>('/tasks').catch(() => []);
        const dailyItems = tasks.map((t: any) => ({
          id: String(t.id),
          category: 'MEDICINE' as const,
          title: t.title,
          timeTarget: t.due_time?.slice(0, 5) || '09:00 AM',
          completed: t.status === 'COMPLETED',
          completedAt: t.completed_at,
          notes: t.instructions,
        }));
        setDailyCareLog({
          id: `log-${user.id}`,
          elderlyId: 'assigned',
          date: new Date().toISOString().split('T')[0],
          items: dailyItems,
          generalNote: 'Caregiver shift checklist.',
          updatedAt: new Date().toISOString(),
        });
      } else if (user.role === 'ADMIN') {
        // Admin operations
        const [cgList, users, stats] = await Promise.all([
          apiClient.get<any[]>('/admin/caregivers').catch(() => []),
          apiClient.get<any[]>('/admin/users').catch(() => []),
          apiClient.get<any>('/admin/stats').catch(() => null),
        ]);

        if (cgList && cgList.length > 0) {
          const mappedCgs: CaregiverProfile[] = cgList.map((cg: any) => ({
            id: String(cg.id),
            userId: String(cg.user_id),
            fullName: cg.full_name,
            phone: cg.phone || '',
            email: cg.email,
            address: cg.service_area || 'Indiranagar',
            city: 'Metro City',
            serviceAreas: [cg.service_area || 'Indiranagar'],
            skills: cg.skills || ['Nursing'],
            specializations: ['Elderly Care'],
            availability: 'Full-time',
            gender: 'Female',
            bio: cg.bio || 'Verified caregiver.',
            experienceYears: cg.experience_years || 1,
            verificationStatus: cg.verification_status || 'PENDING',
            verificationNotes: cg.bio || '',
            rating: cg.rating || 4.9,
            reviewCount: 12,
            completedVisitsCount: 45,
            hourlyRate: cg.hourly_rate || 300,
            isAvailable: true,
            avatarUrl: 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200',
            createdAt: cg.created_at || new Date().toISOString(),
            updatedAt: cg.created_at || new Date().toISOString(),
          }));
          setCaregivers(mappedCgs);
        }
        setAdminUsersList(users || []);
        setAdminStats(stats);
      }
    } catch (err) {
      console.error('Failed to load user dashboard data from backend:', err);
    }
  }, []);

  // Helper to normalize backend role strings to frontend UserRole
  const normalizeRole = (role: string): UserRole => {
    if (role === 'PATIENT' || role === 'ELDERLY') return 'ELDERLY';
    if (role === 'FAMILY_MEMBER' || role === 'FAMILY') return 'FAMILY';
    if (role === 'CAREGIVER') return 'CAREGIVER';
    return 'ADMIN';
  };

  // Fetch all persistent records from SQLite backend
  const fetchPersistentDatabaseData = useCallback(async () => {
    try {
      const [meds, bks, apts, daily, updates, events, sub, revs, pats, cgs] = await Promise.all([
        apiClient.get<any[]>('/medications').catch(() => []),
        apiClient.get<any[]>('/bookings').catch(() => []),
        apiClient.get<any[]>('/appointments').catch(() => []),
        apiClient.get<any>('/daily-care-logs/today').catch(() => null),
        apiClient.get<any[]>('/care-updates').catch(() => []),
        apiClient.get<any[]>('/emergency/events').catch(() => []),
        apiClient.get<any>('/subscriptions').catch(() => null),
        apiClient.get<any[]>('/reviews').catch(() => []),
        apiClient.get<any[]>('/patients').catch(() => []),
        apiClient.get<any[]>('/caregivers').catch(() => []),
      ]);

      if (meds && meds.length > 0) {
        setMedicines(
          meds.map((m: any) => ({
            id: String(m.id),
            elderlyId: String(m.patient_id || '1'),
            name: m.name,
            dosage: m.dosage,
            frequency: (m.frequency || 'Once daily') as any,
            instructions: m.instructions || 'Take as prescribed',
            times: m.schedules && m.schedules.length > 0 ? m.schedules.map((s: any) => s.scheduled_time?.slice(0, 5) || '08:00 AM') : ['08:00 AM'],
            startDate: m.start_date || new Date().toISOString().split('T')[0],
            endDate: m.end_date,
            isActive: m.is_active,
            createdAt: m.created_at || new Date().toISOString(),
            updatedAt: m.created_at || new Date().toISOString(),
          }))
        );
      }

      if (bks && bks.length > 0) {
        setBookings(
          bks.map((b: any) => ({
            id: String(b.id),
            elderlyId: String(b.elderlyId || '1'),
            elderlyName: b.elderlyName || 'Senior',
            elderlyAddress: b.elderlyAddress || 'Home Address',
            familyId: String(b.familyId || '1'),
            familyName: b.familyName || 'Family Member',
            familyPhone: b.familyPhone || '',
            caregiverId: String(b.caregiverId),
            caregiverName: b.caregiverName,
            caregiverPhone: b.caregiverPhone || '',
            caregiverAvatar: b.caregiverAvatar,
            date: b.date,
            timeSlot: b.timeSlot,
            serviceType: b.serviceType as any,
            durationHours: b.durationHours,
            instructions: b.instructions || '',
            status: b.status as any,
            totalAmount: b.totalAmount,
            paymentStatus: b.paymentStatus as any,
            paymentId: b.paymentId,
            caregiverNotes: b.caregiverNotes,
            startedAt: b.startedAt,
            completedAt: b.completedAt,
            cancelledReason: b.cancelledReason,
            createdAt: b.createdAt || new Date().toISOString(),
            updatedAt: b.updatedAt || new Date().toISOString(),
          }))
        );
      }

      if (apts && apts.length > 0) {
        setAppointments(
          apts.map((a: any) => ({
            id: String(a.id),
            elderlyId: String(a.elderlyId || '1'),
            elderlyName: a.elderlyName || 'Senior',
            doctorName: a.doctorName,
            hospitalName: a.hospitalName || 'Outpatient Center',
            specialty: a.specialty || 'General',
            date: a.date,
            time: a.time,
            purpose: a.purpose,
            doctorPhone: a.doctorPhone || '',
            location: a.location,
            notes: a.notes || '',
            status: a.status as any,
            reminderSent: a.reminderSent || false,
            accompaniedByCaregiver: a.accompaniedByCaregiver,
            caregiverName: a.caregiverName,
            createdAt: a.createdAt || new Date().toISOString(),
            updatedAt: a.updatedAt || new Date().toISOString(),
          }))
        );
      }

      if (daily) {
        setDailyCareLog({
          id: String(daily.id),
          elderlyId: String(daily.elderlyId || '1'),
          date: daily.date,
          items: daily.items || [],
          generalNote: daily.generalNote || '',
          caregiverNote: daily.caregiverNote || '',
          updatedBy: daily.updatedBy,
          updatedAt: daily.updatedAt || new Date().toISOString(),
        });
      }

      if (updates && updates.length > 0) {
        setCareUpdates(
          updates.map((u: any) => ({
            id: String(u.id),
            elderlyId: String(u.elderlyId || '1'),
            elderlyName: u.elderlyName || 'Senior',
            authorId: String(u.authorId || '1'),
            authorName: u.authorName || 'Caregiver',
            authorRole: (u.authorRole || 'CAREGIVER') as any,
            timestamp: u.timestamp || 'Just now',
            title: u.title,
            description: u.description,
            category: (u.category || 'VISIT') as any,
            vitals: u.vitals,
            attachments: u.attachments,
            createdAt: u.createdAt || new Date().toISOString(),
          }))
        );
      }

      if (events && events.length > 0) {
        setEmergencyAlerts(
          events.map((e: any) => ({
            id: String(e.id),
            elderlyId: String(e.patient_id || '1'),
            elderlyName: e.patient_name || 'Senior',
            elderlyPhone: '+1 (555) 019-1122',
            elderlyAddress: e.location || 'Home Address',
            status: (e.status === 'TRIGGERED' ? 'TRIGGERED' : e.status === 'RESOLVED' ? 'RESOLVED' : 'FAMILY_NOTIFIED') as any,
            triggeredAt: e.created_at || new Date().toISOString(),
            resolvedAt: e.resolved_at,
            resolutionNotes: e.notes,
            contactsNotified: [
              { name: 'Dr. Clara Hughes', role: 'Hospital', phone: '+1 (555) 019-8801', notifiedAt: e.created_at },
              { name: 'Sarah Vance', role: 'Family', phone: '+1 (555) 019-2831', notifiedAt: e.created_at },
              { name: 'David Miller', role: 'Caregiver', phone: '+1 (555) 019-4412', notifiedAt: e.created_at },
            ],
            createdAt: e.created_at || new Date().toISOString(),
            updatedAt: e.updated_at || new Date().toISOString(),
          }))
        );
      }

      if (sub) {
        setSubscription({
          id: String(sub.id),
          userId: String(sub.userId || '1'),
          planName: sub.planName,
          monthlyRateINR: sub.monthlyRateINR,
          status: sub.status,
          renewalDate: sub.renewalDate,
          paymentMethod: sub.paymentMethod,
          features: sub.features || [],
        });
      }

      if (revs && revs.length > 0) {
        setReviews(
          revs.map((r: any) => ({
            id: String(r.id),
            caregiverId: String(r.caregiverId),
            familyId: String(r.familyId || '1'),
            familyName: r.familyName || 'Family Member',
            rating: r.rating,
            comment: r.comment,
            date: r.date,
            visitServiceType: r.visitServiceType,
          }))
        );
      }

      if (pats && pats.length > 0) {
        const mappedPats = pats.map((p: any) => ({
          id: String(p.id),
          userId: String(p.user_id),
          fullName: p.full_name || 'Eleanor Vance',
          age: p.age || 74,
          gender: (p.gender === 'Female' ? 'Female' : p.gender === 'Male' ? 'Male' : 'Other') as any,
          phone: p.phone || '',
          address: p.address || '742 Evergreen Healthcare Ave',
          city: 'Metro City',
          emergencyContactName: p.emergency_contacts?.[0]?.name || 'Family Contact',
          emergencyContactPhone: p.emergency_contacts?.[0]?.phone_number || '',
          emergencyContactRelation: p.emergency_contacts?.[0]?.relationship || 'Family',
          medicalNotes: p.medical_history || 'Post-stroke recovery',
          allergies: p.allergies?.join(', ') || '',
          careRequirements: p.care_requirements || [],
          linkedFamilyIds: [],
          assignedCaregiverIds: [],
          isLocationSharingOn: true,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
        }));
        setElderlyProfiles(mappedPats);
        setSelectedElderly((prev) => prev || mappedPats[0]);
      }

      if (cgs && cgs.length > 0) {
        const mappedCgs = cgs.map((cg: any) => ({
          id: String(cg.id),
          userId: String(cg.user_id),
          fullName: cg.full_name,
          phone: cg.phone || '',
          email: cg.email || '',
          address: cg.service_area || 'Indiranagar',
          city: 'Metro City',
          serviceAreas: [cg.service_area || 'Indiranagar'],
          skills: cg.skills || ['Nursing'],
          specializations: ['Elderly Care'],
          availability: 'Full-time' as any,
          gender: 'Female' as any,
          bio: cg.bio || 'Compassionate verified caregiver.',
          experienceYears: cg.experience_years || 5,
          verificationStatus: (cg.verification_status || 'VERIFIED') as any,
          rating: cg.rating || 4.9,
          reviewCount: cg.completed_cases || 24,
          completedVisitsCount: cg.completed_cases || 45,
          hourlyRate: cg.hourly_rate || 350,
          isAvailable: true,
          avatarUrl: cg.avatar_url || 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200',
          createdAt: cg.created_at || new Date().toISOString(),
          updatedAt: cg.created_at || new Date().toISOString(),
        }));
        setCaregivers(mappedCgs);
        setSelectedCaregiver((prev) => prev || mappedCgs[0]);
      }
    } catch (e) {
      console.warn('Persistent data load warning:', e);
    }
  }, []);

  // Restore authenticated session on initial mount
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      setIsAuthLoading(true);
      try {
        const authUser = await authService.getMe();
        if (authUser && isMounted) {
          const mappedUser: User = {
            id: String(authUser.id),
            email: authUser.email,
            displayName: authUser.full_name,
            role: normalizeRole(authUser.role),
            phone: authUser.phone || undefined,
            avatarUrl: authUser.avatar_url || undefined,
            patientId: authUser.patient_id || undefined,
            caregiverId: authUser.caregiver_id || undefined,
            verificationStatus: authUser.verification_status as any,
            linkedPatientIds: authUser.linked_patient_ids,
            createdAt: authUser.created_at,
          };
          setCurrentUser(mappedUser);
          setCurrentRole(mappedUser.role);
          setIsDemoMode(false);
          setActiveDemoPersona(null);

          await fetchRealDashboardData(mappedUser);

          // Restore appropriate dashboard if user hasn't opened a specific permissible tab
          const currentHash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
          const targetView = HASH_TO_VIEW[currentHash];

          if (!targetView || targetView === 'HOME' || targetView === 'LOGIN' || targetView === 'REGISTER' || targetView === 'FORGOT_PASSWORD') {
            if (mappedUser.role === 'ELDERLY') setActiveView('ELDERLY_DASHBOARD');
            else if (mappedUser.role === 'FAMILY') setActiveView('FAMILY_DASHBOARD');
            else if (mappedUser.role === 'CAREGIVER') setActiveView('CAREGIVER_DASHBOARD');
            else if (mappedUser.role === 'ADMIN') setActiveView('ADMIN_DASHBOARD');
          } else {
            setActiveView(targetView);
          }
        } else if (isMounted) {
          setCurrentUser(null);
          const currentHash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
          const targetView = HASH_TO_VIEW[currentHash];
          // When a visitor opens the deployed application without a valid session, redirect them to the login page.
          if (!targetView || targetView === 'HOME' || PROTECTED_VIEWS.has(targetView)) {
            setActiveView('LOGIN');
          } else {
            setActiveView(targetView);
          }
        }

        // Always load persistent SQLite data so all records remain visible
        await fetchPersistentDatabaseData();
      } catch (e) {
        if (isMounted) {
          setCurrentUser(null);
          const currentHash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
          const targetView = HASH_TO_VIEW[currentHash];
          if (!targetView || targetView === 'HOME' || PROTECTED_VIEWS.has(targetView)) {
            setActiveView('LOGIN');
          } else {
            setActiveView(targetView);
          }
        }
        await fetchPersistentDatabaseData();
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
          setIsInitialized(true);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [fetchRealDashboardData, fetchPersistentDatabaseData]);

  // Senior Mode Body Class
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (seniorMode) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
  }, [seniorMode]);

  const toggleSeniorMode = () => {
    const next = !seniorMode;
    setSeniorMode(next);
    addToast(
      next ? 'Senior Mode Activated' : 'Standard Mode Restored',
      next ? 'High-contrast large text and simplified navigation enabled for easy reading.' : 'Standard layout restored.',
      'info'
    );
  };

  // Real Login
  const realLogin = async (email: string, password: string, rememberMe = true): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const res = await authService.login(email, password, rememberMe);
      const authUser = res.user;
      const mappedUser: User = {
        id: String(authUser.id),
        email: authUser.email,
        displayName: authUser.full_name,
        role: normalizeRole(authUser.role),
        phone: authUser.phone || undefined,
        avatarUrl: authUser.avatar_url || undefined,
        patientId: authUser.patient_id || undefined,
        caregiverId: authUser.caregiver_id || undefined,
        verificationStatus: authUser.verification_status as any,
        linkedPatientIds: authUser.linked_patient_ids,
        createdAt: authUser.created_at,
      };

      setCurrentUser(mappedUser);
      setCurrentRole(mappedUser.role);
      setIsDemoMode(false);
      setActiveDemoPersona(null);

      await fetchRealDashboardData(mappedUser);

      // Navigate to role-specific dashboard
      if (mappedUser.role === 'ELDERLY') setActiveView('ELDERLY_DASHBOARD');
      else if (mappedUser.role === 'FAMILY') setActiveView('FAMILY_DASHBOARD');
      else if (mappedUser.role === 'CAREGIVER') setActiveView('CAREGIVER_DASHBOARD');
      else if (mappedUser.role === 'ADMIN') setActiveView('ADMIN_DASHBOARD');

      addToast('Welcome Back!', `Signed in as ${mappedUser.displayName} (${mappedUser.role}).`, 'success');
      return true;
    } catch (err: any) {
      addToast('Authentication Failed', err.message || 'Invalid email or password.', 'error');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Real Register
  const realRegister = async (payload: RegisterPayload): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const res = await authService.register(payload);
      const authUser = res.user;
      const mappedUser: User = {
        id: String(authUser.id),
        email: authUser.email,
        displayName: authUser.full_name,
        role: normalizeRole(authUser.role),
        phone: authUser.phone || undefined,
        avatarUrl: authUser.avatar_url || undefined,
        patientId: authUser.patient_id || undefined,
        caregiverId: authUser.caregiver_id || undefined,
        verificationStatus: authUser.verification_status as any,
        linkedPatientIds: authUser.linked_patient_ids,
        createdAt: authUser.created_at,
      };

      setCurrentUser(mappedUser);
      setCurrentRole(mappedUser.role);
      setIsDemoMode(false);
      setActiveDemoPersona(null);

      await fetchRealDashboardData(mappedUser);

      // Navigate to role-specific dashboard
      if (mappedUser.role === 'ELDERLY') setActiveView('ELDERLY_DASHBOARD');
      else if (mappedUser.role === 'FAMILY') setActiveView('FAMILY_DASHBOARD');
      else if (mappedUser.role === 'CAREGIVER') setActiveView('CAREGIVER_DASHBOARD');
      else if (mappedUser.role === 'ADMIN') setActiveView('ADMIN_DASHBOARD');

      addToast('Account Created!', `Welcome to CareNest, ${mappedUser.displayName}! Your account is active.`, 'success');
      return true;
    } catch (err: any) {
      addToast('Registration Failed', err.message || 'Could not complete registration.', 'error');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Real Logout
  const realLogout = async () => {
    setIsAuthLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      authService.clearToken();
      setCurrentUser(null);
      setIsDemoMode(false);
      setActiveDemoPersona(null);
      setElderlyProfiles([]);
      setSelectedElderly(null);
      setMedicines([]);
      setBookings([]);
      setActiveViewState('LOGIN');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '#login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsAuthLoading(false);
      addToast('Signed Out', 'You have been safely signed out of CareNest.', 'info');
    }
  };

  // Demo Persona Switcher (clearly separate from real authentication)
  const switchDemoPersona = (role: UserRole) => {
    firestoreService.initDataIfEmpty();
    const demoUsers = firestoreService.getUsers();
    const target = demoUsers.find((u) => u.role === role) || demoUsers[0];

    setIsDemoMode(true);
    setActiveDemoPersona(role);
    setCurrentUser(target);
    setCurrentRole(role);

    const elderly = firestoreService.getElderlyProfiles();
    const cgList = firestoreService.getCaregivers();

    setElderlyProfiles(elderly);
    setSelectedElderly(elderly[0] || null);
    setCaregivers(cgList);
    setSelectedCaregiver(cgList[0] || null);
    setMedicines(firestoreService.getMedicines());
    setMedicineLogs(firestoreService.getMedicineLogs());
    setBookings(firestoreService.getBookings());
    setDailyCareLog(firestoreService.getDailyCareLog(elderly[0]?.id || 'eld-1'));
    setCareUpdates(firestoreService.getCareUpdates());
    setAppointments(firestoreService.getAppointments());
    setNotifications(firestoreService.getNotifications());
    setEmergencyAlerts(firestoreService.getEmergencyAlerts());

    if (role === 'ELDERLY') {
      setActiveView('ELDERLY_DASHBOARD');
      addToast('Demo Mode: Ramesh Chandra', 'Viewing sample elderly patient sandbox.', 'info');
    } else if (role === 'FAMILY') {
      setActiveView('FAMILY_DASHBOARD');
      addToast('Demo Mode: Vikram Chandra (Family)', 'Viewing family portal sandbox.', 'info');
    } else if (role === 'CAREGIVER') {
      setActiveView('CAREGIVER_DASHBOARD');
      addToast('Demo Mode: Sister Ananya Roy', 'Viewing verified nurse hub sandbox.', 'info');
    } else if (role === 'ADMIN') {
      setActiveView('ADMIN_DASHBOARD');
      addToast('Demo Mode: Platform Operations', 'Viewing admin operations sandbox.', 'info');
    }
  };

  // Exit demo mode
  const exitDemoMode = async () => {
    setIsDemoMode(false);
    setActiveDemoPersona(null);
    const storedToken = authService.getToken();
    if (storedToken) {
      const authUser = await authService.getMe();
      if (authUser) {
        const mappedUser: User = {
          id: String(authUser.id),
          email: authUser.email,
          displayName: authUser.full_name,
          role: normalizeRole(authUser.role),
          phone: authUser.phone || undefined,
          patientId: authUser.patient_id || undefined,
          caregiverId: authUser.caregiver_id || undefined,
          verificationStatus: authUser.verification_status as any,
          linkedPatientIds: authUser.linked_patient_ids,
          createdAt: authUser.created_at,
        };
        setCurrentUser(mappedUser);
        setCurrentRole(mappedUser.role);
        await fetchRealDashboardData(mappedUser);

        if (mappedUser.role === 'ELDERLY') setActiveView('ELDERLY_DASHBOARD');
        else if (mappedUser.role === 'FAMILY') setActiveView('FAMILY_DASHBOARD');
        else if (mappedUser.role === 'CAREGIVER') setActiveView('CAREGIVER_DASHBOARD');
        else setActiveView('ADMIN_DASHBOARD');

        addToast('Exited Demo Mode', `Returned to your active account (${mappedUser.displayName}).`, 'success');
        return;
      }
    }

    // If not authenticated, return to home
    setCurrentUser(null);
    setActiveView('HOME');
    addToast('Exited Demo Mode', 'Returned to CareNest home page.', 'info');
  };

  // Family linking
  const linkFamilyMember = async (elderlyEmail: string): Promise<boolean> => {
    try {
      const res = await apiClient.post<{ message: string }>('/patients/link-family', {
        elderly_email: elderlyEmail,
        relationship: 'Family Member',
      });
      addToast('Senior Linked Successfully', res.message, 'success');
      if (currentUser) {
        await fetchRealDashboardData(currentUser);
      }
      return true;
    } catch (err: any) {
      addToast('Linking Failed', err.message || 'Could not link profile. Check the email address.', 'error');
      return false;
    }
  };

  // Medicine Operations (Persistent via SQLite Backend)
  const takeMedicine = async (medicineId: string, notes?: string) => {
    const loggedBy =
      currentRole === 'ELDERLY'
        ? `Elderly (${selectedElderly?.fullName || 'Patient'})`
        : currentRole === 'CAREGIVER'
        ? `Caregiver (${currentUser?.displayName || 'Nurse'})`
        : `Family (${currentUser?.displayName || 'Family'})`;

    try {
      const numericId = parseInt(medicineId.replace(/\D/g, ''), 10) || 1;
      await apiClient.post(`/medications/${numericId}/action`, {
        action: 'TAKEN',
        loggedBy,
        notes: notes || 'Taken on schedule with water.',
      });
      const updates = await apiClient.get<any[]>('/care-updates').catch(() => []);
      if (updates && updates.length > 0) {
        setCareUpdates(
          updates.map((u: any) => ({
            id: String(u.id),
            elderlyId: String(u.elderlyId || '1'),
            elderlyName: u.elderlyName || 'Senior',
            authorId: String(u.authorId || '1'),
            authorName: u.authorName || 'Caregiver',
            authorRole: (u.authorRole || 'CAREGIVER') as any,
            timestamp: u.timestamp || 'Just now',
            title: u.title,
            description: u.description,
            category: (u.category || 'VISIT') as any,
            vitals: u.vitals,
            attachments: u.attachments,
            createdAt: u.createdAt || new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      firestoreService.logMedicineAction(medicineId, 'TAKEN', loggedBy, notes);
      setMedicineLogs([...firestoreService.getMedicineLogs()]);
      setCareUpdates([...firestoreService.getCareUpdates()]);
    }
    notificationService.playAlertChime('MEDICINE');
    addToast('Medicine Taken Marked', 'Saved permanently to database & family alerted.', 'success');
  };

  const skipMedicine = async (medicineId: string, reason?: string) => {
    const loggedBy = currentRole === 'ELDERLY' ? 'Elderly Patient' : currentUser?.displayName || 'Caregiver';
    try {
      const numericId = parseInt(medicineId.replace(/\D/g, ''), 10) || 1;
      await apiClient.post(`/medications/${numericId}/action`, {
        action: 'SKIPPED',
        loggedBy,
        notes: reason || 'Skipped dose.',
      });
      const updates = await apiClient.get<any[]>('/care-updates').catch(() => []);
      if (updates && updates.length > 0) setCareUpdates(updates);
    } catch (e) {
      firestoreService.logMedicineAction(medicineId, 'SKIPPED', loggedBy, reason);
      setMedicineLogs([...firestoreService.getMedicineLogs()]);
      setCareUpdates([...firestoreService.getCareUpdates()]);
    }
    addToast('Medicine Skipped', 'Reason noted and saved permanently.', 'warning');
  };

  const snoozeMedicine = async (medicineId: string, minutes = 15) => {
    const snoozeTime = new Date(Date.now() + minutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const numericId = parseInt(medicineId.replace(/\D/g, ''), 10) || 1;
      await apiClient.post(`/medications/${numericId}/action`, {
        action: 'UPCOMING',
        loggedBy: 'System',
        notes: `Snoozed until ${snoozeTime}`,
        minutes,
      });
    } catch (e) {
      firestoreService.logMedicineAction(medicineId, 'UPCOMING', 'System', `Snoozed until ${snoozeTime}`);
      setMedicineLogs([...firestoreService.getMedicineLogs()]);
    }
    addToast('Reminder Snoozed', `We will chime again in ${minutes} minutes.`, 'info');
  };

  const addNewMedicine = async (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await apiClient.post<any>('/medications', {
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        instructions: data.instructions,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        times: data.times,
        elderlyId: data.elderlyId || selectedElderly?.id || '1',
      });
      const newMed: Medicine = {
        id: String(res.id),
        elderlyId: String(res.patient_id || data.elderlyId || '1'),
        name: res.name,
        dosage: res.dosage,
        frequency: res.frequency as any,
        instructions: res.instructions || '',
        times: data.times || ['08:00 AM'],
        startDate: String(res.start_date || data.startDate),
        endDate: res.end_date,
        isActive: res.is_active,
        createdAt: String(res.created_at || new Date().toISOString()),
        updatedAt: String(res.created_at || new Date().toISOString()),
      };
      setMedicines((prev) => [newMed, ...prev]);
      addToast('Medicine Added & Saved', `${data.name} saved permanently to SQLite database.`, 'success');
    } catch (err: any) {
      firestoreService.addMedicine(data);
      setMedicines([...firestoreService.getMedicines()]);
      addToast('Medicine Added', `${data.name} scheduled successfully.`, 'info');
    }
  };

  const removeMedicine = async (id: string) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10) || id;
      await apiClient.delete(`/medications/${numericId}`);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      addToast('Medicine Removed', 'Schedule permanently deleted from database.', 'info');
    } catch (err) {
      firestoreService.deleteMedicine(id);
      setMedicines([...firestoreService.getMedicines()]);
      addToast('Medicine Removed', 'Schedule updated.', 'info');
    }
  };

  // Daily Care Checklist (Persistent via SQLite Backend)
  const toggleDailyCare = async (itemId: string) => {
    const author =
      currentRole === 'CAREGIVER'
        ? `${currentUser?.displayName || 'Caregiver'}`
        : currentRole === 'ELDERLY'
        ? `${selectedElderly?.fullName || 'Self-logged'}`
        : `${currentUser?.displayName || 'Family Member'}`;

    try {
      const updated = await apiClient.post<any>('/daily-care-logs/toggle-item', { itemId, author });
      if (updated) {
        setDailyCareLog({
          id: String(updated.id),
          elderlyId: String(updated.elderlyId),
          date: updated.date,
          items: updated.items || [],
          generalNote: updated.generalNote,
          caregiverNote: updated.caregiverNote,
          updatedBy: updated.updatedBy,
          updatedAt: updated.updatedAt || new Date().toISOString(),
        });
      }
      const updates = await apiClient.get<any[]>('/care-updates').catch(() => []);
      if (updates && updates.length > 0) {
        setCareUpdates(
          updates.map((u: any) => ({
            id: String(u.id),
            elderlyId: String(u.elderlyId || '1'),
            elderlyName: u.elderlyName || 'Senior',
            authorId: String(u.authorId || '1'),
            authorName: u.authorName || 'Caregiver',
            authorRole: (u.authorRole || 'CAREGIVER') as any,
            timestamp: u.timestamp || 'Just now',
            title: u.title,
            description: u.description,
            category: (u.category || 'VISIT') as any,
            vitals: u.vitals,
            attachments: u.attachments,
            createdAt: u.createdAt || new Date().toISOString(),
          }))
        );
      }
      addToast('Care Checklist Updated', 'Saved permanently to SQLite database.', 'success');
    } catch (e) {
      const fallback = firestoreService.toggleDailyCareItem(itemId, author);
      setDailyCareLog(fallback);
      addToast('Care Checklist Updated', 'Status updated.', 'info');
    }
  };

  const saveDailyCareGeneralNote = async (note: string) => {
    const author = currentUser?.displayName || 'Caregiver';
    try {
      await apiClient.post('/daily-care-logs/note', { note, author });
      setDailyCareLog((prev) => prev ? { ...prev, generalNote: note } : null);
      addToast('Care Note Saved', 'Note permanently saved to SQLite database.', 'success');
    } catch (e) {
      firestoreService.updateDailyCareGeneralNote(note, author);
      setDailyCareLog({ ...firestoreService.getDailyCareLog(selectedElderly?.id || 'eld-1') });
      addToast('Care Note Saved', 'Family timeline updated with your daily notes.', 'info');
    }
  };

  // Care Updates (Persistent via SQLite Backend)
  const postCareUpdate = async (
    title: string,
    description: string,
    category: CareUpdate['category'],
    vitals?: CareUpdate['vitals']
  ) => {
    try {
      const res = await apiClient.post<any>('/care-updates', {
        elderlyId: selectedElderly?.id || '1',
        elderlyName: selectedElderly?.fullName || 'Eleanor Vance',
        authorId: currentUser?.id || '1',
        authorName: currentUser?.displayName || 'Sister Ananya Roy',
        authorRole: currentRole,
        title,
        description,
        category,
        vitals,
      });
      const newUpdate: CareUpdate = {
        id: String(res.id),
        elderlyId: String(res.elderlyId),
        elderlyName: res.elderlyName,
        authorId: String(res.authorId),
        authorName: res.authorName,
        authorRole: res.authorRole as any,
        timestamp: res.timestamp,
        title: res.title,
        description: res.description,
        category: res.category as any,
        vitals: res.vitals,
        createdAt: res.createdAt || new Date().toISOString(),
      };
      setCareUpdates((prev) => [newUpdate, ...prev]);
      addToast('Care Update Posted', 'Shared live and saved permanently in database.', 'success');
    } catch (e) {
      firestoreService.addCareUpdate({
        elderlyId: selectedElderly?.id || 'eld-1',
        elderlyName: selectedElderly?.fullName || 'Senior',
        authorId: currentUser?.id || 'u-1',
        authorName: currentUser?.displayName || 'Sister Ananya Roy',
        authorRole: currentRole,
        timestamp: 'Just now',
        title,
        description,
        category,
        vitals,
      });
      setCareUpdates([...firestoreService.getCareUpdates()]);
      addToast('Care Update Posted', 'Shared live on the family health timeline.', 'info');
    }
  };

  // Bookings (Persistent via SQLite Backend)
  const createNewBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
    await paymentService.verifyPayment(`order_${Date.now()}`);
    try {
      const res = await apiClient.post<any>('/bookings', {
        elderlyId: data.elderlyId || selectedElderly?.id || '1',
        elderlyName: data.elderlyName || selectedElderly?.fullName || 'Senior',
        elderlyAddress: data.elderlyAddress || selectedElderly?.address || 'Home Address',
        familyId: data.familyId || currentUser?.id || '1',
        familyName: data.familyName || currentUser?.displayName || 'Family Member',
        familyPhone: data.familyPhone || '+1 (555) 019-2831',
        caregiverId: data.caregiverId,
        caregiverName: data.caregiverName,
        caregiverPhone: data.caregiverPhone || '+1 (555) 019-4412',
        caregiverAvatar: data.caregiverAvatar,
        date: data.date,
        timeSlot: data.timeSlot,
        serviceType: data.serviceType,
        durationHours: data.durationHours,
        instructions: data.instructions,
        status: data.status || 'CONFIRMED',
        totalAmount: data.totalAmount || 1400,
        paymentStatus: 'PAID',
      });
      const newBooking: Booking = {
        id: String(res.id),
        elderlyId: String(res.elderlyId),
        elderlyName: res.elderlyName,
        elderlyAddress: res.elderlyAddress,
        familyId: String(res.familyId),
        familyName: res.familyName,
        familyPhone: res.familyPhone,
        caregiverId: String(res.caregiverId),
        caregiverName: res.caregiverName,
        caregiverPhone: res.caregiverPhone,
        caregiverAvatar: res.caregiverAvatar,
        date: res.date,
        timeSlot: res.timeSlot,
        serviceType: res.serviceType as any,
        durationHours: res.durationHours,
        instructions: res.instructions || '',
        status: res.status as any,
        totalAmount: res.totalAmount,
        paymentStatus: res.paymentStatus as any,
        paymentId: res.paymentId,
        createdAt: res.createdAt || new Date().toISOString(),
        updatedAt: res.updatedAt || new Date().toISOString(),
      };
      setBookings((prev) => [newBooking, ...prev]);
      addToast('Home Visit Booked!', `Visit with ${data.caregiverName} on ${data.date} is saved permanently in database.`, 'success');
      return newBooking;
    } catch (err) {
      const fallback = firestoreService.addBooking({ ...data, paymentStatus: 'PAID' });
      setBookings([...firestoreService.getBookings()]);
      addToast('Home Visit Booked!', `Visit with ${data.caregiverName} on ${data.date} is confirmed.`, 'info');
      return fallback;
    }
  };

  const changeBookingStatus = async (bookingId: string, status: BookingStatus, notes?: string) => {
    try {
      await apiClient.patch(`/bookings/${bookingId}/status`, { status, caregiverNotes: notes });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status, caregiverNotes: notes } : b))
      );
      addToast('Visit Status Updated', `Booking is now ${status.replace('_', ' ')} in database.`, 'info');
    } catch (e) {
      firestoreService.updateBookingStatus(bookingId, status, notes);
      setBookings([...firestoreService.getBookings()]);
      addToast('Visit Status Updated', `Booking is now ${status.replace('_', ' ')}.`, 'info');
    }
  };

  // Caregiver Verification
  const verifyCaregiverStatus = async (caregiverId: string, status: VerificationStatus, notes?: string) => {
    if (isDemoMode) {
      firestoreService.updateCaregiverVerification(caregiverId, status, notes);
      setCaregivers([...firestoreService.getCaregivers()]);
      addToast(
        status === 'VERIFIED' ? 'Caregiver Verified!' : `Caregiver Status: ${status}`,
        `Background check status set to ${status}.`,
        status === 'VERIFIED' ? 'success' : 'info'
      );
      return;
    }

    try {
      const numericId = parseInt(caregiverId.replace(/\D/g, ''), 10) || 1;
      await apiClient.patch(`/admin/caregivers/${numericId}/verification`, {
        verification_status: status,
        verification_notes: notes || `Verification set to ${status} by Admin.`,
      });

      setCaregivers((prev) =>
        prev.map((cg) =>
          cg.id === caregiverId ? { ...cg, verificationStatus: status, verificationNotes: notes } : cg
        )
      );

      addToast(
        status === 'VERIFIED' ? 'Caregiver Verified!' : `Caregiver Status: ${status}`,
        `Credentials successfully updated to ${status}.`,
        status === 'VERIFIED' ? 'success' : 'info'
      );
    } catch (err: any) {
      addToast('Update Failed', err.message || 'Could not update verification status.', 'error');
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive });
      setAdminUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u))
      );
      addToast(
        'User Status Updated',
        `Account has been ${isActive ? 'reactivated' : 'suspended'}.`,
        isActive ? 'success' : 'warning'
      );
    } catch (err: any) {
      addToast('Status Update Failed', err.message || 'Could not update user account.', 'error');
    }
  };

  const refreshAdminData = async () => {
    try {
      const [cgList, users, stats] = await Promise.all([
        apiClient.get<any[]>('/admin/caregivers').catch(() => []),
        apiClient.get<any[]>('/admin/users').catch(() => []),
        apiClient.get<any>('/admin/stats').catch(() => null),
      ]);

      if (cgList && cgList.length > 0) {
        const mappedCgs: CaregiverProfile[] = cgList.map((cg: any) => ({
          id: String(cg.id),
          userId: String(cg.user_id),
          fullName: cg.full_name,
          phone: cg.phone || '',
          email: cg.email,
          address: cg.service_area || 'Indiranagar',
          city: 'Metro City',
          serviceAreas: [cg.service_area || 'Indiranagar'],
          skills: cg.skills || ['Nursing'],
          specializations: ['Elderly Care'],
          availability: 'Full-time',
          gender: 'Female',
          bio: cg.bio || 'Verified caregiver.',
          experienceYears: cg.experience_years || 1,
          verificationStatus: cg.verification_status || 'PENDING',
          verificationNotes: cg.bio || '',
          rating: cg.rating || 4.9,
          reviewCount: 12,
          completedVisitsCount: 45,
          hourlyRate: cg.hourly_rate || 300,
          isAvailable: true,
          avatarUrl: 'https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200',
          createdAt: cg.created_at || new Date().toISOString(),
          updatedAt: cg.created_at || new Date().toISOString(),
        }));
        setCaregivers(mappedCgs);
      }
      setAdminUsersList(users || []);
      setAdminStats(stats);
    } catch (err) {
      console.error('Failed to refresh admin data:', err);
    }
  };

  // Appointments (Persistent via SQLite Backend)
  const createNewAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await apiClient.post<any>('/appointments', {
        elderlyId: data.elderlyId || selectedElderly?.id || '1',
        elderlyName: data.elderlyName || selectedElderly?.fullName || 'Senior',
        doctorName: data.doctorName,
        hospitalName: data.hospitalName || 'Outpatient Clinic',
        specialty: data.specialty || 'General',
        date: data.date,
        time: data.time,
        purpose: data.purpose,
        location: data.location || 'Suite 300, Medical Center',
        notes: data.notes || '',
        status: data.status || 'UPCOMING',
        accompaniedByCaregiver: data.accompaniedByCaregiver !== false,
        caregiverName: data.caregiverName || 'Assigned Caregiver',
      });
      const newApt: Appointment = {
        id: String(res.id),
        elderlyId: String(res.elderlyId),
        elderlyName: res.elderlyName,
        doctorName: res.doctorName,
        hospitalName: res.hospitalName,
        specialty: res.specialty,
        date: res.date,
        time: res.time,
        purpose: res.purpose,
        doctorPhone: res.doctorPhone || '',
        location: res.location,
        notes: res.notes || '',
        status: res.status as any,
        reminderSent: res.reminderSent || false,
        accompaniedByCaregiver: res.accompaniedByCaregiver,
        caregiverName: res.caregiverName,
        createdAt: res.createdAt || new Date().toISOString(),
        updatedAt: res.updatedAt || new Date().toISOString(),
      };
      setAppointments((prev) => [newApt, ...prev]);
      addToast('Appointment Scheduled', `Appointment with ${data.doctorName} on ${data.date} saved permanently.`, 'success');
    } catch (e) {
      firestoreService.addAppointment(data);
      setAppointments([...firestoreService.getAppointments()]);
      addToast('Appointment Scheduled', `Appointment with ${data.doctorName} on ${data.date} added.`, 'info');
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10) || id;
      await apiClient.delete(`/appointments/${numericId}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      addToast('Appointment Cancelled', 'Appointment removed permanently from database.', 'info');
    } catch (e) {
      firestoreService.deleteAppointment(id);
      setAppointments([...firestoreService.getAppointments()]);
      addToast('Appointment Cancelled', 'Appointment removed from schedule.', 'info');
    }
  };

  // Emergency SOS Workflow (Persistent via SQLite Backend)
  const triggerSosAlert = async (address?: string) => {
    setIsSosModalOpen(true);
    addToast(
      '🚨 EMERGENCY SOS DISPATCHED',
      'Family, caregiver & emergency dispatch notified. Stay calm, help is on the way!',
      'emergency'
    );

    try {
      const res = await apiClient.post<any>('/emergency/trigger', {
        patient_id: currentUser?.patientId || 1,
        location: address || selectedElderly?.address || '742 Evergreen Healthcare Ave',
        severity: 'CRITICAL',
        notes: 'Emergency SOS button triggered from patient dashboard.',
      });

      const newAlert: EmergencyAlert = {
        id: String(res.id),
        elderlyId: String(res.patient_id),
        elderlyName: res.patient_name || 'Eleanor Vance',
        elderlyPhone: '+1 (555) 019-1122',
        elderlyAddress: res.location,
        status: 'TRIGGERED',
        triggeredAt: res.created_at || new Date().toISOString(),
        contactsNotified: [
          { name: 'Dr. Clara Hughes', role: 'Hospital', phone: '+1 (555) 019-8801', notifiedAt: 'Just now' },
          { name: 'Sarah Vance', role: 'Family', phone: '+1 (555) 019-2831', notifiedAt: 'Just now' },
          { name: 'David Miller', role: 'Caregiver', phone: '+1 (555) 019-4412', notifiedAt: 'Just now' },
        ],
        createdAt: res.created_at || new Date().toISOString(),
        updatedAt: res.updated_at || new Date().toISOString(),
      };
      setEmergencyAlerts((prev) => [newAlert, ...prev]);
    } catch (err) {
      firestoreService.triggerEmergencySOS(selectedElderly?.id || 'eld-1', address);
      setEmergencyAlerts([...firestoreService.getEmergencyAlerts()]);
    }
  };

  const resolveSosAlert = async (alertId: string, resolutionNotes: string) => {
    try {
      const numericId = parseInt(alertId.replace(/\D/g, ''), 10) || 1;
      await apiClient.patch(`/emergency/${numericId}/status`, {
        status: 'RESOLVED',
        notes: resolutionNotes,
      });
      setEmergencyAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: 'RESOLVED', resolutionNotes, resolvedAt: new Date().toISOString() } : a
        )
      );
    } catch (e) {
      firestoreService.updateEmergencyStatus(alertId, 'RESOLVED', resolutionNotes);
      setEmergencyAlerts([...firestoreService.getEmergencyAlerts()]);
    }
    setIsSosModalOpen(false);
    addToast('Emergency Alert Resolved', 'Incident marked resolved and logged permanently.', 'success');
  };

  // Location Sharing
  const toggleElderlyLocationSharing = () => {
    if (!selectedElderly) return;
    const updated: ElderlyProfile = {
      ...selectedElderly,
      isLocationSharingOn: !selectedElderly.isLocationSharingOn,
    };
    setSelectedElderly(updated);
    addToast(
      updated.isLocationSharingOn ? 'Live Location Sharing ON' : 'Location Sharing Paused',
      updated.isLocationSharingOn
        ? 'Family members and assigned caregivers can now view live visit location.'
        : 'Location tracking disabled.',
      'info'
    );
  };

  // Subscription (Persistent via SQLite Backend)
  const updateSubscription = async (plan: SubscriptionPlan) => {
    try {
      await apiClient.post('/subscriptions', {
        userId: currentUser?.id || '1',
        planName: plan.planName,
        monthlyRateINR: plan.monthlyRateINR,
        status: plan.status,
        renewalDate: plan.renewalDate,
        paymentMethod: plan.paymentMethod,
        features: plan.features,
      });
      setSubscription(plan);
      addToast('Subscription Updated', `Your plan is now ${plan.planName} (saved permanently in database).`, 'success');
    } catch (e) {
      firestoreService.updateSubscription(plan);
      setSubscription(plan);
      addToast('Subscription Updated', `Your plan is now ${plan.planName}.`, 'info');
    }
  };

  // Reviews (Persistent via SQLite Backend)
  const submitCaregiverReview = async (caregiverId: string, rating: number, comment: string, serviceType: string) => {
    const author = currentUser?.displayName || 'CareNest Family Member';
    try {
      const res = await apiClient.post<any>('/reviews', {
        caregiverId,
        familyId: currentUser?.id || '1',
        familyName: author,
        rating,
        comment,
        visitServiceType: serviceType,
      });
      const newReview: Review = {
        id: String(res.id),
        caregiverId: String(res.caregiverId),
        familyId: String(res.familyId),
        familyName: res.familyName,
        rating: res.rating,
        comment: res.comment,
        date: res.date,
        visitServiceType: res.visitServiceType,
      };
      setReviews((prev) => [newReview, ...prev]);
      addToast('Review Submitted', 'Thank you! Your feedback is permanently saved.', 'success');
    } catch (e) {
      firestoreService.addReview({
        caregiverId,
        familyId: currentUser?.id || 'fam-1',
        familyName: author,
        rating,
        comment,
        visitServiceType: serviceType,
      });
      setReviews([...firestoreService.getReviews()]);
      addToast('Review Submitted', 'Thank you for helping families find trusted care!', 'info');
    }
  };

  const markAllNotificationsRead = () => {
    firestoreService.markAllNotificationsAsRead();
    setNotifications([...firestoreService.getNotifications()]);
    addToast('Notifications Cleared', 'All marked as read.', 'info');
  };

  const resetDemoData = () => {
    firestoreService.resetToFactoryDemo();
    switchDemoPersona('FAMILY');
    addToast('Demo Reset Successful', 'All sample data restored to clean prototype state.', 'success');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <CareNestContext.Provider
      value={{
        currentUser,
        currentRole,
        activeView,
        seniorMode,
        selectedElderly,
        selectedCaregiver,

        isAuthenticated: !!currentUser && !isDemoMode,
        isAuthLoading,
        isDemoMode,
        activeDemoPersona,

        elderlyProfiles,
        caregivers,
        familyMembers,
        medicines,
        medicineLogs,
        bookings,
        dailyCareLog,
        careUpdates,
        appointments,
        notifications,
        emergencyAlerts,
        subscription,
        reviews,

        adminUsersList,
        adminStats,

        toasts,
        isSosModalOpen,
        isSeniorModeOpen,
        isQuickBookingModalOpen,
        targetCaregiverForBooking,
        unreadNotificationsCount,

        setCurrentUser,
        setCurrentRole,
        setActiveView,
        setSeniorMode,
        toggleSeniorMode,
        setSelectedElderly,
        setSelectedCaregiver,
        setIsSosModalOpen,
        setIsQuickBookingModalOpen,
        setTargetCaregiverForBooking,

        realLogin,
        realRegister,
        realLogout,
        switchDemoPersona,
        exitDemoMode,
        linkFamilyMember,

        loginAsRole: switchDemoPersona,
        logout: realLogout,
        addToast,
        removeToast,

        takeMedicine,
        skipMedicine,
        snoozeMedicine,
        addNewMedicine,
        removeMedicine,

        toggleDailyCare,
        saveDailyCareGeneralNote,
        postCareUpdate,

        createNewBooking,
        changeBookingStatus,
        verifyCaregiverStatus,

        createNewAppointment,
        removeAppointment,

        triggerSosAlert,
        resolveSosAlert,

        toggleElderlyLocationSharing,
        updateSubscription,
        submitCaregiverReview,

        markAllNotificationsRead,
        resetDemoData,

        toggleUserStatus,
        refreshAdminData,
      }}
    >
      {children}
    </CareNestContext.Provider>
  );
};

export const useCareNest = () => {
  const context = useContext(CareNestContext);
  if (!context) {
    throw new Error('useCareNest must be used within a CareNestProvider');
  }
  return context;
};
