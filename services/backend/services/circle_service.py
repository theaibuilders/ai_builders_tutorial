import httpx
from typing import Optional, Dict
from config import settings

class CircleService:
    def __init__(self):
        self.api_url = settings.CIRCLE_API_URL
        self.token = settings.CIRCLE_HEADLESS_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    async def get_auth_token(self, email: str) -> Optional[Dict]:
        """Generate Circle auth token for a user by email"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_url}/headless/auth_token",
                    headers=self.headers,
                    json={
                        "email": email,
                        "community_id": settings.CIRCLE_COMMUNITY_ID
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Circle auth token generated for: {email}")
                    return {
                        "access_token": data.get("access_token"),
                        "refresh_token": data.get("refresh_token"),
                        "expires_in": data.get("expires_in"),
                        "community_member_id": data.get("community_member_id"),
                        "email": email  # Store email since we can't query it later
                    }
                else:
                    print(f"❌ Failed to generate token for {email}")
                    print(f"Status: {response.status_code}")
                    print(f"Response: {response.text}")
                    return None
                
            except Exception as e:
                print(f"Error getting Circle token: {e}")
                return None
    
    async def verify_member(self, access_token: str) -> Optional[Dict]:
        """Verify Circle member with access token"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/me",
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                return None
                
            except Exception as e:
                print(f"Error verifying member: {e}")
                return None
    
    async def get_member_by_email(self, email: str) -> Optional[Dict]:
        """Get Circle member by email"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/community_members",
                    headers=self.headers,
                    params={"email": email},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for Circle API authentication errors
                    if data.get("status") == "unauthorized":
                        print(f"❌ Circle API Error: {data.get('message', 'Unauthorized')}")
                        print("⚠️  Please check your CIRCLE_HEADLESS_TOKEN in .env file")
                        print("📖 See docs/CIRCLE_AUTH_SETUP.md for token setup instructions")
                        return None
                    
                    members = data.get("community_members", [])
                    if members:
                        print(f"✅ Found member: {members[0].get('email')}")
                        return members[0]
                    else:
                        print(f"⚠️  No member found with email: {email}")
                        return None
                return None
                
            except Exception as e:
                print(f"Error fetching member: {e}")
                return None
    
    async def refresh_token(self, refresh_token: str) -> Optional[Dict]:
        """Refresh Circle access token"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_url}/headless/refresh_token",
                    headers=self.headers,
                    json={"refresh_token": refresh_token},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "access_token": data.get("access_token"),
                        "refresh_token": data.get("refresh_token"),
                        "expires_in": data.get("expires_in")
                    }
                return None
                
            except Exception as e:
                print(f"Error refreshing token: {e}")
                return None

circle_service = CircleService()
