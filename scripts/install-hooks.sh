#!/bin/bash

# Script to install Git hooks
# Run this script after cloning the repository to set up the pre-commit hook

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Git hooks...${NC}"

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOL'
#!/bin/bash

# Pre-commit hook to prevent large files from being committed
# Maximum file size in bytes (5MB)
MAX_FILE_SIZE=$((5 * 1024 * 1024))
MAX_SIZE_HUMAN="5MB"

echo "Checking for files larger than $MAX_SIZE_HUMAN..."

# Get list of all files to be committed
FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Check each file
for file in $FILES; do
  # Skip if file doesn't exist (could have been deleted)
  if [ ! -f "$file" ]; then
    continue
  fi

  # Get file size
  file_size=$(stat -c %s "$file")

  # Check if file is too large
  if [ "$file_size" -gt "$MAX_FILE_SIZE" ]; then
    echo "ERROR: File $file is too large ($file_size bytes, max is $MAX_SIZE_HUMAN)"
    echo "Consider using .gitignore to exclude large files or use Git LFS for binary files."
    exit 1
  fi
done

# Check for binary files that should be ignored
BINARY_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(mp4|mov|avi|mkv|zip|tar|gz|db|pack|pack.gz|mp3|wav|flac)$')

if [ -n "$BINARY_FILES" ]; then
  echo "WARNING: You're about to commit binary files that should typically be ignored:"
  echo "$BINARY_FILES"
  echo "Consider adding these files to .gitignore unless they're essential to the project."
  echo "To proceed anyway, use git commit --no-verify"
  exit 1
fi

echo "No large files detected. Proceeding with commit."
exit 0
EOL

# Make pre-commit hook executable
chmod +x .git/hooks/pre-commit

echo -e "${GREEN}Git hooks installed successfully!${NC}"
echo -e "Pre-commit hook will prevent commits of files larger than 5MB"
echo -e "See docs/git-hooks.md for more information."