from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import auth_service

security = HTTPBearer()

async def verify_token_middleware(credentials: HTTPAuthorizationCredentials):
    """Middleware to verify JWT tokens"""
    token = credentials.credentials
    
    token_data = auth_service.verify_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )
    
    return token_data
