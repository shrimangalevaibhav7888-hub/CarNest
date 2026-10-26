from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.entities import CaregiverProfile, PatientProfile
from app.models.enums import CaregiverAvailability, VerificationStatus
from app.schemas.caregiver import CaregiverResponse, CaregiverMatchResult


class CaregiverMatchingService:
    @staticmethod
    def match_caregivers(
        db: Session,
        patient_id: int,
        required_skills: Optional[List[str]] = None,
        preferred_language: Optional[str] = None,
        service_area: Optional[str] = None
    ) -> List[CaregiverMatchResult]:
        """
        Computes a multi-factor compatibility recommendation score (0-100%) for caregivers.
        """
        patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
        caregivers = db.query(CaregiverProfile).all()
        
        results: List[CaregiverMatchResult] = []

        patient_reqs = set([r.lower() for r in (required_skills or (patient.care_requirements if patient else []))])
        patient_lang = (preferred_language or (patient.preferred_language if patient else "English")).lower()

        for cg in caregivers:
            score = 40  # Baseline score
            reasons: List[str] = []

            # 1. Verification status
            if cg.verification_status == VerificationStatus.VERIFIED:
                score += 10
                reasons.append("Verified and background-checked professional")
            else:
                score -= 20

            # 2. Availability
            if cg.availability_status == CaregiverAvailability.AVAILABLE:
                score += 15
                reasons.append("Immediately available for shift assignment")
            elif cg.availability_status == CaregiverAvailability.BUSY:
                score -= 15
                reasons.append("Currently at high shift capacity")

            # 3. Workload Capacity
            workload_diff = cg.max_workload - cg.current_workload
            if workload_diff >= 2:
                score += 10
                reasons.append(f"Low current workload ({cg.current_workload}/{cg.max_workload} active patients)")
            elif workload_diff == 1:
                score += 5
                reasons.append(f"Moderate workload ({cg.current_workload}/{cg.max_workload} active patients)")
            else:
                score -= 20
                reasons.append("At full patient capacity")

            # 4. Skills Match
            cg_skills = set([s.lower() for s in (cg.skills or [])])
            overlap = patient_reqs.intersection(cg_skills)
            if overlap:
                match_bonus = min(20, len(overlap) * 7)
                score += match_bonus
                reasons.append(f"Direct skill match for: {', '.join([s.title() for s in list(overlap)[:2]])}")
            elif patient_reqs:
                # Partial keyword matching
                partial_match = False
                for req in patient_reqs:
                    for skill in cg_skills:
                        if any(w in skill for w in req.split() if len(w) > 3):
                            partial_match = True
                            break
                if partial_match:
                    score += 10
                    reasons.append("Strong clinical overlap with patient care requirements")

            # 5. Language Match
            cg_languages = [l.lower() for l in (cg.languages or ["english"])]
            if patient_lang in cg_languages:
                score += 10
                reasons.append(f"Fluent in patient's preferred language ({patient_lang.title()})")

            # 6. Rating & Experience bonus
            if cg.rating >= 4.8:
                score += 5
                reasons.append(f"Exceptional caregiver satisfaction rating ({cg.rating:.1f} ★)")
            if cg.experience_years >= 5:
                score += 5
                reasons.append(f"Senior practitioner with {cg.experience_years}+ years experience")

            # Clamp score between 10% and 99%
            final_score = max(10, min(99, score))

            # Build response schema
            cg_res = CaregiverResponse(
                id=cg.id,
                user_id=cg.user_id,
                full_name=cg.user.full_name if cg.user else "Caregiver",
                email=cg.user.email if cg.user else "",
                phone=cg.phone or (cg.user.phone if cg.user else None),
                avatar_url=cg.user.avatar_url if cg.user else None,
                skills=cg.skills or [],
                experience_years=cg.experience_years,
                languages=cg.languages or [],
                availability_status=cg.availability_status,
                service_area=cg.service_area,
                care_categories=cg.care_categories or [],
                verification_status=cg.verification_status,
                rating=cg.rating,
                max_workload=cg.max_workload,
                current_workload=cg.current_workload,
                bio=cg.bio,
                hourly_rate=cg.hourly_rate,
                created_at=cg.created_at
            )

            workload_status_str = f"{cg.current_workload}/{cg.max_workload} Patients"

            results.append(CaregiverMatchResult(
                caregiver=cg_res,
                match_score=final_score,
                matching_reasons=reasons,
                workload_status=workload_status_str
            ))

        # Sort descending by match score
        results.sort(key=lambda x: x.match_score, reverse=True)
        return results


caregiver_matching_service = CaregiverMatchingService()
