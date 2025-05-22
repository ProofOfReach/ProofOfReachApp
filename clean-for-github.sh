#!/bin/bash
# clean-for-github.sh
# Script to clean a downloaded Nostr Ad Marketplace codebase for GitHub push
# MacOS compatible

# Set the script to exit on error
set -e

echo "===== Nostr Ad Marketplace GitHub Preparation ====="
echo "This script will clean the project directory for GitHub."
echo ""

# Ask for confirmation
echo "This script will DELETE files in the current directory."
echo "Make sure you're running this in the extracted project directory."
echo "Do you want to continue? (y/n)"
read -p "> " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Operation cancelled."
  exit 1
fi

echo ""
echo "Starting cleanup process..."

# Create a backup of .gitignore if it exists
if [ -f .gitignore ]; then
  cp .gitignore .gitignore.bak
  echo "Backed up .gitignore"
fi

# Function to remove files/directories if they exist
remove_if_exists() {
  if [ -e "$1" ]; then
    rm -rf "$1"
    echo "Removed: $1"
  fi
}

# Function to remove files matching a pattern
remove_pattern() {
  find . -name "$1" -not -path "*/\.*" -exec rm -rf {} \; -prune 2>/dev/null || true
  echo "Removed files matching: $1"
}

# Build and Dependency Directories
remove_if_exists "node_modules"
remove_if_exists ".next"
remove_if_exists "dist"
remove_if_exists "build"
remove_if_exists ".turbo"
remove_if_exists ".cache"
remove_if_exists ".npm"

# Database Files
remove_pattern "*.db"
remove_pattern "*.sqlite"
remove_pattern "*.sqlite3"
remove_if_exists "dev.db"
remove_if_exists "prod.db"
remove_pattern "prisma/*.db"
remove_pattern "prisma/*.db-journal"

# Log Files
remove_if_exists "logs"
remove_pattern "*.log"
remove_pattern "npm-debug.log*"
remove_pattern "yarn-debug.log*"
remove_pattern "yarn-error.log*"
remove_pattern ".pnpm-debug.log*"

# Environment and Secret Files
remove_if_exists ".env"
remove_if_exists ".env.local"
remove_if_exists ".env.development.local"
remove_if_exists ".env.test.local"
remove_if_exists ".env.production.local"

# Editor and OS Specific Files
remove_if_exists ".vscode"
remove_pattern ".DS_Store"
remove_pattern "Thumbs.db"
remove_pattern "ehthumbs.db"
remove_pattern "Desktop.ini"
remove_if_exists "\$RECYCLE.BIN"

# Replit Specific
remove_if_exists ".replit"
remove_if_exists ".upm"
remove_if_exists ".local"
remove_if_exists "replit_agent"
remove_if_exists ".breakpoints"
remove_if_exists ".replit.backup"
remove_if_exists "replit.nix"

# Large Assets
remove_pattern "*.mp4"
remove_pattern "*.mov"
remove_pattern "*.zip"
remove_pattern "*.tar.gz"
remove_pattern "*.tgz"
remove_pattern "*.rar"
remove_pattern "*.iso"
remove_pattern "*.psd"
remove_pattern "*.ai"
remove_pattern "*.pdf"
remove_if_exists "waitlist-export.csv"
# Only remove large PNGs (over 500KB)
echo "Removing large PNG files (over 500KB)..."
find . -name "*.png" -size +500k -not -path "*/\.*" -exec rm -f {} \; 2>/dev/null || true
remove_pattern "Screenshot*.png"

# Temporary Files
remove_if_exists "temp-cleanup"
remove_if_exists "attached_assets"
remove_pattern "*~"
remove_if_exists ".temp"
remove_pattern "*.swp"
remove_pattern "*.swo"

# Generated Files
remove_if_exists "generated-icon.png"
remove_if_exists "prisma/generated"
remove_if_exists "tsconfig.tsbuildinfo"
remove_if_exists "coverage"
remove_if_exists "test-results.json"

# Project-Specific Sensitive Files
remove_if_exists "remove-sensitive-info.sh"
remove_if_exists "project-cleanup.sh"
remove_if_exists "prisma-query.js"
remove_if_exists "manual-test.js"
remove_if_exists "temp_adform.txt"

# Create a proper .gitignore file if missing or restore from backup
if [ -f .gitignore.bak ]; then
  mv .gitignore.bak .gitignore
else
  cat > .gitignore << 'EOF'
# Build artifacts
.next/
node_modules/
coverage/
dist/
build/
.turbo/
tsconfig.tsbuildinfo

# Database files
*.db
*.sqlite
*.sqlite3
dev.db
prod.db
prisma/*.db
prisma/*.db-journal

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Cache
.cache/
.eslintcache
.npm
.vscode/

# Testing
coverage/
test-results.json

# OS specific
.DS_Store
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# Replit specific
.replit/
.upm/
.local/
replit_agent/
.breakpoints
.replit.backup
replit.nix

# Large assets
*.mp4
*.mov
*.zip
*.tar.gz
*.tgz
*.rar
*.iso
*.psd
*.ai
*.pdf
waitlist-export.csv

# Temporary files
temp-cleanup/
attached_assets/
*~
.temp
*.swp
*.swo

# Generated files
generated-icon.png
prisma/generated/
tsconfig.tsbuildinfo

# Specific project files
remove-sensitive-info.sh
project-cleanup.sh
prisma-query.js
manual-test.js
temp_adform.txt
EOF
  echo "Created new .gitignore file"
fi

echo ""
echo "Cleanup complete! The directory is now ready for GitHub."
echo ""
echo "Next steps:"
echo "1. Initialize Git repository: git init"
echo "2. Add all files: git add ."
echo "3. Create initial commit: git commit -m \"Initial commit: Nostr Ad Marketplace\""
echo "4. Add remote: git remote add origin https://github.com/SuJubilacion/NostrAdsMarket.git"
echo "5. Push to GitHub: git push -u origin main"
echo ""
echo "===== DONE ====="