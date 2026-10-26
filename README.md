# CareNest — Elderly Home-Care Platform

> **"Care at Home. Peace of Mind."**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 🌟 Executive Summary

**CareNest** is a modern, production-grade digital health platform designed specifically for home elderly care. It solves the critical problem of elderly patients (aged 60+) struggling with complex medication regimens and daily care routines, while working family members experience constant anxiety over unmonitored care and difficulty finding trustworthy, background-verified caregivers.

CareNest provides a complete, accessible, and verified home-care coordination platform uniting:
1. **Elderly Patients (60+)** — Large high-contrast touch targets, simplified daily schedule, audio read-aloud assist, and 1-touch Emergency SOS.
2. **Family Members** — Real-time health status, medication tracking, caregiver scheduling, live visit GPS, and continuous health timeline.
3. **Professional Caregivers & GDA Nurses** — Assigned visit workflow, task checklists, live vitals logging, and emergency escalation.
4. **CareNest Administrators** — 5-point caregiver credential verification, platform safety audit, and incident resolution.

---

## 🎨 Brand Identity & Design System

- **Deep Burgundy / Rose (`#881337` / `#9f1239`)**: Used for primary brand moments, high-priority status, and Emergency SOS.
- **Warm Orange (`#ea580c` / `#f97316`)**: Secondary energetic accent for reminders and active badges.
- **Cream / Soft Off-White (`#fdfbf7` / `#faf6ed`)**: Warm, calming, non-clinical healthcare background.
- **Soft Green (`#15803d` / `#16a34a`)**: Verified caregivers, taken medicines, and healthy normal vitals.
- **Charcoal Gray (`#0f172a` / `#1e293b`)**: High-contrast, WCAG AAA compliant text readability.
- **Accessible "Senior Mode"**: One-click toggle enlarging fonts to 115%, enforcing 52px+ button heights, and reducing cognitive clutter.

---

## 🚀 Key Modules & Capabilities

| Module | Features & Implementation |
| :--- | :--- |
| **Landing Page** | High-impact hero section, problem & solution breakdown, 6-step workflow, functional/emotional/social benefits, emergency disclaimers, and interactive persona fast-switcher. |
| **Elderly Dashboard** | Personalized greeting ("Good morning, Ramesh-ji"), next medicine card with 1-click Taken/Skip/Snooze, caregiver visit status, daily progress bar, and 6 large buttons. |
| **Family Dashboard** | 5 core monitoring cards: "Today's Care", "Medication Status", "Caregiver Visit", "Recent Updates", "Emergency Status", plus 1-click visit booking. |
| **Caregiver Hub** | Assigned visit management (Accept → Start → Complete), patient care instructions, interactive daily checklist, and live vitals logging (BP, Pulse, Blood Sugar). |
| **Admin Operations** | 8-metric real-time grid, caregiver document verification portal (Aadhaar, Nursing Degree, Police Clearance, CPR), booking management, and emergency logs. |
| **Caregiver Discovery** | Filter by location, availability, experience, gender, and skills. Caregiver profiles with background badges, hourly rates, and multi-step instant booking. |
| **Smart Medicine Reminders** | Daily timetable, dosage tracking, taken/missed/snoozed state machine, and audio chime alerts (with non-medical advice legal disclaimer). |
| **Daily-Care Tracking** | Real-time checklist covering medicines, meals, hydration, knee physiotherapy, walks, doctor appointments, and caregiver notes. |
| **Emergency SOS Hub** | 4-step emergency broadcast, 1-click dialing for family, nurse, and national ambulance (112/108), and incident resolution archive. |
| **Location Sharing** | Simulated live GPS coordinates, accuracy circle, geofence status, and explicit privacy ON/OFF toggle. |
| **Subscription Architecture** | CareNest Membership ₹1,000/month model with UPI AutoPay abstraction and tier management. |
| **Trust & Verification** | Educational guide detailing the 5-point verification standard and transparent safety statement. |

---

## 👥 Demo Accounts & 1-Click Persona Switcher

