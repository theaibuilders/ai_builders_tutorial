#!/usr/bin/env python3
"""
Circle Auth Backend Test Script

This script tests the Circle Headless API authentication backend.
Run this after setting up your .env file to verify everything works.
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    try:
        import config
        import models
        from services import circle_service, auth_service
        from routers import auth
        import main
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_config():
    """Test configuration loading"""
    print("\n🧪 Testing configuration...")
    try:
        from config import settings
        
        required_vars = [
            'CIRCLE_HEADLESS_TOKEN',
            'CIRCLE_COMMUNITY_ID',
            'GOOGLE_CLIENT_ID',
            'JWT_SECRET'
        ]
        
        for var in required_vars:
            value = getattr(settings, var, None)
            if not value or value.startswith('your_'):
                print(f"⚠️  Warning: {var} not configured properly")
                return False
            print(f"✅ {var} is set")
        
        print("✅ Configuration loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return False

def test_services():
    """Test service initialization"""
    print("\n🧪 Testing services...")
    try:
        from services.circle_service import circle_service
        from services.auth_service import auth_service
        
        # Test circle service
        assert hasattr(circle_service, 'get_auth_token')
        assert hasattr(circle_service, 'verify_member')
        assert hasattr(circle_service, 'get_member_by_email')
        print("✅ Circle service initialized")
        
        # Test auth service
        assert hasattr(auth_service, 'create_access_token')
        assert hasattr(auth_service, 'verify_token')
        print("✅ Auth service initialized")
        
        return True
    except Exception as e:
        print(f"❌ Service test failed: {e}")
        return False

def test_jwt():
    """Test JWT token creation and verification"""
    print("\n🧪 Testing JWT...")
    try:
        from services.auth_service import auth_service
        
        # Create a token
        token_data = {
            "email": "test@example.com",
            "user_id": 12345
        }
        token = auth_service.create_access_token(token_data)
        print(f"✅ Created JWT token: {token[:20]}...")
        
        # Verify the token
        verified = auth_service.verify_token(token)
        assert verified.email == "test@example.com"
        assert verified.user_id == 12345
        print("✅ JWT token verified successfully")
        
        return True
    except Exception as e:
        print(f"❌ JWT test failed: {e}")
        return False

def test_models():
    """Test Pydantic models"""
    print("\n🧪 Testing models...")
    try:
        from models import UserLogin, GoogleLogin, Token, User
        
        # Test UserLogin
        login = UserLogin(email="test@example.com", password="password123")
        assert login.email == "test@example.com"
        print("✅ UserLogin model works")
        
        # Test Token
        token = Token(access_token="test_token")
        assert token.token_type == "bearer"
        print("✅ Token model works")
        
        # Test User
        user = User(
            id=1,
            email="test@example.com",
            name="Test User"
        )
        assert user.name == "Test User"
        print("✅ User model works")
        
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Circle Auth Backend Test Suite")
    print("=" * 60)
    
    # Check .env exists
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("\n❌ Error: .env file not found!")
        print("Please create .env file from .env.example")
        return False
    
    print(f"✅ Found .env file at {env_file}")
    
    # Run tests
    tests = [
        test_imports,
        test_config,
        test_models,
        test_services,
        test_jwt
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test crashed: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if all(results):
        print("\n🎉 All tests passed! Backend is ready to use.")
        print("\nNext steps:")
        print("1. Start the backend: python main.py")
        print("2. Visit API docs: http://localhost:8000/docs")
        print("3. Test health: curl http://localhost:8000/health")
        return True
    else:
        print("\n⚠️  Some tests failed. Please check the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
