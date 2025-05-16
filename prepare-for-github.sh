#!/bin/bash
# prepare-for-github.sh
# Script to prepare the Nostr Ad Marketplace codebase for GitHub

echo "===== Nostr Ad Marketplace GitHub Preparation ====="
echo "This script will help prepare your codebase for GitHub."

# Create a clean directory for the GitHub repository
CLEAN_DIR="/tmp/nostr-ad-market-clean"
echo "Creating clean directory at $CLEAN_DIR..."
rm -rf $CLEAN_DIR
mkdir -p $CLEAN_DIR

# Copy essential files (excluding those in .gitignore)
echo "Copying essential files..."

# Core project files
cp -v package.json $CLEAN_DIR/
cp -v package-lock.json $CLEAN_DIR/
cp -v tsconfig.json $CLEAN_DIR/
cp -v next.config.js $CLEAN_DIR/
cp -v babel.config.js $CLEAN_DIR/
cp -v tailwind.config.js $CLEAN_DIR/
cp -v postcss.config.js $CLEAN_DIR/
cp -v jest.config.js $CLEAN_DIR/
cp -v jest.setup.js $CLEAN_DIR/
cp -v jest.env.js $CLEAN_DIR/
cp -v next-env.d.ts $CLEAN_DIR/
cp -v .gitignore $CLEAN_DIR/
cp -v .env.example $CLEAN_DIR/
cp -v README.md $CLEAN_DIR/
cp -v PRD.md $CLEAN_DIR/ 2>/dev/null || echo "PRD.md not found, skipping..."
cp -v LEARNINGS.md $CLEAN_DIR/ 2>/dev/null || echo "LEARNINGS.md not found, skipping..."

# Copy source directories
echo "Copying source code..."
mkdir -p $CLEAN_DIR/src
cp -r src/* $CLEAN_DIR/src/

# Copy Prisma schema
echo "Copying Prisma schema..."
mkdir -p $CLEAN_DIR/prisma
cp -v prisma/schema.prisma $CLEAN_DIR/prisma/

# Copy public assets
echo "Copying public assets..."
mkdir -p $CLEAN_DIR/public
cp -r public/* $CLEAN_DIR/public/ 2>/dev/null || echo "No files in public directory"

# Copy SDK directory
echo "Copying SDK..."
mkdir -p $CLEAN_DIR/sdk
cp -r sdk/* $CLEAN_DIR/sdk/ 2>/dev/null || echo "No files in SDK directory"

# Copy server directory
echo "Copying server directory..."
mkdir -p $CLEAN_DIR/server
cp -r server/* $CLEAN_DIR/server/ 2>/dev/null || echo "No files in server directory"

# Check for and remove any sensitive files
echo "Checking for sensitive files to exclude..."
find $CLEAN_DIR -name "*.env" -not -name ".env.example" -delete
find $CLEAN_DIR -name "*.db" -delete
find $CLEAN_DIR -name "*.sqlite" -delete
find $CLEAN_DIR -name "*.sqlite3" -delete
find $CLEAN_DIR -name "*.log" -delete
find $CLEAN_DIR -path "*/node_modules/*" -delete
find $CLEAN_DIR -path "*/.next/*" -delete
find $CLEAN_DIR -path "*/coverage/*" -delete
find $CLEAN_DIR -path "*/logs/*" -delete
find $CLEAN_DIR -path "*/temp-cleanup/*" -delete
find $CLEAN_DIR -path "*/attached_assets/*" -delete

echo "Clean repository prepared at $CLEAN_DIR"
echo ""
echo "===== NEXT STEPS ====="
echo "1. Download the clean repository as a ZIP file"
echo "2. Extract it on your local machine"
echo "3. Initialize git and push to GitHub:"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"Initial commit: Nostr Ad Marketplace\""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/SuJubilacion/NostrAdsMarket.git"
echo "   git push -u origin main"
echo ""
echo "Or use GitHub Desktop for a simpler workflow."
echo ""
echo "Would you like to create a ZIP file of the clean directory? (y/n)"
read -p "> " create_zip

if [[ $create_zip == "y" || $create_zip == "Y" ]]; then
  ZIP_FILE="/tmp/nostr-ad-market.zip"
  echo "Creating ZIP file at $ZIP_FILE..."
  cd $CLEAN_DIR
  zip -r $ZIP_FILE .
  echo "ZIP file created at $ZIP_FILE"
  echo "Download this file and extract it on your local machine for GitHub upload."
fi

echo "===== DONE ====="