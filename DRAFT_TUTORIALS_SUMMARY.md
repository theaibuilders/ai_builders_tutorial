# Draft Tutorials Summary

## Overview

Your AI Builders Tutorial platform now displays **48 draft tutorials** when running in localhost mode. These drafts are automatically loaded from `/Users/devon/ai_builders_tutorial/tutorials_draft/` and appear in a special "🚧 Draft Tutorials" section in the sidebar.

## How to View Draft Tutorials

1. **Start the dev server:**
   ```bash
   cd services/frontend
   npm run dev
   ```

2. **Open in browser:** `http://localhost:4322`

3. **Look for the Draft section:** In the left sidebar, you'll see a yellow-themed "🚧 Draft Tutorials" collapsible section at the top (only visible on localhost)

## Draft Tutorials Available

### MDX Section (12 tutorials)

These are located in `tutorials_draft/mdx/`:

1. **ag_ui_tutorial.mdx** - AG UI Framework
2. **alex_sidebar_xcode.mdx** - Alex Sidebar for Xcode
3. **brightdata_mcp.mdx** - Bright Data MCP Integration
4. **brightdata_unlocker.mdx** - Bright Data Unlocker
5. **claude_code.mdx** - Claude Code Assistant
6. **cursor_tutorial.mdx** - Cursor: Go Beyond the AI Chat Panel
7. **gemini_cli.mdx** - Gemini CLI
8. **magic_mcp_TODO.mdx** - Magic MCP (TODO)
9. **openai_codex.mdx** - OpenAI Codex
10. **runpod_tutorial.mdx** - RunPod Tutorial
11. **vscode_extension.mdx** - VS Code Extension Development
12. **xcode_swift_assit.mdx** - Xcode Swift Assistant

**Note:** There are also 2 additional tutorials in `mdx/vibe_testing/`:
- octomind.mdx
- Qodo.mdx

(These nested files won't currently appear in the UI as the scanner doesn't support nested directories)

### Ipynb Section (36+ tutorials)

These are Jupyter notebooks located in `tutorials_draft/ipynb/`:

1. **ag2_tutorial.ipynb** - AG2 Framework
2. **agno_tutorial.ipynb** - Agno Tutorial
3. **browserbase_tutorial.ipynb** - Browserbase
4. **browsesafe.ipynb** - BrowseSafe
5. **claude_api_tutorial.ipynb** - Claude API
6. **cognee_tutorial.ipynb** - Cognee
7. **composio_tutorial.ipynb** - Composio
8. **context_problem_fit.ipynb** - Context Problem Fit
9. **dspy_tutoria.ipynb** - DSPy Tutorial
10. **e2b_tutorial.ipynb** - E2B Tutorial
11. **eleven_labs_tutorial.ipynb** - Eleven Labs
12. **exa_search_tutorial.ipynb** - Exa Search
13. **finetuning_openai.ipynb** - Fine-tuning with OpenAI
14. **firecrawl_tutorial.ipynb** - Firecrawl
15. **groq_tutorial.ipynb** - Groq
16. **haystack.ipynb** - Haystack
17. **huggingface_tutorial.ipynb** - Hugging Face
18. **instructor_tutorial.ipynb** - Instructor
19. **langfuse_tutorial.ipynb** - Langfuse
20. **livekit_tutorial_DOWITHMDX.ipynb** - LiveKit (TODO: Convert to MDX)
21. **lmdeploy_tutorial.ipynb** - LMDeploy
22. **openai_api_tutorial.ipynb** - OpenAI API
23. **perplexity_ai_api.ipynb** - Perplexity AI API
24. **pinecone.ipynb** - Pinecone
25. **promptflow_tutorial.ipynb** - Prompt Flow
26. **pydantic_ai.ipynb** - Pydantic AI
27. **ragas_tutorial.ipynb** - RAGAS
28. **serp_tutorial.ipynb** - SERP API
29. **sglang.ipynb** - SGLang
30. **streamlit_llm_tutorial.ipynb** - Streamlit LLM
31. **tavily_tutorial.ipynb** - Tavily
32. **traceloop_tutorial.ipynb** - Traceloop
33. **vllm.ipynb** - vLLM
34. **wan_video_gen_tutorial.ipynb** - WAN Video Gen
35. **wandb_weave.ipynb** - Weights & Biases Weave
36. **weaviate_tutorial.ipynb** - Weaviate

**Additional file in ipynb:**
- chat_assistant.prompty (not displayed - unsupported format)
- creatordb_youtube_tutorial.ipynb (in root of tutorials_draft)

## Technical Details

### Directory Structure

```
/Users/devon/ai_builders_tutorial/
└── tutorials_draft/
    ├── mdx/
    │   ├── *.mdx files
    │   └── vibe_testing/
    │       └── *.mdx files (nested, not shown in UI)
    └── ipynb/
        └── *.ipynb files
```

### How It Works

1. **Path Configuration:** The frontend looks for drafts at `../../tutorials_draft` (relative to `services/frontend/`)
2. **Localhost Detection:** Drafts only appear when `Astro.url.hostname` is `localhost` or `127.0.0.1`
3. **Section Naming:** Each subdirectory becomes a section (e.g., "Mdx", "Ipynb")
4. **Routing:** Draft tutorials use the URL pattern `/tutorials_draft/{section}/{filename}`

### Viewing a Specific Draft

To view a draft tutorial:
1. Navigate to `http://localhost:4322`
2. Click the "🚧 Draft Tutorials" section in the sidebar to expand it
3. Find your tutorial under either "Ipynb" or "Mdx" section
4. Click to view

For example:
- Cursor tutorial: `http://localhost:4322/tutorials_draft/mdx/cursor_tutorial`
- Claude API: `http://localhost:4322/tutorials_draft/ipynb/claude_api_tutorial`

## Publishing a Draft

To publish a draft tutorial:

1. **Move the file** from `tutorials_draft/{section}/` to `services/frontend/tutorials/{Category}/`
2. **Choose appropriate category** (e.g., "Frameworks", "Model Providers", "Vibe Coding", etc.)
3. **Add metadata** (optional) to `services/frontend/tutorial-metadata.json`
4. **Configure visibility** (optional) in `services/frontend/tutorial-visibility.json`
5. **Test locally** then deploy

## Next Steps

### Recommended Actions:

1. **Review draft content** - Check which tutorials are ready for publication
2. **Organize by category** - Consider reorganizing `mdx/` and `ipynb/` into topic-based folders (like published tutorials)
3. **Complete TODOs** - Several drafts have TODO markers (e.g., `magic_mcp_TODO.mdx`)
4. **Convert formats** - `livekit_tutorial_DOWITHMDX.ipynb` should be converted to MDX
5. **Handle nested files** - Move `vibe_testing` tutorials to the parent `mdx/` folder or update the scanner to support nested directories

## Current Status

✅ **Working:** All 48 draft tutorials are accessible in localhost mode
✅ **Routing:** Draft tutorial pages are properly configured
✅ **Styling:** Drafts have distinct yellow-themed styling to differentiate from published content
✅ **Protected:** Drafts only appear in development, never in production builds

---

**Last Updated:** December 3, 2025  
**Total Drafts:** 48+ tutorials (12 MDX, 36+ Jupyter Notebooks)
