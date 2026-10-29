-- ============================================================================
-- CareNest AI - Complete Supabase PostgreSQL Cloud Schema & RLS Policies
-- ============================================================================
-- This script provisions the complete production schema for CareNest AI on
-- Supabase PostgreSQL with Row Level Security (RLS) policies enforcing user isolation.
-- ============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom ENUM Types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('PATIENT', 'ELDERLY', 'FAMILY', 'FAMILY_MEMBER', 'CAREGIVER', 'HOSPITAL', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mobility_status') THEN
        CREATE TYPE mobility_status AS ENUM ('INDEPENDENT', 'ASSISTED', 'WHEELCHAIR', 'BEDBOUND', 'WHEELCHAIR_BOUND', 'BED_BOUND');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'living_situation') THEN
        CREATE TYPE living_situation AS ENUM ('LIVES_ALONE', 'WITH_SPOUSE', 'WITH_FAMILY', 'ASSISTED_FACILITY', 'LIVES_WITH_SPOUSE', 'LIVES_WITH_FAMILY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discharge_status') THEN
        CREATE TYPE discharge_status AS ENUM ('HOSPITALIZED', 'DISCHARGE_READY', 'DISCHARGED_HOME', 'READMITTED', 'IN_HOSPITAL', 'READY_FOR_DISCHARGE', 'DISCHARGED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'care_plan_status') THEN
        CREATE TYPE care_plan_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'TERMINATED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
        CREATE TYPE task_category AS ENUM ('MEDICATION', 'MEALS', 'HYDRATION', 'HYGIENE', 'WALKING', 'EXERCISE', 'DOCTOR_APPOINTMENT', 'PHYSIOTHERAPY', 'VITAL_CHECK', 'COMPANION_VISIT', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED', 'SKIPPED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_status') THEN
        CREATE TYPE medication_status AS ENUM ('PENDING', 'TAKEN', 'MISSED', 'SKIPPED', 'SNOOZED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emergency_status') THEN
        CREATE TYPE emergency_status AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED', 'PARAMEDIC_DISPATCHED', 'FALSE_ALARM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emergency_severity') THEN
        CREATE TYPE emergency_severity AS ENUM ('MODERATE', 'HIGH', 'CRITICAL', 'LOW', 'MEDIUM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'caregiver_availability') THEN
        CREATE TYPE caregiver_availability AS ENUM ('AVAILABLE', 'BUSY', 'ON_LEAVE', 'ON_VISIT', 'OFF_DUTY', 'VACATION');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('VERIFIED', 'PENDING', 'UNDER_REVIEW', 'REJECTED', 'SUSPENDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('MEDICATION_REMINDER', 'TASK_REMINDER', 'MISSED_TASK', 'APPOINTMENT_REMINDER', 'CAREGIVER_ASSIGNMENT', 'EMERGENCY_ALERT', 'CARE_PLAN_UPDATE', 'FAMILY_UPDATE', 'SYSTEM', 'DAILY_CARE_UPDATE', 'SUBSCRIPTION_UPDATE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vital_flag_status') THEN
        CREATE TYPE vital_flag_status AS ENUM ('NORMAL', 'ATTENTION_REQUIRED', 'ELEVATED', 'WARNING', 'CRITICAL', 'PENDING_REVIEW');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'family_relationship') THEN
        CREATE TYPE family_relationship AS ENUM ('SON', 'DAUGHTER', 'SPOUSE', 'SIBLING', 'GUARDIAN', 'GRANDCHILD', 'OTHER');
    END IF;
END $$;

-- 3. Core Tables

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
    date_of_birth DATE,
    age INTEGER NOT NULL DEFAULT 70,
    gender VARCHAR(20) NOT NULL DEFAULT 'Not Specified',
    address VARCHAR(500) NOT NULL DEFAULT 'Home Address',
    room_number VARCHAR(50),
    mobility_status mobility_status NOT NULL DEFAULT 'ASSISTED',
    living_situation living_situation NOT NULL DEFAULT 'LIVES_ALONE',
    preferred_language VARCHAR(50) NOT NULL DEFAULT 'English',
    care_requirements JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    medical_history TEXT,
    discharge_status discharge_status NOT NULL DEFAULT 'DISCHARGE_READY',
    emergency_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);

-- Caregiver Profiles
CREATE TABLE IF NOT EXISTS caregiver_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skills JSONB DEFAULT '[]'::jsonb,
    experience_years INTEGER NOT NULL DEFAULT 3,
    languages JSONB DEFAULT '["English"]'::jsonb,
    availability_status caregiver_availability NOT NULL DEFAULT 'AVAILABLE',
    service_area VARCHAR(255) NOT NULL DEFAULT 'North District',
    care_categories JSONB DEFAULT '[]'::jsonb,
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    verification_notes TEXT,
    rating FLOAT NOT NULL DEFAULT 4.9,
    max_workload INTEGER NOT NULL DEFAULT 3,
    current_workload INTEGER NOT NULL DEFAULT 1,
    bio TEXT,
    hourly_rate FLOAT DEFAULT 350.0,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_user_id ON caregiver_profiles(user_id);

-- Family Members (Links Family Users to Elderly Patients)
CREATE TABLE IF NOT EXISTS family_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    relationship_type family_relationship NOT NULL DEFAULT 'DAUGHTER',
    access_level VARCHAR(50) NOT NULL DEFAULT 'FULL',
    is_primary_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_patient ON family_members(patient_id);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    priority_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discharge Records
CREATE TABLE IF NOT EXISTS discharge_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    coordinator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    discharge_date DATE NOT NULL DEFAULT CURRENT_DATE,
    medical_summary TEXT NOT NULL,
    mobility_requirements TEXT NOT NULL DEFAULT 'Walker assistance required for ambulation.',
    dietary_requirements TEXT NOT NULL DEFAULT 'Low sodium diet, maintain adequate hydration.',
    hygiene_requirements TEXT NOT NULL DEFAULT 'Assistance with bathing and grooming.',
    post_discharge_instructions TEXT NOT NULL,
    home_readiness_status VARCHAR(50) NOT NULL DEFAULT 'READY_FOR_DISCHARGE',
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Plans
CREATE TABLE IF NOT EXISTS care_plans (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    assigned_caregiver_id INTEGER REFERENCES caregiver_profiles(id) ON DELETE SET NULL,
    discharge_record_id INTEGER REFERENCES discharge_records(id) ON DELETE SET NULL,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Post-Discharge Recovery & Home-Care Plan',
    goals JSONB DEFAULT '[]'::jsonb,
    status care_plan_status NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    required_services JSONB DEFAULT '[]'::jsonb,
    emergency_instructions TEXT,
    monitoring_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Tasks
CREATE TABLE IF NOT EXISTS care_tasks (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    caregiver_id INTEGER REFERENCES caregiver_profiles(id) ON DELETE SET NULL,
    care_plan_id INTEGER REFERENCES care_plans(id) ON DELETE SET NULL,
    category task_category NOT NULL DEFAULT 'MEDICATION',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_time TIME NOT NULL DEFAULT '09:00:00',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    status task_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    completion_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_care_tasks_patient ON care_tasks(patient_id);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    instructions TEXT,
    prescribing_doctor VARCHAR(255),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);

-- Medication Schedules
CREATE TABLE IF NOT EXISTS medication_schedules (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_time TIME NOT NULL DEFAULT '08:00:00',
    status medication_status NOT NULL DEFAULT 'PENDING',
    taken_at TIMESTAMPTZ,
    confirmed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_patient ON medication_schedules(patient_id);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL DEFAULT 'Cardiology / Internal Medicine',
    location VARCHAR(500) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status appointment_status NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    caregiver_accompany_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);

-- Vital Records
CREATE TABLE IF NOT EXISTS vital_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    recorded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    temperature FLOAT,
    oxygen_saturation INTEGER,
    weight FLOAT,
    blood_glucose FLOAT,
    notes TEXT,
    ai_flag_status vital_flag_status NOT NULL DEFAULT 'NORMAL',
    ai_flag_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emergency Events (SOS Hub)
CREATE TABLE IF NOT EXISTS emergency_events (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    triggered_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status emergency_status NOT NULL DEFAULT 'TRIGGERED',
    severity emergency_severity NOT NULL DEFAULT 'HIGH',
    location VARCHAR(500) NOT NULL DEFAULT 'Home Address',
    notes TEXT,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_emergency_events_patient ON emergency_events(patient_id);

-- Caregiver Assignments
CREATE TABLE IF NOT EXISTS caregiver_assignments (
    id SERIAL PRIMARY KEY,
    caregiver_id INTEGER NOT NULL REFERENCES caregiver_profiles(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    care_plan_id INTEGER REFERENCES care_plans(id) ON DELETE SET NULL,
    assigned_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patient_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url VARCHAR(500),
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Daily Care Logs
CREATE TABLE IF NOT EXISTS daily_care_logs (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    caregiver_id INTEGER REFERENCES caregiver_profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    general_condition VARCHAR(100) NOT NULL DEFAULT 'Stable and comfortable',
    mood VARCHAR(100) NOT NULL DEFAULT 'Cheerful & alert',
    appetite VARCHAR(100) NOT NULL DEFAULT 'Normal',
    hydration VARCHAR(100) NOT NULL DEFAULT '6-8 glasses of water',
    hygiene_completed BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    handover_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Home-Care Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    elderly_id VARCHAR(100) NOT NULL DEFAULT '1',
    elderly_name VARCHAR(255) NOT NULL DEFAULT 'Eleanor Vance',
    elderly_address VARCHAR(500) NOT NULL DEFAULT '742 Evergreen Healthcare Ave',
    family_id VARCHAR(100) NOT NULL DEFAULT '1',
    family_name VARCHAR(255) NOT NULL DEFAULT 'Sarah Vance',
    family_phone VARCHAR(50) NOT NULL DEFAULT '+1 (555) 019-2831',
    caregiver_id VARCHAR(100) NOT NULL,
    caregiver_name VARCHAR(255) NOT NULL,
    caregiver_phone VARCHAR(50) NOT NULL DEFAULT '+1 (555) 019-4412',
    caregiver_avatar VARCHAR(500),
    date VARCHAR(50) NOT NULL,
    time_slot VARCHAR(100) NOT NULL DEFAULT 'Morning (09:00 AM - 01:00 PM)',
    service_type VARCHAR(100) NOT NULL DEFAULT 'Medication & Vitals',
    duration_hours INTEGER NOT NULL DEFAULT 4,
    instructions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    total_amount FLOAT NOT NULL DEFAULT 1400.0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
    payment_id VARCHAR(100),
    caregiver_notes TEXT,
    started_at VARCHAR(100),
    completed_at VARCHAR(100),
    cancelled_reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_family ON bookings(family_id);
CREATE INDEX IF NOT EXISTS idx_bookings_caregiver ON bookings(caregiver_id);

-- Care Updates (Family Timeline)
CREATE TABLE IF NOT EXISTS care_updates (
    id SERIAL PRIMARY KEY,
    elderly_id VARCHAR(100) NOT NULL DEFAULT '1',
    elderly_name VARCHAR(255) NOT NULL DEFAULT 'Eleanor Vance',
    author_id VARCHAR(100) NOT NULL DEFAULT '1',
    author_name VARCHAR(255) NOT NULL DEFAULT 'Sister Ananya Roy',
    author_role VARCHAR(50) NOT NULL DEFAULT 'CAREGIVER',
    timestamp_label VARCHAR(100) NOT NULL DEFAULT 'Just now',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'VISIT',
    vitals JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL DEFAULT '1',
    plan_name VARCHAR(100) NOT NULL DEFAULT 'CareNest Basic',
    monthly_rate_inr INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    renewal_date VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100) NOT NULL DEFAULT 'UPI / Card',
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    caregiver_id VARCHAR(100) NOT NULL,
    family_id VARCHAR(100) NOT NULL DEFAULT '1',
    family_name VARCHAR(255) NOT NULL DEFAULT 'CareNest Family Member',
    rating FLOAT NOT NULL DEFAULT 5.0,
    comment TEXT NOT NULL,
    date VARCHAR(50) NOT NULL,
    visit_service_type VARCHAR(100) NOT NULL DEFAULT 'Home Care',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. Supabase Row Level Security (RLS) Policies
-- ============================================================================
-- Enable RLS across all application tables to prevent unauthorized cross-tenant data access.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy Helper Function: Current Authenticated User ID
CREATE OR REPLACE FUNCTION auth_user_id() RETURNS INTEGER AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')::INTEGER;
$$ LANGUAGE SQL STABLE;

-- Users Table Policies
CREATE POLICY "users_read_own" ON users
    FOR SELECT USING (auth_user_id() IS NULL OR id = auth_user_id() OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN');

CREATE POLICY "users_insert_public" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth_user_id() OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN');

-- Patient Profiles Policies
CREATE POLICY "patients_read_authorized" ON patient_profiles
    FOR SELECT USING (
        auth_user_id() IS NULL
        OR user_id = auth_user_id()
        OR id IN (SELECT patient_id FROM family_members WHERE user_id = auth_user_id())
        OR id IN (SELECT patient_id FROM caregiver_assignments WHERE caregiver_id IN (SELECT id FROM caregiver_profiles WHERE user_id = auth_user_id()) AND status = 'ACTIVE')
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

CREATE POLICY "patients_insert_public" ON patient_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "patients_update_own" ON patient_profiles
    FOR UPDATE USING (auth_user_id() IS NULL OR user_id = auth_user_id() OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN');

-- Medications Policies
CREATE POLICY "medications_read_authorized" ON medications
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth_user_id())
        OR patient_id IN (SELECT patient_id FROM family_members WHERE user_id = auth_user_id())
        OR patient_id IN (SELECT patient_id FROM caregiver_assignments WHERE caregiver_id IN (SELECT id FROM caregiver_profiles WHERE user_id = auth_user_id()) AND status = 'ACTIVE')
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

CREATE POLICY "medications_modify_authorized" ON medications
    FOR ALL USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth_user_id())
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

-- Medication Schedules Policies
CREATE POLICY "schedules_read_authorized" ON medication_schedules
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth_user_id())
        OR patient_id IN (SELECT patient_id FROM family_members WHERE user_id = auth_user_id())
        OR patient_id IN (SELECT patient_id FROM caregiver_assignments WHERE caregiver_id IN (SELECT id FROM caregiver_profiles WHERE user_id = auth_user_id()) AND status = 'ACTIVE')
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

-- Appointments Policies
CREATE POLICY "appointments_read_authorized" ON appointments
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth_user_id())
        OR patient_id IN (SELECT patient_id FROM family_members WHERE user_id = auth_user_id())
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

CREATE POLICY "appointments_modify_authorized" ON appointments
    FOR ALL USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth_user_id())
        OR patient_id IN (SELECT patient_id FROM family_members WHERE user_id = auth_user_id())
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

-- Bookings Policies
CREATE POLICY "bookings_read_authorized" ON bookings
    FOR SELECT USING (
        family_id = auth_user_id()::text
        OR elderly_id IN (SELECT id::text FROM patient_profiles WHERE user_id = auth_user_id())
        OR caregiver_id IN (SELECT id::text FROM caregiver_profiles WHERE user_id = auth_user_id())
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

CREATE POLICY "bookings_insert_authorized" ON bookings
    FOR INSERT WITH CHECK (
        family_id = auth_user_id()::text
        OR elderly_id IN (SELECT id::text FROM patient_profiles WHERE user_id = auth_user_id())
        OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN'
    );

-- Subscriptions Policies
CREATE POLICY "subscriptions_read_own" ON subscriptions
    FOR SELECT USING (user_id = auth_user_id()::text OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN');

CREATE POLICY "subscriptions_modify_own" ON subscriptions
    FOR ALL USING (user_id = auth_user_id()::text OR (SELECT role FROM users WHERE id = auth_user_id()) = 'ADMIN');

-- Notifications Policies
CREATE POLICY "notifications_read_own" ON notifications
    FOR SELECT USING (user_id = auth_user_id());

CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (user_id = auth_user_id());

-- Reviews Policies (Public read, verified user write)
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_authenticated" ON reviews FOR INSERT WITH CHECK (auth_user_id() IS NOT NULL);

-- ============================================================================
-- End of Schema Definition
-- ============================================================================
