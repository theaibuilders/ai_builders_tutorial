# Qoder Rules for AI Builders Tutorial

## Git Operations

### Manual Git Control
- **NEVER** automatically run `git add`, `git commit`, or `git push` commands
- Always inform the user about changes made and let them handle git operations manually
- Only run git commands if explicitly requested by the user
- If suggesting git operations, provide the exact commands for the user to run manually

## Code Modification Guidelines

### Authentication & Security
- Follow centralized authentication patterns using `AuthService` utility
- Never log sensitive information (emails, tokens, passwords, error details)
- Use `type(e).__name__` for error logging instead of full exception details
- Always include appropriate `autocomplete` attributes on form inputs

### Frontend Development
- Use Preact with signals for state management
- Follow Astro island architecture for components
- Use centralized auth utilities (`src/utils/auth.ts`) instead of duplicating logic
- Google Sign-In button width should use pixel values (e.g., '350') not percentages

### Backend Development
- Use FastAPI with async patterns
- Properly configure CORS for all required origins (dev and prod)
- Use environment variables for configuration
- Sanitize all logs to remove PII

### Environment Configuration
- Support both `.env` and `.env.prod` files
- Use `ENV_FILE` environment variable to specify which env file to load
- Never commit `.env` or `.env.prod` files with actual secrets
- Always create `.env.example` or `.env.prod.example` templates

## Deployment

### Docker & Zeabur
- Use proper build context paths for monorepo structure
- Include trailing slashes in COPY commands: `COPY services/backend/ ./`
- Add build-date labels for cache invalidation when needed
- Follow Zeabur-compatible Dockerfile formats

## Documentation

### When to Create Documentation
- Only create documentation when explicitly requested
- Document security improvements and breaking changes
- Provide setup instructions for external services (OAuth, APIs)

### What NOT to Document Automatically
- Do not create README files unless requested
- Do not create progress tracking files
- Do not create status reports or change logs automatically

## Communication Style

- Be concise and direct
- Explain changes clearly without excessive detail
- Ask for clarification when requirements are ambiguous
- Inform user of any external configuration needed (e.g., Google Cloud Console)
