import {
  ElderlyProfile,
  CaregiverProfile,
  FamilyMemberProfile,
  Booking,
  Medicine,
  MedicineLog,
  DailyCareLog,
  DailyCareItem,
  Appointment,
  EmergencyAlert,
  CareUpdate,
  NotificationItem,
  SubscriptionPlan,
  Review,
  User,
  UserRole,
  VerificationStatus,
  BookingStatus,
  MedicineStatus,
  EmergencyStatus,
} from '../types';

import {
  DEMO_USERS,
  DEMO_ELDERLY_PROFILES,
  DEMO_FAMILY_MEMBERS,
  DEMO_CAREGIVERS,
  DEMO_MEDICINES,
  DEMO_MEDICINE_LOGS,
  DEMO_BOOKINGS,
  DEMO_DAILY_CARE_LOG,
  DEMO_CARE_UPDATES,
  DEMO_APPOINTMENTS,
  DEMO_NOTIFICATIONS,
  DEMO_EMERGENCY_ALERTS,
  DEMO_SUBSCRIPTION,
  DEMO_REVIEWS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'carenest_users_v2',
  ELDERLY: 'carenest_elderly_v2',
  FAMILY: 'carenest_family_v2',
  CAREGIVERS: 'carenest_caregivers_v2',
  MEDICINES: 'carenest_medicines_v2',
  MED_LOGS: 'carenest_med_logs_v2',
  BOOKINGS: 'carenest_bookings_v2',
  DAILY_CARE: 'carenest_daily_care_v2',
  CARE_UPDATES: 'carenest_care_updates_v2',
  APPOINTMENTS: 'carenest_appointments_v2',
  NOTIFICATIONS: 'carenest_notifications_v2',
  EMERGENCY: 'carenest_emergency_v2',
  SUBSCRIPTION: 'carenest_subscription_v2',
  REVIEWS: 'carenest_reviews_v2',
  ACTIVE_USER: 'carenest_active_user_v2',
};

