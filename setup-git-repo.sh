#!/bin/bash

# Clone the repo to get the latest changes
echo "Initializing Git repository setup..."

# Define repo URL - replace with your actual repo
REPO_URL="https://github.com/SuJubilacion/NostrAdsMarket.git"

# Check if .git directory exists
if [ -d ".git" ]; then
  echo "Git repository already initialized"
  
  # Check if remote exists
  if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists"
    
    # Verify the remote URL
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$REPO_URL" ]; then
      echo "Updating remote URL to $REPO_URL"
      git remote set-url origin "$REPO_URL"
    fi
  else
    echo "Adding remote 'origin'"
    git remote add origin "$REPO_URL"
  fi
else
  echo "Initializing new Git repository"
  git init
  git remote add origin "$REPO_URL"
fi

# Create or update .gitignore
echo "Creating .gitignore file..."
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

echo "Git repository setup complete!"
echo "Use ./push-to-github.sh to push changes to GitHub"