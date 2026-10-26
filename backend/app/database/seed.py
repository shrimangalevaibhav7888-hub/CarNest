from datetime import datetime, date, time, timedelta
from app.database.session import SessionLocal, init_db
from app.models.entities import (
    User, Hospital, PatientProfile, CaregiverProfile, FamilyMember,
    EmergencyContact, DischargeRecord, CarePlan, CareTask, Medication,
    MedicationSchedule, Appointment, VitalRecord, EmergencyEvent,
    CaregiverAssignment, Notification, AuditLog
)
from app.models.enums import (
    UserRole, MobilityStatus, LivingSituation, DischargeStatus,
    HomeReadinessStatus, CarePlanStatus, TaskCategory, TaskPriority,
    TaskStatus, MedicationStatus, AppointmentStatus, EmergencyStatus,
    EmergencySeverity, CaregiverAvailability, VerificationStatus,
    NotificationType, VitalFlagStatus, FamilyRelationship
)
from app.auth.security import get_password_hash
from app.utils.logger import logger


def seed_database():
    """Populates the database with realistic demonstration data for all user roles."""
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "patient@carenest.ai").first()
        if existing_user:
            logger.info("Database already seeded with demo records. Skipping seed.")
            return

        logger.info("Seeding CareNest AI database with complete medical & care ecosystem data...")

        default_hashed_pwd = get_password_hash("Password123!")

        # 1. Create Hospital
        hospital = Hospital(
            name="St. Jude General & Geriatric Hospital",
            address="742 Evergreen Healthcare Ave, Metro City",
            contact_phone="+1 (555) 019-2831",
            contact_email="discharge@stjudehealth.org",
            license_number="HOSP-NY-98421"
        )
        db.add(hospital)
        db.flush()

        # 2. Create Users for all 5 Roles
        # Hospital Coordinator
        hospital_user = User(
            email="hospital@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="Dr. Clara Hughes, MD",
            role=UserRole.HOSPITAL,
            phone="+1 (555) 019-8801",
            avatar_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
        )
        db.add(hospital_user)

        # Admin
        admin_user = User(
            email="admin@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="Alex Mercer (Admin)",
            role=UserRole.ADMIN,
            phone="+1 (555) 019-9900",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
        )
        db.add(admin_user)

        # Caregiver 1 (Primary)
        caregiver_user1 = User(
            email="caregiver@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="David Miller, RN",
            role=UserRole.CAREGIVER,
            phone="+1 (555) 019-4412",
            avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
        )
        db.add(caregiver_user1)

        # Caregiver 2 (Secondary)
        caregiver_user2 = User(
            email="elena@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="Elena Rostova, CNA",
            role=UserRole.CAREGIVER,
            phone="+1 (555) 019-4413",
            avatar_url="https://images.unsplash.com/photo-1594824813590-7813a8f4c022?w=150&auto=format&fit=crop&q=80"
        )
        db.add(caregiver_user2)

        # Patient 1 (Primary: Eleanor Vance)
        patient_user1 = User(
            email="patient@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="Eleanor Vance",
            role=UserRole.PATIENT,
            phone="+1 (555) 019-1122",
            avatar_url="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=150&auto=format&fit=crop&q=80"
        )
        db.add(patient_user1)

        # Patient 2 (Arthur Pendelton)
        patient_user2 = User(
            email="arthur@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="Arthur Pendelton",
            role=UserRole.PATIENT,
            phone="+1 (555) 019-1133",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
        )
        db.add(patient_user2)

        # Family Member (Sarah Vance - Daughter of Eleanor)
        family_user = User(
            email="family@carenest.ai",
            hashed_password=default_hashed_pwd,
            full_name="Sarah Vance",
            role=UserRole.FAMILY,
            phone="+1 (555) 019-7733",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
        )
        db.add(family_user)
        db.flush()

        # 3. Create Caregiver Profiles
        caregiver_profile1 = CaregiverProfile(
            user_id=caregiver_user1.id,
            skills=["Geriatric Nursing", "Post-Stroke Rehabilitation", "Vital Sign Monitoring", "Medication Administration", "Fall Prevention"],
            experience_years=6,
            languages=["English", "Spanish"],
            availability_status=CaregiverAvailability.AVAILABLE,
            service_area="Metro North & Downtown",
            care_categories=["Post-Discharge Support", "Mobility Assistance", "Medication Management"],
            verification_status=VerificationStatus.VERIFIED,
            rating=4.95,
            max_workload=3,
            current_workload=1,
            bio="Registered nurse specializing in post-hospitalization geriatric transition care and neurological rehab.",
            hourly_rate=32.0,
            phone="+1 (555) 019-4412"
        )
        db.add(caregiver_profile1)

        caregiver_profile2 = CaregiverProfile(
            user_id=caregiver_user2.id,
            skills=["Certified Nursing Assistant", "Dementia Care", "Companionship", "Personal Hygiene Assistance", "Meal Preparation"],
            experience_years=4,
            languages=["English", "Russian"],
            availability_status=CaregiverAvailability.AVAILABLE,
            service_area="Metro South & Suburbs",
            care_categories=["Companionship", "Personal Care", "Day Care", "Nutrition"],
            verification_status=VerificationStatus.VERIFIED,
            rating=4.85,
            max_workload=3,
            current_workload=1,
            bio="Compassionate certified nursing assistant dedicated to dignified elderly home assistance and nutritional care.",
            hourly_rate=26.0,
            phone="+1 (555) 019-4413"
        )
        db.add(caregiver_profile2)
        db.flush()

        # 4. Create Patient Profiles
        patient_profile1 = PatientProfile(
            user_id=patient_user1.id,
            hospital_id=hospital.id,
            date_of_birth=date(1950, 4, 12),
            age=74,
            gender="Female",
            address="142 Oakridge Terrace, Apt 3B, Metro City",
            room_number="Room 402-B (Recent Discharge)",
            mobility_status=MobilityStatus.ASSISTED,
            living_situation=LivingSituation.LIVES_ALONE,
            preferred_language="English",
            care_requirements=["Mobility Walker Assistance", "Daily Blood Pressure Monitoring", "Medication Reminders", "Light Physical Therapy", "Low-Sodium Diet"],
            allergies=["Penicillin", "Sulfa Drugs"],
            medical_history="Ischemic stroke (resolved with mild right-side weakness), Essential Hypertension, Type 2 Diabetes.",
            discharge_status=DischargeStatus.DISCHARGED_HOME,
            emergency_notes="Mild gait instability on right side. Keep emergency pendant accessible at all times."
        )
        db.add(patient_profile1)

        patient_profile2 = PatientProfile(
            user_id=patient_user2.id,
            hospital_id=hospital.id,
            date_of_birth=date(1943, 9, 21),
            age=81,
            gender="Male",
            address="88 Pinecrest Lane, Metro City",
            room_number="Room 215-A (Awaiting Discharge)",
            mobility_status=MobilityStatus.WHEELCHAIR,
            living_situation=LivingSituation.LIVES_ALONE,
            preferred_language="English",
            care_requirements=["Wheelchair Transfers", "Cardiac Monitoring", "Oxygen Saturation Tracking", "Meal Prep"],
            allergies=["Aspirin", "Iodine Contrast"],
            medical_history="Congestive Heart Failure (NYHA Class II), Coronary Artery Stent, Osteoarthritis.",
            discharge_status=DischargeStatus.DISCHARGE_READY,
            emergency_notes="Requires supplemental O2 if saturation drops below 92%."
        )
        db.add(patient_profile2)
        db.flush()

        # 5. Link Family Member
        family_membership = FamilyMember(
            user_id=family_user.id,
            patient_id=patient_profile1.id,
            relationship_type=FamilyRelationship.DAUGHTER,
            access_level="FULL",
            is_primary_contact=True
        )
        db.add(family_membership)

        # 6. Emergency Contacts
        contact1 = EmergencyContact(
            patient_id=patient_profile1.id,
            name="Sarah Vance (Daughter)",
            relationship="Daughter",
            phone_number="+1 (555) 019-7733",
            alternate_phone="+1 (555) 019-7734",
            email="sarah.vance@gmail.com",
            is_primary=True,
            priority_order=1
        )
        contact2 = EmergencyContact(
            patient_id=patient_profile1.id,
            name="Dr. Robert Chen (Primary Physician)",
            relationship="Primary Care Doctor",
            phone_number="+1 (555) 019-3388",
            is_primary=False,
            priority_order=2
        )
        db.add_all([contact1, contact2])

        # 7. Discharge Records
        discharge1 = DischargeRecord(
            patient_id=patient_profile1.id,
            hospital_id=hospital.id,
            coordinator_id=hospital_user.id,
            discharge_date=date.today() - timedelta(days=2),
            medical_summary="Patient admitted for acute ischemic stroke. Successfully stabilized. Mild residual right hemiparesis. Medically fit for home recovery with qualified caregiver support.",
            mobility_requirements="Gait stability using four-wheel walker. Supervision required when transitioning from bed to chair.",
            dietary_requirements="Strict DASH / Low-sodium diet (<1500mg/day). Adequate hydration of minimum 1.5L water daily.",
            hygiene_requirements="Assist with seated shower and hygiene routine. Ensure bathroom grab bars are utilized.",
            post_discharge_instructions="Monitor BP daily (morning and evening). Maintain medication adherence. Accompany to follow-up cardiology visit in 7 days.",
            home_readiness_status=HomeReadinessStatus.DISCHARGED,
            follow_up_date=date.today() + timedelta(days=5)
        )
        discharge2 = DischargeRecord(
            patient_id=patient_profile2.id,
            hospital_id=hospital.id,
            coordinator_id=hospital_user.id,
            discharge_date=date.today(),
            medical_summary="Admitted for CHF exacerbation. Fluid overload resolved. Stable on oral diuretics and beta-blockers.",
            mobility_requirements="Wheelchair assistance and zero-fall protocol.",
            dietary_requirements="Fluid restriction to 1.8L daily, sodium-restricted diet.",
            hygiene_requirements="Complete assistance with personal hygiene.",
            post_discharge_instructions="Daily weight log each morning. Check for peripheral edema.",
            home_readiness_status=HomeReadinessStatus.CAREGIVER_REQUIRED,
            follow_up_date=date.today() + timedelta(days=7)
        )
        db.add_all([discharge1, discharge2])
        db.flush()

        # 8. Care Plan for Eleanor Vance
        care_plan1 = CarePlan(
            patient_id=patient_profile1.id,
            assigned_caregiver_id=caregiver_profile1.id,
            discharge_record_id=discharge1.id,
            created_by_user_id=hospital_user.id,
            title="Stroke Recovery & Independent Living Transition Plan",
            goals=[
                "Regain independent ambulatory confidence with walker",
                "Maintain blood pressure below 135/85 mmHg",
                "Zero missed medication doses for 30 consecutive days",
                "Complete daily 15-minute guided gentle physical therapy"
            ],
            status=CarePlanStatus.ACTIVE,
            start_date=date.today() - timedelta(days=2),
            end_date=date.today() + timedelta(days=28),
            required_services=["Vital Signs Check", "Medication Reminders", "Mobility Assistance", "Nutrition Support", "Companion Visits"],
            emergency_instructions="If sudden speech slurring, facial drooping, or arm weakness occurs, trigger EMERGENCY SOS immediately.",
            monitoring_requirements="Record Systolic/Diastolic BP, Heart Rate, and Blood Glucose twice daily."
        )
        db.add(care_plan1)
        db.flush()

        # 9. Caregiver Assignment
        assignment1 = CaregiverAssignment(
            caregiver_id=caregiver_profile1.id,
            patient_id=patient_profile1.id,
            care_plan_id=care_plan1.id,
            assigned_by_user_id=hospital_user.id,
            start_date=date.today() - timedelta(days=2),
            end_date=date.today() + timedelta(days=28),
            status="ACTIVE",
            notes="Assigned for morning and afternoon daily home-care visits."
        )
        db.add(assignment1)

        # 10. Medications & Schedules for Eleanor Vance
        med1 = Medication(
            patient_id=patient_profile1.id,
            name="Lisinopril",
            dosage="10 mg",
            frequency="Once daily in the morning",
            instructions="Take with full glass of water after breakfast. For blood pressure control.",
            prescribing_doctor="Dr. Clara Hughes, MD",
            start_date=date.today() - timedelta(days=2),
            is_active=True
        )
        med2 = Medication(
            patient_id=patient_profile1.id,
            name="Metformin HCl",
            dosage="500 mg",
            frequency="Twice daily with meals",
            instructions="Take with breakfast and dinner to regulate blood glucose.",
            prescribing_doctor="Dr. Clara Hughes, MD",
            start_date=date.today() - timedelta(days=2),
            is_active=True
        )
        med3 = Medication(
            patient_id=patient_profile1.id,
            name="Atorvastatin",
            dosage="20 mg",
            frequency="Once daily at bedtime",
            instructions="Take with or without food before sleeping.",
            prescribing_doctor="Dr. Clara Hughes, MD",
            start_date=date.today() - timedelta(days=2),
            is_active=True
        )
        db.add_all([med1, med2, med3])
        db.flush()

        # Today's Medication Schedules
        today = date.today()
        sched1 = MedicationSchedule(
            medication_id=med1.id,
            patient_id=patient_profile1.id,
            scheduled_date=today,
            scheduled_time=time(8, 0),
            status=MedicationStatus.TAKEN,
            taken_at=datetime.combine(today, time(8, 15)),
            confirmed_by_user_id=caregiver_user1.id,
            notes="Taken on time with oatmeal and green tea."
        )
        sched2 = MedicationSchedule(
            medication_id=med2.id,
            patient_id=patient_profile1.id,
            scheduled_date=today,
            scheduled_time=time(8, 0),
            status=MedicationStatus.TAKEN,
            taken_at=datetime.combine(today, time(8, 15)),
            confirmed_by_user_id=caregiver_user1.id,
            notes="Taken alongside Lisinopril."
        )
        sched3 = MedicationSchedule(
            medication_id=med2.id,
            patient_id=patient_profile1.id,
            scheduled_date=today,
            scheduled_time=time(19, 0),
            status=MedicationStatus.PENDING,
            notes="Evening dose with dinner."
        )
        sched4 = MedicationSchedule(
            medication_id=med3.id,
            patient_id=patient_profile1.id,
            scheduled_date=today,
            scheduled_time=time(21, 30),
            status=MedicationStatus.PENDING,
            notes="Nighttime statin."
        )
        db.add_all([sched1, sched2, sched3, sched4])

        # 11. Daily Care Tasks for Today
        tasks = [
            CareTask(
                patient_id=patient_profile1.id,
                caregiver_id=caregiver_profile1.id,
                care_plan_id=care_plan1.id,
                category=TaskCategory.VITAL_CHECK,
                title="Morning Vital Signs Recording",
                description="Check blood pressure, heart rate, and temperature before breakfast.",
                due_date=today,
                due_time=time(7, 45),
                priority=TaskPriority.HIGH,
                status=TaskStatus.COMPLETED,
                notes="BP: 126/82 mmHg, HR: 72 bpm. Patient rested and alert.",
                completion_time=datetime.combine(today, time(7, 50))
            ),
            CareTask(
                patient_id=patient_profile1.id,
                caregiver_id=caregiver_profile1.id,
                care_plan_id=care_plan1.id,
                category=TaskCategory.MEDICATION,
                title="Morning Medication Administration",
                description="Assist Eleanor with Lisinopril 10mg & Metformin 500mg.",
                due_date=today,
                due_time=time(8, 0),
                priority=TaskPriority.URGENT,
                status=TaskStatus.COMPLETED,
                notes="All morning doses successfully confirmed.",
                completion_time=datetime.combine(today, time(8, 15))
            ),
            CareTask(
                patient_id=patient_profile1.id,
                caregiver_id=caregiver_profile1.id,
                care_plan_id=care_plan1.id,
                category=TaskCategory.MEALS,
                title="Heart-Healthy Breakfast & Hydration",
                description="Prepare low-sodium breakfast (steamed eggs, whole grain toast) with 300ml water.",
                due_date=today,
                due_time=time(8, 30),
                priority=TaskPriority.MEDIUM,
                status=TaskStatus.COMPLETED,
                notes="Good appetite, finished meal completely.",
                completion_time=datetime.combine(today, time(8, 45))
            ),
            CareTask(
                patient_id=patient_profile1.id,
                caregiver_id=caregiver_profile1.id,
                care_plan_id=care_plan1.id,
                category=TaskCategory.PHYSIOTHERAPY,
                title="Supervised Mobility & Walking Routine",
                description="Accompany Eleanor on a 15-minute walker lap inside the garden corridor.",
                due_date=today,
                due_time=time(11, 0),
                priority=TaskPriority.HIGH,
                status=TaskStatus.PENDING,
                notes="Encourage steady heel-to-toe gait."
            ),
            CareTask(
                patient_id=patient_profile1.id,
                caregiver_id=caregiver_profile1.id,
                care_plan_id=care_plan1.id,
                category=TaskCategory.HYDRATION,
                title="Afternoon Hydration & Refreshment",
                description="Provide 250ml electrolyte/herbal tea and assist with comfortable seating.",
                due_date=today,
                due_time=time(14, 30),
                priority=TaskPriority.LOW,
                status=TaskStatus.PENDING,
                notes="Target: Ensure daily fluid goal reached."
            ),
            CareTask(
                patient_id=patient_profile1.id,
                caregiver_id=caregiver_profile1.id,
                care_plan_id=care_plan1.id,
                category=TaskCategory.VITAL_CHECK,
                title="Evening Blood Pressure & Glucose Check",
                description="Record evening vitals and log into CareNest portal.",
                due_date=today,
                due_time=time(18, 30),
                priority=TaskPriority.HIGH,
                status=TaskStatus.PENDING,
                notes="Review against morning baseline."
            )
        ]
        db.add_all(tasks)

        # 12. Upcoming Appointment
        appt = Appointment(
            patient_id=patient_profile1.id,
            doctor_name="Dr. Gregory Chen, Cardiologist",
            department="Cardiovascular Post-Discharge Clinic",
            location="Suite 300, St. Jude Outpatient Center",
            appointment_date=today + timedelta(days=5),
            appointment_time=time(10, 30),
            purpose="Post-stroke 1-week recovery milestone evaluation and ECG review.",
            status=AppointmentStatus.SCHEDULED,
            caregiver_accompany_required=True,
            notes="Wheelchair transport arranged for clinic transit."
        )
        db.add(appt)

        # 13. Historical Vitals for Eleanor Vance
        vitals = [
            VitalRecord(
                patient_id=patient_profile1.id,
                recorded_by_user_id=caregiver_user1.id,
                systolic_bp=138,
                diastolic_bp=88,
                heart_rate=78,
                temperature=36.7,
                oxygen_saturation=97,
                weight=64.5,
                blood_glucose=118.0,
                notes="Discharge baseline reading.",
                ai_flag_status=VitalFlagStatus.NORMAL,
                ai_flag_message="Vitals within safe post-discharge target ranges.",
                created_at=datetime.utcnow() - timedelta(days=2)
            ),
            VitalRecord(
                patient_id=patient_profile1.id,
                recorded_by_user_id=caregiver_user1.id,
                systolic_bp=132,
                diastolic_bp=84,
                heart_rate=74,
                temperature=36.6,
                oxygen_saturation=98,
                weight=64.4,
                blood_glucose=112.0,
                notes="Day 1 home recovery reading.",
                ai_flag_status=VitalFlagStatus.NORMAL,
                ai_flag_message="Blood pressure trending favorably towards target.",
                created_at=datetime.utcnow() - timedelta(days=1)
            ),
            VitalRecord(
                patient_id=patient_profile1.id,
                recorded_by_user_id=caregiver_user1.id,
                systolic_bp=126,
                diastolic_bp=82,
                heart_rate=72,
                temperature=36.6,
                oxygen_saturation=98,
                weight=64.2,
                blood_glucose=108.0,
                notes="Morning check today.",
                ai_flag_status=VitalFlagStatus.NORMAL,
                ai_flag_message="Optimal post-discharge vital metrics recorded.",
                created_at=datetime.utcnow() - timedelta(hours=4)
            )
        ]
        db.add_all(vitals)

        # 14. In-App Notifications
        notifications = [
            Notification(
                user_id=patient_user1.id,
                patient_id=patient_profile1.id,
                title="Morning Medications Completed",
                message="Your morning Lisinopril and Metformin were successfully confirmed by David Miller, RN.",
                type=NotificationType.MEDICATION_REMINDER,
                is_read=True
            ),
            Notification(
                user_id=family_user.id,
                patient_id=patient_profile1.id,
                title="Care Update: Eleanor Vance",
                message="Morning vitals recorded (BP: 126/82 mmHg). Overall care status is GREEN (Normal).",
                type=NotificationType.FAMILY_UPDATE,
                is_read=False
            ),
            Notification(
                user_id=caregiver_user1.id,
                patient_id=patient_profile1.id,
                title="Upcoming Task: Mobility Routine",
                message="Supervised walking session for Eleanor Vance is scheduled for 11:00 AM.",
                type=NotificationType.TASK_REMINDER,
                is_read=False
            ),
            Notification(
                user_id=hospital_user.id,
                patient_id=patient_profile2.id,
                title="Discharge Action Needed",
                message="Arthur Pendelton is ready for home-care plan creation and caregiver matching.",
                type=NotificationType.CARE_PLAN_UPDATE,
                is_read=False
            )
        ]
        db.add_all(notifications)

        # 15. Audit Log
        audit = AuditLog(
            user_id=caregiver_user1.id,
            action="MEDICATION_TAKEN",
            entity_type="MedicationSchedule",
            entity_id=sched1.id,
            new_values={"status": "TAKEN", "medication": "Lisinopril 10mg", "confirmed_by": "David Miller, RN"},
            ip_address="127.0.0.1"
        )
        db.add(audit)

        db.commit()
        logger.info("Successfully seeded CareNest AI database with complete realistic records!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
