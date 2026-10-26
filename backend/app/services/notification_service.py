from datetime import datetime
from typing import Optional, Any, Dict, List
from sqlalchemy.orm import Session
from app.models.entities import Notification, User
from app.models.enums import NotificationType
from app.services.websocket_manager import ws_manager
from app.utils.logger import logger


class NotificationService:
    @staticmethod
    async def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.SYSTEM,
        patient_id: Optional[int] = None,
        action_url: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """
        Creates an in-app notification record and broadcasts it via WebSocket if active.
        """
        notification = Notification(
            user_id=user_id,
            patient_id=patient_id,
            title=title,
            message=message,
            type=notification_type,
            is_read=False,
            action_url=action_url,
            metadata_json=metadata_json or {}
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        # Broadcast via Real-time WebSocket
        try:
            ws_payload = {
                "event": "NOTIFICATION_RECEIVED",
                "notification": {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "type": notification.type.value,
                    "patient_id": notification.patient_id,
                    "created_at": notification.created_at.isoformat()
                }
            }
            await ws_manager.send_personal_message(ws_payload, user_id)
        except Exception as e:
            logger.warning(f"Could not dispatch websocket notification: {e}")

        return notification

    @staticmethod
    async def broadcast_emergency_alert(
        db: Session,
        patient_name: str,
        patient_id: int,
        target_user_ids: List[int],
        severity: str = "HIGH"
    ):
        """
        Dispatches emergency alerts to all designated family, caregiver, and hospital coordinators.
        """
        for uid in target_user_ids:
            title = f"EMERGENCY SOS: {patient_name}"
            msg = f"Immediate attention required for patient {patient_name}. Severity: {severity}. Emergency event triggered."
            await NotificationService.create_notification(
                db=db,
                user_id=uid,
                title=title,
                message=msg,
                notification_type=NotificationType.EMERGENCY_ALERT,
                patient_id=patient_id,
                action_url=f"/patients/{patient_id}"
            )
            # Simulated SMS / WhatsApp integration log
            logger.info(f"[SIMULATED SMS/WHATSAPP] Emergency SMS sent to User ID {uid}: '{msg}'")


notification_service = NotificationService()
