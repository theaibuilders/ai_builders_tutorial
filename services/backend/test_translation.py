#!/usr/bin/env python3
"""
Test translation pipeline - runs synchronously to show all errors
"""

import asyncio
import sys
import logging

# Set up verbose logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import after setting up logging
from config import settings
from services.github_storage import GitHubStorageManager
from services.zeabur_service import ZeaburService

async def test_translation():
    print("\n" + "="*60)
    print("TRANSLATION PIPELINE DIAGNOSTIC TEST")
    print("="*60)
    
    # Check configuration
    print("\n[1] CHECKING CONFIGURATION...")
    print(f"    ZEABUR_API_KEY: {'✓ Set' if settings.ZEABUR_API_KEY else '✗ Not set'}")
    print(f"    OPENAI_API_KEY: {'✓ Set' if settings.OPENAI_API_KEY else '✗ Not set'}")
    print(f"    GITHUB_TOKEN: {'✓ Set' if settings.GITHUB_TOKEN else '✗ MISSING'}")
    print(f"    GITHUB_REPO: {settings.GITHUB_REPO_OWNER}/{settings.GITHUB_REPO_NAME}")
    print(f"    TRANSLATION_MODEL: {settings.TRANSLATION_MODEL}")
    print(f"    ZEABUR_ENDPOINT: {settings.ZEABUR_ENDPOINT}")
    
    if not settings.ZEABUR_API_KEY and not settings.OPENAI_API_KEY:
        print("\n❌ ERROR: Neither ZEABUR_API_KEY nor OPENAI_API_KEY is set!")
        return
    
    if not settings.GITHUB_TOKEN:
        print("\n❌ ERROR: GITHUB_TOKEN is not set!")
        return
    
    # Test GitHub access
    print("\n[2] TESTING GITHUB ACCESS...")
    github = GitHubStorageManager()
    
    source_file = "Overview/tutorial_overview.mdx"
    print(f"    Reading: {source_file}")
    
    try:
        content = await github.read_file(source_file, "en")
        if content:
            print(f"    ✓ Successfully read file ({len(content)} chars)")
            print(f"    First 100 chars: {content[:100]}...")
        else:
            print(f"    ✗ File not found!")
            print(f"    Looking at: services/frontend/tutorials/{source_file}")
            return
    except Exception as e:
        print(f"    ✗ GitHub read error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test Zeabur connection
    print("\n[3] TESTING AI TRANSLATION SERVICE...")
    zeabur = ZeaburService()
    
    if zeabur.use_openai_direct:
        print("    Provider: OpenAI (direct)")
    else:
        print("    Provider: Zeabur AI Hub")
    
    test_text = "# Hello\n\nThis is a test paragraph."
    print(f"    Testing with: '{test_text[:30]}...'")
    
    try:
        result = await zeabur.translate_mdx(test_text, "zh-cn")
        if result:
            print(f"    ✓ Translation successful!")
            print(f"    Result: {result[:100]}...")
        else:
            print(f"    ✗ Translation returned empty result")
            return
    except Exception as e:
        print(f"    ✗ Zeabur translation error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Full translation test
    print("\n[4] FULL TRANSLATION TEST...")
    print(f"    Translating: {source_file} -> zh-cn")
    
    try:
        translated = await zeabur.translate_mdx(content, "zh-cn")
        if translated:
            print(f"    ✓ Full translation successful! ({len(translated)} chars)")
            print(f"    First 200 chars:\n    {translated[:200]}...")
        else:
            print(f"    ✗ Full translation returned empty")
            return
    except Exception as e:
        print(f"    ✗ Full translation error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test GitHub write
    print("\n[5] TESTING GITHUB WRITE...")
    print(f"    Writing to: tutorials-zh-cn/{source_file}")
    
    try:
        success = await github.write_file(
            source_file,
            translated,
            "zh-cn",
            "Test translation commit"
        )
        if success:
            print(f"    ✓ Successfully wrote translated file!")
        else:
            print(f"    ✗ Write returned False")
    except Exception as e:
        print(f"    ✗ GitHub write error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "="*60)
    print("✓ ALL TESTS PASSED!")
    if zeabur.use_openai_direct:
        print("  Using: OpenAI API (direct)")
    else:
        print("  Using: Zeabur AI Hub")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(test_translation())
