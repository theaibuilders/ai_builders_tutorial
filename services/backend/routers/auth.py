from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models import UserLogin, GoogleLogin, Token, User
from services.circle_service import circle_service
from services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Login with email/password
    Note: Circle doesn't verify passwords, so this checks Circle membership only
    """
    # Skip member check since the token doesn't have permission to list members
    # Instead, try to generate auth token directly - if user doesn't exist, this will fail
    
    # Get Circle auth token
    circle_tokens = await circle_service.get_auth_token(user_data.email)
    
    if not circle_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in community"
        )
    
    # Circle token generation succeeded, which means user exists
    # Extract user info from the response
    user_id = circle_tokens.get("community_member_id")
    email = circle_tokens.get("email")
    
    # Create your app's JWT token
    access_token = auth_service.create_access_token(
        data={
            "email": email,
            "user_id": str(user_id),
            "circle_token": circle_tokens["access_token"]
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
async def google_login(google_data: GoogleLogin):
    """Login with Google OAuth"""
    # Verify Google token
    google_user = await auth_service.verify_google_token(google_data.credential)
    
    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    
    email = google_user["email"]
    
    # Skip member check since the token doesn't have permission to list members
    # Instead, try to generate auth token directly - if user doesn't exist, this will fail
    
    # Get Circle auth token
    circle_tokens = await circle_service.get_auth_token(email)
    
    if not circle_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in community"
        )
    
    # Circle token generation succeeded, which means user exists
    # Extract user info from the response
    user_id = circle_tokens.get("community_member_id")
    
    # Create your app's JWT token
    access_token = auth_service.create_access_token(
        data={
            "email": email,
            "user_id": str(user_id),
            "circle_token": circle_tokens["access_token"],
            "google_id": google_user["google_id"]
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    
    # Verify JWT token
    token_data = auth_service.verify_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Since Circle's /me endpoint doesn't work with our token permissions,
    # we return the data stored in the JWT token itself
    email = token_data.email
    user_id = token_data.user_id
    
    if not email or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token data"
        )
    
    # Extract name from email (best we can do without Circle API access)
    name = email.split('@')[0].replace('.', ' ').title()
    
    return User(
        id=user_id,
        email=email,
        name=name,
        avatar_url=None  # We don't have avatar access without Circle API
    )


@router.post("/refresh")
async def refresh_access_token(refresh_token: str):
    """Refresh Circle access token"""
    tokens = await circle_service.refresh_token(refresh_token)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    return tokens
