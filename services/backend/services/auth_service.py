from datetime import datetime, timedelta
from jose import JWTError, jwt
from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings
from models import TokenData, User
from typing import Optional

class AuthService:
    def create_access_token(self, data: dict) -> str:
        """Create JWT token for your app"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            email: str = payload.get("email")
            user_id: int = payload.get("user_id")
            
            if email is None:
                return None
            
            return TokenData(email=email, user_id=user_id)
        except JWTError:
            return None
    
    async def verify_google_token(self, credential: str) -> Optional[dict]:
        """Verify Google OAuth token"""
        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            return {
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "picture": idinfo.get("picture"),
                "google_id": idinfo.get("sub")
            }
        except Exception as e:
            # Log error type without exposing token details
            print(f"Error verifying Google token: {type(e).__name__}")
            return None

auth_service = AuthService()
