# Translation Pipeline System

## 🌍 Overview

A comprehensive translation pipeline that automatically translates AI tutorial content from English to Chinese (Simplified) and Japanese using Zeabur AI Hub's LLM services.

## ✨ Features

- **Automated Translation**: LLM-powered translation preserving code and formatting
- **Multi-Language Support**: English, Chinese (简体中文), Japanese (日本語)
- **GitHub Integration**: Translations stored in organized repository structure
- **Web Interface**: Language selector with real-time availability status
- **Quality Validation**: Automatic checks for translation integrity
- **Retry Logic**: Built-in error handling and retry mechanisms
- **API Management**: RESTful API for translation operations

## 🚀 Quick Start

See [TRANSLATION_QUICKSTART.md](./TRANSLATION_QUICKSTART.md) for a 5-minute setup guide.

## 📚 Documentation

- **[Quick Start Guide](./TRANSLATION_QUICKSTART.md)** - Get started in 5 minutes
- **[Full Documentation](./TRANSLATION_PIPELINE.md)** - Complete technical reference
- **[Design Document](../.qoder/quests/translation-pipeline-setup.md)** - System architecture and design

## 🛠️ Technology Stack

### Backend
- **FastAPI**: REST API framework
- **Zeabur AI Hub**: LLM translation service (GPT-4o, Claude Sonnet)
- **GitHub API**: Content storage and version control
- **Pydantic**: Data validation and settings management

### Frontend
- **Astro**: Static site framework
- **Preact**: Interactive components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling

## 📁 Project Structure

```
services/
├── backend/
│   ├── routers/
│   │   └── translations.py          # API endpoints
│   ├── services/
│   │   ├── translation_service.py   # Main orchestrator
│   │   ├── zeabur_service.py        # LLM integration
│   │   └── github_storage.py        # GitHub operations
│   └── models.py                    # Data models
│
├── frontend/
│   ├── src/
│   │   ├── islands/
│   │   │   └── LanguageSelector.tsx # Language switcher UI
│   │   ├── utils/
│   │   │   └── translation.ts       # Translation utilities
│   │   └── layouts/
│   │       └── TutorialLayout.astro # Main layout with selector
│   └── tutorials/                   # Original English content
│
├── tutorials-zh-cn/                 # Chinese translations
│   └── translation-metadata.json
│
└── tutorials-ja-jp/                 # Japanese translations
    └── translation-metadata.json
```

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```bash
ZEABUR_API_KEY=your_api_key
ZEABUR_ENDPOINT=tokyo
TRANSLATION_MODEL=gpt-4o
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=theaibuilders
GITHUB_REPO_NAME=ai_builders_tutorial
TRANSLATION_BATCH_SIZE=5
TRANSLATION_RETRY_LIMIT=3
AUTO_TRANSLATE_ENABLED=false
```

**Frontend** (`.env`):
```bash
PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📖 Usage Examples

### Translate a Single Tutorial

```bash
curl -X POST "http://localhost:8000/api/translations/request" \
  -H "Content-Type: application/json" \
  -d '{
    "source_files": ["Audio/deepgram_tutorial.ipynb"],
    "target_languages": ["zh-cn", "ja-jp"]
  }'
```

### Translate Multiple Tutorials

```python
import requests

response = requests.post(
    "http://localhost:8000/api/translations/request",
    json={
        "source_files": [
            "Audio/deepgram_tutorial.ipynb",
            "Automation/anygen.mdx",
            "Frameworks/langchain.ipynb"
        ],
        "target_languages": ["zh-cn", "ja-jp"],
        "priority": "manual"
    }
)

print(f"Request ID: {response.json()['request_id']}")
```

### Check Translation Status

```bash
curl "http://localhost:8000/api/translations/status/{request_id}"
```

### View Available Translations

```bash
curl "http://localhost:8000/api/translations/available?source_file_path=Audio/deepgram_tutorial.ipynb"
```

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/translations/request` | Submit translation request |
| GET | `/api/translations/status/{id}` | Check request status |
| GET | `/api/translations/available` | List available translations |
| POST | `/api/translations/retrigger` | Re-translate files |
| GET | `/api/translations/config` | Get configuration |
| PUT | `/api/translations/config` | Update configuration |

## 🌟 Translation Quality

### Specialized Prompts

- **MDX Files**: Preserves markdown formatting, code blocks, and links
- **Jupyter Notebooks**: Translates only markdown cells, keeps code intact
- **Technical Terms**: Maintains industry-standard terminology in English

### Validation

- JSON structure verification (notebooks)
- Code cell integrity checks
- Code block count validation
- Content structure preservation

## 📊 Performance

| Content Type | Average Size | Translation Time |
|--------------|--------------|------------------|
| Small tutorial | < 5KB | 10-20 seconds |
| Medium tutorial | 5-20KB | 30-60 seconds |
| Large tutorial | > 20KB | 60-120 seconds |

## 💰 Cost Estimation

**Per Tutorial:**
- GPT-4o: ~$0.005
- Claude Sonnet 4.5: ~$0.008

**Full Translation (42 tutorials × 2 languages):**
- Estimated: $0.42 - $0.67 per batch

## 🔍 Monitoring

Translation requests are processed in background tasks. Monitor progress via:

1. **API Status Endpoint**: Check request status
2. **Backend Logs**: Real-time processing logs
3. **GitHub Commits**: View translation commits
4. **Translation Metadata**: Check metadata files in translated directories

## 🐛 Troubleshooting

### Common Issues

**Translation fails:**
- Verify API keys are configured
- Check GitHub token permissions
- Review backend logs for errors

**Language selector not visible:**
- Rebuild frontend: `npm run build`
- Check browser console for errors
- Verify component import in layout

**Translated content not loading:**
- Verify translation completed successfully
- Check GitHub repository for translated files
- Clear browser cache and reload

See [Full Documentation](./TRANSLATION_PIPELINE.md#troubleshooting) for detailed troubleshooting guide.

## 🚧 Limitations

Current version does not include:
- Automatic translation on file changes (manual trigger only)
- Translation review workflow
- Translation memory/caching
- Support for languages beyond Chinese and Japanese

These features are planned for future releases.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Manual translation trigger
- ✅ GitHub storage integration
- ✅ Language selector UI
- ✅ Translation validation

### Phase 2 (Planned)
- ⏳ Automatic file change detection
- ⏳ Translation review workflow
- ⏳ Admin dashboard
- ⏳ Analytics and monitoring

### Phase 3 (Future)
- 📋 Additional languages (Korean, Spanish, French)
- 📋 Translation memory system
- 📋 Community translation feedback
- 📋 Incremental translation updates

## 🤝 Contributing

To contribute to the translation pipeline:

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Test translations for quality

## 📄 License

Same as main project license.

## 🆘 Support

- **Documentation**: See docs in `docs/` directory
- **Issues**: Report bugs on GitHub Issues
- **Questions**: Contact development team

## 🎉 Acknowledgments

- **Zeabur AI Hub**: LLM translation services
- **GitHub API**: Content storage
- **OpenAI SDK**: API client library
- **Astro & Preact**: Frontend framework

---

**Built with ❤️ by AI Builders Team**

For more information, visit [theaibuilders.dev](https://www.theaibuilders.dev)
