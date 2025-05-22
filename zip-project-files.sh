#!/bin/bash
# Script to create zip files for specific project directories

# Create a directory for zip files
mkdir -p /tmp/project-zips

# List of specific directories to zip
DIRS_TO_ZIP=(
  "src"
  "prisma"
  "public"
  "server"
  "sdk"
  "__mocks__"
  "docs"
  "scripts"
)

# Working directory should be the project root
cd /home/runner/workspace

# Create zip for each directory in our list
for dir in "${DIRS_TO_ZIP[@]}"; do
  if [ -d "$dir" ]; then
    echo "Creating zip for $dir..."
    zip -r "/tmp/project-zips/${dir}.zip" "$dir"
  else
    echo "Directory $dir not found, skipping."
  fi
done

# Create a zip for config files
echo "Creating zip for configuration files..."
zip /tmp/project-zips/config-files.zip \
  package.json package-lock.json tsconfig.json next.config.js \
  babel.config.js tailwind.config.js postcss.config.js \
  jest.config.js jest.setup.js next-env.d.ts \
  .gitignore .env.example PRD.md LEARNINGS.md \
  README.md 2>/dev/null || echo "Some config files not found"

# List all the zip files created
echo ""
echo "Created zip files:"
ls -la /tmp/project-zips/

echo ""
echo "You can download these zip files from the file browser at /tmp/project-zips/"