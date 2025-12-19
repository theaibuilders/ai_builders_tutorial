# Translation Pipeline Documentation

## Overview

The translation pipeline automatically translates tutorial content from English to Chinese (Simplified) and Japanese using Zeabur AI Hub's LLM services. Translations are stored in GitHub and accessible through a language selector in the web interface.

## Architecture

### Components

1. **Translation Service** (`services/backend/services/translation_service.py`)
   - Orchestrates the entire translation workflow
   - Manages translation requests and jobs
   - Coordinates between Zeabur AI Hub and GitHub storage

2. **Zeabur AI Hub Integration** (`services/backend/services/zeabur_service.py`)
   - Handles LLM-based translation
   - Supports MDX and Jupyter Notebook formats
   - Uses specialized prompts for different content types

3. **GitHub Storage Manager** (`services/backend/services/github_storage.py`)
   - Manages translated content in GitHub repository
   - Maintains translation metadata
   - Handles file operations via GitHub API

4. **Language Selector UI** (`services/frontend/src/islands/LanguageSelector.tsx`)
   - Dropdown component for language selection
   - Shows translation availability status
   - Persists user language preference

5. **Translation Router** (`services/backend/routers/translations.py`)
   - API endpoints for translation management
   - Background task processing
   - Status tracking and reporting

## Setup

### Backend Configuration

1. **Environment Variables** (`.env`)

```bash
# Translation Service
ZEABUR_API_KEY=sk-your-api-key-here
ZEABUR_ENDPOINT=tokyo  # or san_francisco
TRANSLATION_MODEL=gpt-4o
GITHUB_TOKEN=ghp_your-github-token
GITHUB_REPO_OWNER=theaibuilders
GITHUB_REPO_NAME=ai_builders_tutorial
TRANSLATION_BATCH_SIZE=5
TRANSLATION_RETRY_LIMIT=3
AUTO_TRANSLATE_ENABLED=false
```

