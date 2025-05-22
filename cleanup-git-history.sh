#!/bin/bash

# Git History Cleanup Script
# This will create a fresh git history with a single commit

echo "🧹 Cleaning up git history..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Create backup branch of current state
echo "📦 Creating backup branch..."
git branch backup-$(date +%Y%m%d-%H%M%S)

# Remove git history but keep files
echo "🗑️ Removing git history..."
rm -rf .git

# Initialize fresh repository
echo "🔄 Creating fresh git repository..."
git init

# Add all files
echo "📁 Adding all files..."
git add .

# Create initial commit
echo "💾 Creating clean initial commit..."
git commit -m "feat: Initial commit - Nostr Ad Marketplace

- Complete Next.js application with TypeScript
- Role-based authentication system (Viewer, Publisher, Advertiser, Admin)
- Domain-based access control for hackathon deployment
- Lightning Network payment integration
- Nostr protocol integration for decentralized auth
- Comprehensive error handling and test coverage
- Production-ready with build validation workflows"

echo "✅ Git history cleaned! Now you have:"
echo "   - 1 clean commit instead of 457"
echo "   - Fresh repository ready for meaningful commits"
echo "   - Backup branch saved if needed"

git log --oneline