#!/bin/bash

# Script to push changes to GitHub repository

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting GitHub push process...${NC}"

# Make sure .gitignore is present
if [ ! -f .gitignore ]; then
  echo -e "${YELLOW}Creating .gitignore file...${NC}"
  cat > .gitignore << 'EOF'
# dependencies
node_modules
/node_modules
**/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# local db files
*.db
*.db-journal
logs/

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
fi

# Configure Git if needed
if [ -z "$(git config --get user.email)" ]; then
  echo -e "${YELLOW}Configuring Git user...${NC}"
  # You can update these with your info
  git config --global user.name "Replit Automation"
  git config --global user.email "noreply@replit.com"
fi

# Add all changes
echo -e "${YELLOW}Adding changes to Git...${NC}"
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}No changes to commit.${NC}"
else
  # Ask for commit message
  echo -e "${YELLOW}Enter commit message:${NC}"
  read commit_message
  
  # Use default message if none provided
  if [ -z "$commit_message" ]; then
    commit_message="Update from Replit $(date '+%Y-%m-%d %H:%M:%S')"
  fi
  
  # Commit changes
  echo -e "${YELLOW}Committing changes...${NC}"
  git commit -m "$commit_message"
  
  # Push to GitHub
  echo -e "${YELLOW}Pushing to GitHub...${NC}"
  git push origin main
  
  # Check if push was successful
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
  else
    echo -e "${RED}Failed to push to GitHub. Please check your credentials and try again.${NC}"
  fi
fi