class FirestoreStorageService {
  private getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  public initDataIfEmpty() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setStorage(STORAGE_KEYS.USERS, DEMO_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ELDERLY)) {
      this.setStorage(STORAGE_KEYS.ELDERLY, DEMO_ELDERLY_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAMILY)) {
      this.setStorage(STORAGE_KEYS.FAMILY, DEMO_FAMILY_MEMBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAREGIVERS)) {
      this.setStorage(STORAGE_KEYS.CAREGIVERS, DEMO_CAREGIVERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      this.setStorage(STORAGE_KEYS.MEDICINES, DEMO_MEDICINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MED_LOGS)) {
      this.setStorage(STORAGE_KEYS.MED_LOGS, DEMO_MEDICINE_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      this.setStorage(STORAGE_KEYS.BOOKINGS, DEMO_BOOKINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_CARE)) {
      this.setStorage(STORAGE_KEYS.DAILY_CARE, DEMO_DAILY_CARE_LOG);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARE_UPDATES)) {
      this.setStorage(STORAGE_KEYS.CARE_UPDATES, DEMO_CARE_UPDATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.setStorage(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, DEMO_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY)) {
      this.setStorage(STORAGE_KEYS.EMERGENCY, DEMO_EMERGENCY_ALERTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION)) {
      this.setStorage(STORAGE_KEYS.SUBSCRIPTION, DEMO_SUBSCRIPTION);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      this.setStorage(STORAGE_KEYS.REVIEWS, DEMO_REVIEWS);
    }
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.getStorage(STORAGE_KEYS.USERS, DEMO_USERS);
  }

  public getActiveUser(): User | null {
    return this.getStorage(STORAGE_KEYS.ACTIVE_USER, DEMO_USERS[0]);
  }

  public setActiveUser(user: User | null): void {
    this.setStorage(STORAGE_KEYS.ACTIVE_USER, user);
  }

  // Elderly Profiles
  public getElderlyProfiles(): ElderlyProfile[] {
    return this.getStorage(STORAGE_KEYS.ELDERLY, DEMO_ELDERLY_PROFILES);
  }

  public getElderlyById(id: string): ElderlyProfile | undefined {
    const list = this.getElderlyProfiles();
    return list.find((e) => e.id === id);
  }

  public updateElderlyProfile(profile: ElderlyProfile): void {
    const list = this.getElderlyProfiles();
    const idx = list.findIndex((e) => e.id === profile.id);
    if (idx !== -1) {
      list[idx] = { ...profile, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.setStorage(STORAGE_KEYS.ELDERLY, list);
  }

  public addElderlyProfile(profile: Omit<ElderlyProfile, 'id' | 'createdAt' | 'updatedAt'>): ElderlyProfile {
    const list = this.getElderlyProfiles();
    const newProfile: ElderlyProfile = {
      ...profile,
      id: `eld-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newProfile);
    this.setStorage(STORAGE_KEYS.ELDERLY, list);
    return newProfile;
  }

  // Caregivers
  public getCaregivers(): CaregiverProfile[] {
    return this.getStorage(STORAGE_KEYS.CAREGIVERS, DEMO_CAREGIVERS);
  }

  public getCaregiverById(id: string): CaregiverProfile | undefined {
    return this.getCaregivers().find((c) => c.id === id);
  }

  public updateCaregiverVerification(caregiverId: string, status: VerificationStatus, notes?: string): void {
    const list = this.getCaregivers();
    const idx = list.findIndex((c) => c.id === caregiverId);
    if (idx !== -1) {
      list[idx].verificationStatus = status;
      if (notes) list[idx].verificationNotes = notes;
      list[idx].updatedAt = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.CAREGIVERS, list);
    }
  }

  public updateCaregiverProfile(profile: CaregiverProfile): void {
    const list = this.getCaregivers();
    const idx = list.findIndex((c) => c.id === profile.id);
    if (idx !== -1) {
      list[idx] = { ...profile, updatedAt: new Date().toISOString() };
    } else {
      list.push(profile);
    }
    this.setStorage(STORAGE_KEYS.CAREGIVERS, list);
  }

  // Bookings
  public getBookings(): Booking[] {
    return this.getStorage(STORAGE_KEYS.BOOKINGS, DEMO_BOOKINGS);
  }

  public addBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const list = this.getBookings();
    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newBooking);
    this.setStorage(STORAGE_KEYS.BOOKINGS, list);

    // Also add notification for family & caregiver
    this.addNotification({
      userId: newBooking.familyId,
      title: 'Booking Confirmed',
      message: `Your booking for ${newBooking.elderlyName} with ${newBooking.caregiverName} on ${newBooking.date} is confirmed!`,
      type: 'BOOKING',
      isRead: false,
      linkTab: 'BOOKINGS',
    });

    return newBooking;
  }

  public updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string): void {
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      list[idx].status = status;
      if (notes) list[idx].caregiverNotes = notes;
      if (status === 'IN_PROGRESS') list[idx].startedAt = new Date().toISOString();
      if (status === 'COMPLETED') list[idx].completedAt = new Date().toISOString();
      list[idx].updatedAt = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.BOOKINGS, list);

      // Notification
      this.addNotification({
        userId: list[idx].familyId,
        title: `Care Visit ${status === 'IN_PROGRESS' ? 'Started' : status === 'COMPLETED' ? 'Completed' : status}`,
        message: `${list[idx].caregiverName} marked the visit for ${list[idx].elderlyName} as ${status.toLowerCase()}.`,
        type: 'VISIT',
        isRead: false,
        linkTab: 'CARE_TRACKING',
      });
    }
  }

  // Medicines & Reminders
  public getMedicines(elderlyId?: string): Medicine[] {
    const list = this.getStorage(STORAGE_KEYS.MEDICINES, DEMO_MEDICINES);
    if (elderlyId) return list.filter((m) => m.elderlyId === elderlyId);
    return list;
  }

  public addMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
    const list = this.getMedicines();
    const newMed: Medicine = {
      ...medicine,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newMed);
    this.setStorage(STORAGE_KEYS.MEDICINES, list);
    return newMed;
  }

  public deleteMedicine(id: string): void {
    const list = this.getMedicines().filter((m) => m.id !== id);
    this.setStorage(STORAGE_KEYS.MEDICINES, list);
  }

  public getMedicineLogs(elderlyId?: string): MedicineLog[] {
    const list = this.getStorage(STORAGE_KEYS.MED_LOGS, DEMO_MEDICINE_LOGS);
    if (elderlyId) return list.filter((l) => l.elderlyId === elderlyId);
    return list;
  }

  public logMedicineAction(
    medicineId: string,
    status: MedicineStatus,
    loggedBy: string,
    notes?: string,
    snoozedUntil?: string
  ): void {
    const meds = this.getMedicines();
    const targetMed = meds.find((m) => m.id === medicineId);
    const logs = this.getMedicineLogs();

    const existingIndex = logs.findIndex(
      (l) => l.medicineId === medicineId && l.scheduledDate === new Date().toISOString().split('T')[0]
    );

    const logEntry: MedicineLog = {
      id: existingIndex !== -1 ? logs[existingIndex].id : `mlog-${Date.now()}`,
      medicineId,
      medicineName: targetMed ? targetMed.name : 'Prescribed Medicine',
      dosage: targetMed ? targetMed.dosage : '1 Dose',
      elderlyId: targetMed ? targetMed.elderlyId : 'eld-1',
      scheduledTime: targetMed?.times[0] || '08:00 AM',
      scheduledDate: new Date().toISOString().split('T')[0],
      status,
      loggedAt: new Date().toISOString(),
      loggedBy,
      notes,
      snoozedUntil,
    };

    if (existingIndex !== -1) {
      logs[existingIndex] = logEntry;
    } else {
      logs.unshift(logEntry);
    }

    this.setStorage(STORAGE_KEYS.MED_LOGS, logs);

    // Post to health update timeline if taken or missed
    if (status === 'TAKEN' || status === 'MISSED') {
      this.addCareUpdate({
        elderlyId: logEntry.elderlyId,
        elderlyName: 'Ramesh Chandra',
        authorId: 'auth-user',
        authorName: loggedBy,
        authorRole: loggedBy.includes('Caregiver') ? 'CAREGIVER' : 'FAMILY',
        timestamp: 'Just now',
        title: status === 'TAKEN' ? `Medicine Taken: ${logEntry.medicineName}` : `Alert: Medicine Missed (${logEntry.medicineName})`,
        description: `${logEntry.medicineName} (${logEntry.dosage}) was marked as ${status.toLowerCase()} by ${loggedBy}.${notes ? ' Note: ' + notes : ''}`,
        category: 'MEDICINE',
      });
    }
  }

  // Daily Care Checklist
  public getDailyCareLog(elderlyId: string): DailyCareLog {
    const item = this.getStorage(STORAGE_KEYS.DAILY_CARE, DEMO_DAILY_CARE_LOG);
    if (item && item.elderlyId === elderlyId) return item;
    return DEMO_DAILY_CARE_LOG;
  }

  public toggleDailyCareItem(itemId: string, completedBy: string): DailyCareLog {
    const current = this.getDailyCareLog('eld-1');
    const updatedItems = current.items.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.completed;
        return {
          ...item,
          completed: nextState,
          timeCompleted: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          completedBy: nextState ? completedBy : undefined,
        };
      }
      return item;
    });

    const updatedLog: DailyCareLog = {
      ...current,
      items: updatedItems,
      updatedBy: completedBy,
      updatedAt: new Date().toISOString(),
    };

    this.setStorage(STORAGE_KEYS.DAILY_CARE, updatedLog);
    return updatedLog;
  }

  public updateDailyCareGeneralNote(note: string, author: string): void {
    const current = this.getDailyCareLog('eld-1');
    const updated: DailyCareLog = {
      ...current,
      generalNote: note,
      updatedBy: author,
      updatedAt: new Date().toISOString(),
    };
    this.setStorage(STORAGE_KEYS.DAILY_CARE, updated);
  }

  // Health Care Updates & Timeline
  public getCareUpdates(elderlyId?: string): CareUpdate[] {
    const list = this.getStorage(STORAGE_KEYS.CARE_UPDATES, DEMO_CARE_UPDATES);
    if (elderlyId) return list.filter((u) => u.elderlyId === elderlyId);
    return list;
  }

  public addCareUpdate(update: Omit<CareUpdate, 'id' | 'createdAt'>): CareUpdate {
    const list = this.getCareUpdates();
    const newUpdate: CareUpdate = {
      ...update,
      id: `cu-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newUpdate);
    this.setStorage(STORAGE_KEYS.CARE_UPDATES, list);
    return newUpdate;
  }

  // Appointments
  public getAppointments(elderlyId?: string): Appointment[] {
    const list = this.getStorage(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
    if (elderlyId) return list.filter((a) => a.elderlyId === elderlyId);
    return list;
  }

  public addAppointment(apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const list = this.getAppointments();
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newApt);
    this.setStorage(STORAGE_KEYS.APPOINTMENTS, list);

    this.addNotification({
      userId: 'user-family-1',
      title: 'Appointment Scheduled',
      message: `Doctor appointment with ${newApt.doctorName} on ${newApt.date} at ${newApt.time} confirmed.`,
      type: 'APPOINTMENT',
      isRead: false,
      linkTab: 'APPOINTMENTS',
    });

    return newApt;
  }

  public deleteAppointment(id: string): void {
    const list = this.getAppointments().filter((a) => a.id !== id);
    this.setStorage(STORAGE_KEYS.APPOINTMENTS, list);
  }

  // Emergency Alerts & SOS Workflow
  public getEmergencyAlerts(): EmergencyAlert[] {
    return this.getStorage(STORAGE_KEYS.EMERGENCY, DEMO_EMERGENCY_ALERTS);
  }

  public triggerEmergencySOS(elderlyId: string, locationAddress?: string): EmergencyAlert {
    const elderly = this.getElderlyById(elderlyId) || DEMO_ELDERLY_PROFILES[0];
    const alerts = this.getEmergencyAlerts();

    const newAlert: EmergencyAlert = {
      id: `sos-${Date.now()}`,
      elderlyId: elderly.id,
      elderlyName: elderly.fullName,
      elderlyPhone: elderly.phone,
      elderlyAddress: elderly.address,
      location: {
        lat: elderly.lastKnownLocation?.lat || 12.9784,
        lng: elderly.lastKnownLocation?.lng || 77.6408,
        address: locationAddress || elderly.address,
      },
      status: 'TRIGGERED',
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', Today',
      contactsNotified: [
        {
          name: elderly.emergencyContactName,
          role: 'Primary Family Contact',
          phone: elderly.emergencyContactPhone,
          notifiedAt: 'Instant SMS & Push Dispatched',
        },
        {
          name: 'Sister Ananya Roy',
          role: 'Assigned Caregiver',
          phone: '+91 99887 76655',
          notifiedAt: 'Emergency Broadcast Sent',
        },
        {
          name: 'City Emergency Response Desk (112)',
          role: 'Emergency Medical Dispatch Desk',
          phone: '112 / 108',
          notifiedAt: 'Emergency Contact Directory Ready',
        },
      ],
      assignedCaregiverName: 'Sister Ananya Roy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    alerts.unshift(newAlert);
    this.setStorage(STORAGE_KEYS.EMERGENCY, alerts);

    // Immediate High Priority Notification
    this.addNotification({
      userId: 'user-family-1',
      title: '🚨 EMERGENCY SOS TRIGGERED',
      message: `Emergency SOS triggered for ${elderly.fullName} at ${newAlert.location?.address}. Please check immediately!`,
      type: 'EMERGENCY',
      isRead: false,
      linkTab: 'EMERGENCY',
    });

    return newAlert;
  }

  public updateEmergencyStatus(alertId: string, status: EmergencyStatus, resolutionNotes?: string): void {
    const list = this.getEmergencyAlerts();
    const idx = list.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      list[idx].status = status;
      if (status === 'RESOLVED') {
        list[idx].resolvedAt = new Date().toISOString();
        if (resolutionNotes) list[idx].resolutionNotes = resolutionNotes;
      }
      list[idx].updatedAt = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.EMERGENCY, list);
    }
  }

  // Notifications
  public getNotifications(userId?: string): NotificationItem[] {
    const list = this.getStorage(STORAGE_KEYS.NOTIFICATIONS, DEMO_NOTIFICATIONS);
    if (userId) return list.filter((n) => n.userId === userId || n.userId === 'user-family-1');
    return list;
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt'>): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      createdAt: 'Just now',
    };
    list.unshift(newNotif);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsAsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // Subscription
  public getSubscription(): SubscriptionPlan {
    const sub = this.getStorage(STORAGE_KEYS.SUBSCRIPTION, DEMO_SUBSCRIPTION);
    if (sub && ((sub.planName as any) === 'CareNest Family Peace' || sub.monthlyRateINR === 1000)) {
      sub.planName = 'CareNest Plus';
      sub.monthlyRateINR = 699;
      sub.features = DEMO_SUBSCRIPTION.features;
      this.setStorage(STORAGE_KEYS.SUBSCRIPTION, sub);
    } else if (sub && (sub.planName as any) === 'CareNest 24/7 Total Care') {
      sub.planName = 'CareNest Premium';
      sub.monthlyRateINR = 1099;
      this.setStorage(STORAGE_KEYS.SUBSCRIPTION, sub);
    }
    return sub;
  }

  public updateSubscription(plan: SubscriptionPlan): void {
    this.setStorage(STORAGE_KEYS.SUBSCRIPTION, plan);
  }

  // Reviews
  public getReviews(caregiverId?: string): Review[] {
    const list = this.getStorage(STORAGE_KEYS.REVIEWS, DEMO_REVIEWS);
    if (caregiverId) return list.filter((r) => r.caregiverId === caregiverId);
    return list;
  }

  public addReview(review: Omit<Review, 'id' | 'date'>): Review {
    const list = this.getReviews();
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
    list.unshift(newRev);
    this.setStorage(STORAGE_KEYS.REVIEWS, list);
    return newRev;
  }

  // Reset to Demo Data
  public resetToFactoryDemo(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    localStorage.setItem(STORAGE_KEYS.ELDERLY, JSON.stringify(DEMO_ELDERLY_PROFILES));
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(DEMO_FAMILY_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(DEMO_CAREGIVERS));
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(DEMO_MEDICINES));
    localStorage.setItem(STORAGE_KEYS.MED_LOGS, JSON.stringify(DEMO_MEDICINE_LOGS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEMO_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.DAILY_CARE, JSON.stringify(DEMO_DAILY_CARE_LOG));
    localStorage.setItem(STORAGE_KEYS.CARE_UPDATES, JSON.stringify(DEMO_CARE_UPDATES));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEMO_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEMO_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(DEMO_EMERGENCY_ALERTS));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(DEMO_SUBSCRIPTION));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEMO_REVIEWS));
  }
}

export const firestoreService = new FirestoreStorageService();
