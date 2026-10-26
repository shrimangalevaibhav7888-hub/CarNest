from typing import List, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.security import decode_token
from app.models.entities import User
from app.models.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts user identity from JWT bearer token or HttpOnly cookie and fetches user from DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check Authorization header first, fallback to cookie
    active_token = token
    if not active_token:
        active_token = request.cookies.get("carenest_token")

    if not active_token:
        raise credentials_exception

    payload = decode_token(active_token)
    if payload is None:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except (ValueError, TypeError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )

    return user


def get_optional_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extracts user identity if provided via bearer token or cookie.
    Returns None if no credentials are provided or if token is invalid, allowing public/guest read-write.
    """
    active_token = token
    if not active_token:
        active_token = request.cookies.get("carenest_token")

    if not active_token:
        return None

    payload = decode_token(active_token)
    if payload is None:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user and user.is_active:
            return user
    except Exception:
        pass

    return None



def require_roles(allowed_roles: List[UserRole]):
    """
    Role-Based Access Control (RBAC) dependency factory.
    """
    # Expand PATIENT/ELDERLY to both
    expanded_roles = set(allowed_roles)
    if UserRole.PATIENT in expanded_roles or UserRole.ELDERLY in expanded_roles:
        expanded_roles.add(UserRole.PATIENT)
        expanded_roles.add(UserRole.ELDERLY)

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in expanded_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker


# Role-specific preconfigured dependencies
get_patient_user = require_roles([UserRole.PATIENT, UserRole.ELDERLY])
get_family_user = require_roles([UserRole.FAMILY])
get_caregiver_user = require_roles([UserRole.CAREGIVER])
get_hospital_user = require_roles([UserRole.HOSPITAL])
get_admin_user = require_roles([UserRole.ADMIN])
