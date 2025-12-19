# Translation Pipeline Quick Start Guide

Get the translation pipeline up and running in 5 minutes!

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- Zeabur AI Hub API key ([get one here](https://zeabur.com/ai-hub))
- GitHub Personal Access Token with `repo` permissions

## Step 1: Configure Backend

1. Navigate to backend directory:
```bash
cd services/backend
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Edit `.env` and add your keys:
```bash
# Required for translation
ZEABUR_API_KEY=sk-your-zeabur-api-key
GITHUB_TOKEN=ghp_your-github-token

# Optional (defaults shown)
ZEABUR_ENDPOINT=tokyo
TRANSLATION_MODEL=gpt-4o
TRANSLATION_BATCH_SIZE=5
TRANSLATION_RETRY_LIMIT=3
AUTO_TRANSLATE_ENABLED=false
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Start backend server:
```bash
python main.py
```

Backend should now be running on `http://localhost:8000`

## Step 2: Configure Frontend

1. Navigate to frontend directory:
```bash
cd services/frontend
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Verify backend URL in `.env`:
```bash
PUBLIC_BACKEND_URL=http://localhost:8000
```

4. Install Node dependencies:
```bash
npm install
```

5. Start frontend dev server:
```bash
npm run dev
```

Frontend should now be running on `http://localhost:4321`

## Step 3: Test Translation

### Option A: Using API

```bash
curl -X POST "http://localhost:8000/api/translations/request" \
  -H "Content-Type: application/json" \
  -d '{
    "source_files": ["Overview/tutorial_overview.mdx"],
    "target_languages": ["zh-cn"],
    "priority": "manual"
  }'
```

Save the `request_id` from response, then check status:

```bash
curl "http://localhost:8000/api/translations/status/{request_id}"
```

### Option B: Using Python Script

Create `test_translation.py`:

```python
import requests
import time

# Submit translation request
response = requests.post(
    "http://localhost:8000/api/translations/request",
    json={
        "source_files": ["Overview/tutorial_overview.mdx"],
        "target_languages": ["zh-cn"],
        "priority": "manual"
    }
)

data = response.json()
request_id = data["request_id"]
print(f"✅ Translation request created: {request_id}")
print(f"   Translating: {data['source_files']}")
print(f"   Languages: {data['target_languages']}")

# Wait and check status
print("\n⏳ Processing translation...")
for i in range(30):  # Check for up to 60 seconds
    time.sleep(2)
    
    status_response = requests.get(
        f"http://localhost:8000/api/translations/status/{request_id}"
    )
    
    status_data = status_response.json()
    print(f"   Status: {status_data['status']} - " +
          f"Completed: {status_data['completed_jobs']}/{status_data['total_jobs']}")
    
    if status_data['status'] in ['completed', 'failed']:
        break

print("\n✨ Translation complete!")
```

Run it:
```bash
python test_translation.py
```

## Step 4: View Translated Content

1. Open browser to `http://localhost:4321`
2. Navigate to any tutorial page
3. Click the language selector (🌐 icon) in top-right
4. Select "中文" to view Chinese translation
5. Select "日本語" to view Japanese translation

If translation exists, page reloads with translated content!

## Verify Setup

### Check Backend Health
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Check Translation Config
```bash
curl http://localhost:8000/api/translations/config
# Expected: JSON with your configuration
```

### Check Available Translations
```bash
curl "http://localhost:8000/api/translations/available?source_file_path=Overview/tutorial_overview.mdx"
# Expected: List of available translations
```

## Troubleshooting

### Backend won't start

**Error: ModuleNotFoundError: No module named 'openai'**
```bash
pip install -r requirements.txt
```

**Error: ZEABUR_API_KEY not set**
- Check `.env` file exists in `services/backend/`
- Verify `ZEABUR_API_KEY` is set

### Frontend language selector not visible

**Check component import:**
- Verify `LanguageSelector.tsx` exists in `src/islands/`
- Check browser console for errors
- Try: `npm run build` then `npm run dev`

### Translation fails

**"GitHub storage not configured"**
- Add `GITHUB_TOKEN` to `.env`
- Ensure token has `repo` permissions

**"Translation validation failed"**
- Check Zeabur API key is valid
- Try different model: `TRANSLATION_MODEL=claude-sonnet-4-5`

### Can't see translated content

1. **Check translation completed:**
   ```bash
   curl "http://localhost:8000/api/translations/available?source_file_path=YOUR_FILE"
   ```

2. **Check GitHub repository:**
   - Look for `tutorials-zh-cn/` or `tutorials-ja-jp/` directories
   - Verify translated files exist

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Next Steps

1. **Translate More Tutorials:**
   ```python
   # Translate all tutorials in a category
   requests.post(
       "http://localhost:8000/api/translations/request",
       json={
           "source_files": [
               "Audio/deepgram_tutorial.ipynb",
               "Automation/anygen.mdx",
               "Automation/flowithos.mdx"
           ],
           "target_languages": ["zh-cn", "ja-jp"],
           "priority": "manual"
       }
   )
   ```

2. **Monitor Progress:**
   - Watch backend logs for translation progress
   - Check GitHub commits for new translations

3. **Production Deployment:**
   - Set up environment variables in production
   - Update `FRONTEND_URL` and `PUBLIC_BACKEND_URL`
   - Enable `AUTO_TRANSLATE_ENABLED=true` if desired

4. **Read Full Documentation:**
   - See `docs/TRANSLATION_PIPELINE.md` for complete guide
   - Review API reference for advanced features

## Quick Reference

### Translation Request
```bash
POST /api/translations/request
Body: {
  "source_files": ["path/to/file"],
  "target_languages": ["zh-cn", "ja-jp"],
  "priority": "manual"
}
```

### Check Status
```bash
GET /api/translations/status/{request_id}
```

### Check Availability
```bash
GET /api/translations/available?source_file_path={path}
```

### Retrigger Translation
```bash
POST /api/translations/retrigger
Body: {
  "source_files": ["path/to/file"],
  "target_languages": ["zh-cn"]
}
```

## Support

Having issues? Check:
1. Backend logs: `services/backend/` console output
2. Frontend logs: Browser console (F12)
3. Full documentation: `docs/TRANSLATION_PIPELINE.md`
4. Environment variables: Verify all required keys are set

## Success! 🎉

You now have a working translation pipeline that can:
- ✅ Translate tutorials to Chinese and Japanese
- ✅ Store translations in GitHub
- ✅ Display language selector on website
- ✅ Switch between languages seamlessly

Happy translating! 🌍
