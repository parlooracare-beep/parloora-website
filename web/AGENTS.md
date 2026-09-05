<!-- BEGIN:nextjs-agent-rules -->
# Parloora Next.js & Deployment Protocol

## Deployment & Repository Rule
- **Always update repositories and deployments after editing**: Whenever code edits or fixes are completed and verified, automatically push the updated files to GitHub repository `parlooracare-beep/parloora-website` on branch `main` using GitHub MCP `push_files`. This initiates the automated Vercel production deployment.
- Verify that `npx tsc --noEmit` and `npx eslint --quiet` pass with 0 errors before deploying.

## Next.js Rules
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