The top navigation bar contains an interactive **Role Switcher** that allows judges, mentors, and evaluators to test all 4 personas instantly:

| Role Persona | Default Profile | Test Scenario Focus |
| :--- | :--- | :--- |
| **Elderly Patient** | **Ramesh Chandra (74)** | Large buttons, taking morning Metformin, viewing caregiver visit, voice reading, 1-touch SOS. |
| **Family Member** | **Vikram Chandra (Son)** | Monitoring father's care status, booking Sister Ananya, checking medication logs, live timeline. |
| **Caregiver / Nurse** | **Sister Ananya Roy (GDA)** | Starting home visit, completing daily care checklist, entering blood pressure (124/82) & sugar. |
| **Platform Admin** | **Operations Desk** | Reviewing caregiver documents, approving background checks, monitoring platform visits. |

---

## 📂 Project Architecture

```text
CareNest AI/
├── firestore.rules               # Production Firebase Security Rules
├── README.md                     # Project documentation
├── apps/
│   └── frontend/
│       ├── .env.example          # Environment variable template
│       ├── .env.local            # Local configuration
│       ├── tailwind.config.ts    # Brand color tokens & typography
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css   # Fonts, Senior Mode classes, SOS animations
│       │   │   ├── layout.tsx    # Root layout with CareNestProvider & modals
│       │   │   └── page.tsx      # Dynamic multi-view application router
│       │   ├── components/
│       │   │   ├── layout/       # CareNestNavbar, CareNestFooter
│       │   │   ├── booking/      # BookingModal (multi-step wizard)
│       │   │   ├── caregivers/   # CaregiverDetailModal
│       │   │   ├── emergency/    # EmergencySosModal
│       │   │   └── ui/           # ToastContainer
│       │   ├── context/
│       │   │   └── CareNestContext.tsx # Central application state & actions
│       │   ├── data/
│       │   │   └── mockData.ts   # Realistic seed dataset (3 seniors, 5 caregivers)
│       │   ├── features/
│       │   │   ├── landing/      # LandingPageView
│       │   │   ├── dashboards/   # Elderly, Family, Caregiver, Admin dashboards
│       │   │   ├── caregivers/   # CaregiverSearchView
│       │   │   ├── medicines/    # MedicineManagementView
│       │   │   ├── dailyCare/    # DailyCareTrackingView
│       │   │   ├── emergency/    # EmergencyHubView
│       │   │   ├── appointments/ # AppointmentsView
│       │   │   ├── location/     # LocationSharingView
│       │   │   ├── timeline/     # FamilyTimelineView
│       │   │   ├── subscription/ # SubscriptionView
│       │   │   ├── trust/        # TrustVerificationView
│       │   │   ├── howItWorks/   # HowItWorksView
│       │   │   └── auth/         # AuthView (Login/Register)
│       │   ├── lib/
│       │   │   └── firebase.ts   # Firebase client initialization with fallback
│       │   ├── services/
│       │   │   ├── firestoreService.ts  # Complete data persistence layer
│       │   │   ├── paymentService.ts    # Razorpay/UPI gateway abstraction
│       │   │   ├── locationService.ts   # Geolocation abstraction
│       │   │   └── notificationService.ts # Audio chimes & Web notifications
│       │   └── types/
│       │       └── index.ts      # Strongly typed domain entities
```

---

## ⚡ Quick Start & Local Execution

### 1. Install Dependencies
```bash
cd apps/frontend
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`. CareNest includes resilient in-memory and local storage caching, allowing full evaluation without requiring active Firebase credentials.

```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔒 Security & Medical Disclaimer

1. **Non-Medical Advice**: CareNest coordinates reminders and caregiver assistance. It does not provide automated diagnoses or alter physician prescriptions.
2. **Emergency Disclaimer**: In any acute life-threatening emergency, users are instructed to dial **112 / 108** immediately.
3. **Data Security**: Compliant with role-based access control (RBAC), preventing public access to senior health information as defined in `firestore.rules`.
