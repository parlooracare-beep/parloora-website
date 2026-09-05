# Parloora Development & Deployment Guidelines

## Deployment & Repository Protocol
- **Always update repositories and deployments after editing**: Whenever code edits, security patches, or feature updates are made and verified, automatically commit and push the updated files to the GitHub repository (`parlooracare-beep/parloora-website` on branch `main`) using the GitHub MCP tool `push_files`.
- Pushing to `main` triggers automated CI/CD deployment on Vercel (`https://parloora.vercel.app` / custom domain).
- Ensure all changes pass TypeScript check (`npx tsc --noEmit`) and ESLint check (`npx eslint --quiet`) before pushing.