2. **Get Zeabur API Key**
   - Visit [zeabur.com/ai-hub](https://zeabur.com/ai-hub)
   - Create an account or sign in
   - Generate an API key
   - Add to `.env` file

3. **Get GitHub Personal Access Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Select scopes: `repo` (full control of private repositories)
   - Copy token and add to `.env` file

### Frontend Configuration

1. **Environment Variables** (`.env`)

```bash
PUBLIC_BACKEND_URL=http://localhost:8000
```

For production, update to your deployed backend URL.

### Required Python Packages

Add to `requirements.txt`:
```
openai>=1.0.0
requests>=2.31.0
```

Install dependencies:
```bash
cd services/backend
pip install -r requirements.txt
```

## Usage

### Manual Translation

#### Via API

**Submit Translation Request:**
```bash
curl -X POST "http://localhost:8000/api/translations/request" \
  -H "Content-Type: application/json" \
  -d '{
    "source_files": ["Audio/deepgram_tutorial.ipynb"],
    "target_languages": ["zh-cn", "ja-jp"],
    "priority": "manual"
  }'
```

**Check Translation Status:**
```bash
curl "http://localhost:8000/api/translations/status/{request_id}"
```

**Check Available Translations:**
```bash
curl "http://localhost:8000/api/translations/available?source_file_path=Audio/deepgram_tutorial.ipynb"
```

#### Via Python

```python
import requests

# Submit request
response = requests.post(
    "http://localhost:8000/api/translations/request",
    json={
        "source_files": ["Audio/deepgram_tutorial.ipynb"],
        "target_languages": ["zh-cn", "ja-jp"],
        "priority": "manual"
    }
)

request_id = response.json()["request_id"]
print(f"Translation request created: {request_id}")

# Check status
status_response = requests.get(
    f"http://localhost:8000/api/translations/status/{request_id}"
)

print(status_response.json())
```

### Using the Language Selector

1. Navigate to any tutorial page
2. Click the language selector in the top-right corner
3. Select your preferred language (English, 中文, or 日本語)
4. If translation is available, the page reloads with translated content
5. If unavailable, you'll see a notification

Language preference is saved in browser localStorage and persists across sessions.

## Directory Structure

```
ai_builders_tutorial/
├── tutorials/               # English (original)
│   ├── Audio/
│   ├── Automation/
│   └── ...
├── tutorials-zh-cn/         # Chinese translations
│   ├── Audio/
│   ├── Automation/
│   ├── ...
│   └── translation-metadata.json
└── tutorials-ja-jp/         # Japanese translations
    ├── Audio/
    ├── Automation/
    ├── ...
    └── translation-metadata.json
```

## Translation Metadata

Each language directory contains a `translation-metadata.json` file:

```json
{
  "translations": {
    "Audio/deepgram_tutorial.ipynb": {
      "original_path": "Audio/deepgram_tutorial.ipynb",
      "translated_path": "tutorials-zh-cn/Audio/deepgram_tutorial.ipynb",
      "language": "zh-CN",
      "translation_date": "2025-12-19T10:30:00Z",
      "source_hash": "abc123def456",
      "model_used": "gpt-4o",
      "status": "completed"
    }
  },
  "last_updated": "2025-12-19T10:30:00Z",
  "version": "1.0"
}
```

## Translation Quality

### Prompts

The system uses specialized prompts for different content types:

**MDX Files:**
- Preserves all markdown formatting
- Maintains code block boundaries
- Keeps URLs and links unchanged
- Translates only natural language text

**Jupyter Notebooks:**
- Translates markdown cells only
- Keeps code cells completely unchanged
- Preserves cell execution order
- Maintains notebook structure

### Validation

After translation, the system validates:
- JSON structure (for notebooks)
- Code cell integrity
- Code block count
- Overall content structure

## Workflow

### Manual Translation Flow

```
1. Admin submits request
2. Request added to queue
3. For each file/language:
   a. Read source file
   b. Calculate source hash
   c. Translate via Zeabur AI Hub
   d. Validate translation
   e. Store in GitHub
   f. Update metadata
4. Mark request complete
```

### Automatic Translation (Future)

When enabled, the system will:
1. Detect file changes in tutorials directory
2. Calculate file hash
3. Compare with metadata
4. Trigger translation if hash changed
5. Update all affected language versions

## Troubleshooting

### Translation Fails

**Error: "ZEABUR_API_KEY not configured"**
- Solution: Add your Zeabur API key to `.env` file

**Error: "GitHub storage not configured"**
- Solution: Add GitHub token to `.env` file
- Ensure token has `repo` permissions

**Error: "Source file not found"**
- Solution: Verify file path is correct
- Check file exists in tutorials directory

### Translation Quality Issues

**Code blocks translated:**
- Check prompt is correctly preserving code blocks
- Review Zeabur AI Hub model settings
- Consider using Claude model for better formatting preservation

**Metadata not updating:**
- Verify GitHub token permissions
- Check GitHub API rate limits
- Review logs for commit errors

### Language Selector Not Working

**Language selector not visible:**
- Check frontend build completed successfully
- Verify component imported in TutorialLayout
- Check browser console for errors

**Translation status shows incorrect:**
- Verify backend API is accessible
- Check metadata file in GitHub repository
- Review API response in browser network tab

## API Reference

### POST /api/translations/request

Submit a manual translation request.

**Request Body:**
```json
{
  "source_files": ["string"],
  "target_languages": ["zh-cn", "ja-jp"],
  "priority": "manual"
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "source_files": ["string"],
  "target_languages": ["zh-cn", "ja-jp"],
  "priority": "manual",
  "status": "queued",
  "created_at": "2025-12-19T10:30:00Z"
}
```

### GET /api/translations/status/{request_id}

Check translation request status.

**Response:**
```json
{
  "request_id": "uuid",
  "status": "completed",
  "total_jobs": 2,
  "completed_jobs": 2,
  "failed_jobs": 0,
  "created_at": "2025-12-19T10:30:00Z",
  "updated_at": "2025-12-19T10:35:00Z"
}
```

### GET /api/translations/available

List available translations for a file.

**Query Parameters:**
- `source_file_path`: Path to source file (required)

**Response:**
```json
{
  "source_file": "Audio/deepgram_tutorial.ipynb",
  "available_languages": ["zh-cn", "ja-jp"],
  "translation_status": {
    "zh-cn": "completed",
    "ja-jp": "completed"
  }
}
```

### POST /api/translations/retrigger

Re-translate specific files.

**Request Body:**
```json
{
  "source_files": ["string"],
  "target_languages": ["zh-cn", "ja-jp"],
  "priority": "manual"
}
```

### GET /api/translations/config

Get current translation configuration.

**Response:**
```json
{
  "zeabur_endpoint": "tokyo",
  "translation_model": "gpt-4o",
  "batch_size": 5,
  "retry_limit": 3,
  "auto_translate_enabled": false
}
```

## Performance Considerations

### Processing Times

- Small tutorial (< 5KB): 10-20 seconds
- Medium tutorial (5-20KB): 30-60 seconds
- Large tutorial (> 20KB): 60-120 seconds

### Optimization

1. **Batch Processing**: Group multiple files in one request
2. **Caching**: Translation metadata cached in memory
3. **Rate Limiting**: Respects Zeabur AI Hub API limits
4. **Retry Logic**: Exponential backoff for failed requests

## Cost Estimation

Based on Zeabur AI Hub pricing:

- GPT-4o: ~$0.005 per tutorial (average)
- Claude Sonnet 4.5: ~$0.008 per tutorial (average)

Total cost for all tutorials (42 files × 2 languages):
- Estimated: $0.42 - $0.67 per complete translation batch

## Future Enhancements

1. **Automatic Translation**: Detect file changes and auto-translate
2. **Translation Review**: Human review workflow
3. **Translation Memory**: Reuse previous translations
4. **More Languages**: Korean, Spanish, French, etc.
5. **Analytics Dashboard**: Track usage and costs
6. **Incremental Updates**: Translate only changed content
7. **Community Contributions**: Allow community translation feedback

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review logs in backend service
3. Check GitHub Issues
4. Contact development team

## License

Same as main project license.
