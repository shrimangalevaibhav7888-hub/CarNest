export type UserRole = 'ELDERLY' | 'FAMILY' | 'CAREGIVER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type MedicineStatus = 'TAKEN' | 'MISSED' | 'SKIPPED' | 'UPCOMING';

export type EmergencyStatus = 'TRIGGERED' | 'FAMILY_NOTIFIED' | 'CAREGIVER_CONTACTED' | 'RESOLVED';

export type CareCategory = 'MEDICINE' | 'MEAL' | 'HYDRATION' | 'PERSONAL_CARE' | 'EXERCISE' | 'APPOINTMENT' | 'WELL_BEING';

export type NotificationType = 
  | 'MEDICINE' 
  | 'BOOKING' 
  | 'VISIT' 
  | 'EMERGENCY' 
  | 'FAMILY_UPDATE' 
  | 'APPOINTMENT' 
  | 'VERIFICATION';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  patientId?: number;
  caregiverId?: number;
  verificationStatus?: VerificationStatus;
  linkedPatientIds?: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface ElderlyProfile {
  id: string;
  userId?: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  medicalNotes: string;
  allergies?: string;
  bloodGroup?: string;
  careRequirements: string[];
  doctorName?: string;
  doctorPhone?: string;
  doctorHospital?: string;
  linkedFamilyIds: string[];
  assignedCaregiverIds: string[];
  isLocationSharingOn: boolean;
  lastKnownLocation?: {
    lat: number;
    lng: number;
    address: string;
    updatedAt: string;
  };
  seniorModeEnabled?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberProfile {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
  linkedElderlyId: string;
  address?: string;
  emergencyPriority?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverDocument {
  id: string;
  caregiverId: string;
  documentType: 'GOVT_ID' | 'NURSING_CERT' | 'POLICE_CLEARANCE' | 'FIRST_AID_CPR' | 'EXPERIENCE_LETTER';
  documentName: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CaregiverProfile {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  serviceAreas: string[];
  experienceYears: number;
  skills: string[];
  specializations: string[];
  availability: 'Full-time' | 'Part-time' | 'Night Shift' | 'On-demand' | 'Weekends Only';
  gender: 'Male' | 'Female' | 'Other';
  bio: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isAvailable: boolean;
  avatarUrl: string;
  documents?: CaregiverDocument[];
  completedVisitsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  elderlyId: string;
  elderlyName: string;
  elderlyAddress: string;
  familyId: string;
  familyName: string;
  familyPhone: string;
  caregiverId: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverAvatar?: string;
  date: string;
  timeSlot: string;
  serviceType: 'Companion Care' | 'Medication & Vitals' | 'Full Day Assistance' | 'Mobility & Physical Therapy' | 'Post-Hospitalization Support' | 'Dementia / Memory Care';
  durationHours: number;
  instructions: string;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentId?: string;
  caregiverNotes?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  elderlyId: string;
  name: string;
  dosage: string;
  frequency: 'Once daily' | 'Twice daily' | 'Three times daily' | 'Every 4 hours' | 'As needed' | 'Weekly';
  times: string[]; // e.g., ["08:00", "20:00"]
  instructions: string; // e.g. "Take after breakfast with water"
  startDate: string;
  endDate?: string;
  color?: string; // Tag color
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  elderlyId: string;
  scheduledTime: string; // e.g. "08:00 AM"
  scheduledDate: string; // "YYYY-MM-DD"
  status: MedicineStatus;
  loggedAt?: string;
  loggedBy?: string; // 'Elderly' | 'Caregiver' | 'Family'
  notes?: string;
  snoozedUntil?: string;
}

export interface DailyCareItem {
  id: string;
  category: CareCategory;
  title: string;
  timeTarget?: string;
  completed: boolean;
  timeCompleted?: string;
  completedBy?: string;
  notes?: string;
}

export interface DailyCareLog {
  id: string;
  elderlyId: string;
  date: string; // "YYYY-MM-DD"
  items: DailyCareItem[];
  generalNote?: string;
  caregiverNote?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  elderlyId: string;
  elderlyName: string;
  doctorName: string;
  hospitalName: string;
  specialty: string;
  date: string;
  time: string;
  purpose: string;
  doctorPhone?: string;
  location: string;
  notes?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  reminderSent: boolean;
  accompaniedByCaregiver?: boolean;
  caregiverName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyAlert {
  id: string;
  elderlyId: string;
  elderlyName: string;
  elderlyPhone: string;
  elderlyAddress: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  status: EmergencyStatus;
  triggeredAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  contactsNotified: {
    name: string;
    role: string;
    phone: string;
    notifiedAt: string;
  }[];
  assignedCaregiverName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareUpdate {
  id: string;
  elderlyId: string;
  elderlyName: string;
  authorId: string;
  authorName: string;
  authorRole: 'ELDERLY' | 'FAMILY' | 'CAREGIVER' | 'ADMIN' | 'DOCTOR' | 'SYSTEM';
  timestamp: string;
  title: string;
  description: string;
  category: 'VISIT' | 'MEDICINE' | 'VITALS' | 'MEAL' | 'ACTIVITY' | 'ALERT' | 'MOOD';
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    bloodSugar?: string;
    temperature?: string;
    oxygenLevel?: string;
  };
  attachments?: string[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  linkTab?: string;
  data?: Record<string, any>;
}

export interface SubscriptionPlan {
  id: string;
  userId: string;
  planName: 'CareNest Basic' | 'CareNest Plus' | 'CareNest Premium';
  monthlyRateINR: number;
  status: 'ACTIVE' | 'CANCELLED' | 'TRIAL' | 'PAST_DUE';
  renewalDate: string;
  paymentMethod: string;
  features: string[];
}

export interface Review {
  id: string;
  caregiverId: string;
  familyId: string;
  familyName: string;
  rating: number;
  comment: string;
  date: string;
  visitServiceType: string;
}
