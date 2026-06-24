#!/bin/bash
# Run this once from your local machine to push the full codebase to GitHub.
# Prerequisites: git installed, GitHub account with the repo already created.

set -e

REPO_URL="https://github.com/sudammanudith1991/tropicai_inventory_management.git"

echo "🌿 Initializing Tropicai repository..."

git init
git add .
git commit -m "feat: initial project structure

- Spring Boot 3 backend with JWT auth
- React 18 frontend with Tailwind CSS
- PostgreSQL schema with Flyway migrations
- Docker Compose for local dev and EC2 deploy
- GitHub Actions CI/CD pipeline
- All modules: purchases, orders, inventory, credits, dashboard"

git branch -M main
git remote add origin $REPO_URL
git push -u origin main

echo "✅ Done! Visit https://github.com/sudammanudith1991/tropicai_inventory_management"
echo ""
echo "Next steps:"
echo "  1. Add GitHub Secrets: EC2_HOST, EC2_SSH_KEY, VITE_API_URL"
echo "  2. Follow docs/deployment.md to set up EC2 + RDS"
echo "  3. Push to main to trigger first deployment"
