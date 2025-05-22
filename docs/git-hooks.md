# Git Hooks

This document describes the Git hooks configured for this project.

## Pre-commit Hook

A pre-commit hook has been set up to prevent large files from being accidentally committed to the repository. This helps keep the repository size manageable and prevents performance issues.

### Features:

- **Size limit enforcement**: Blocks commits of files larger than 5MB
- **Binary file detection**: Warns about common binary file types that should typically be ignored
- **Easy override**: You can bypass these checks when needed with `git commit --no-verify`

### Implementation:

The hook is located at `.git/hooks/pre-commit` and performs the following checks:

1. Scans all files staged for commit
2. Checks each file's size against the 5MB limit
3. Identifies binary files with extensions like mp4, zip, tar, etc.
4. Blocks the commit if any violations are found

### Maintenance:

When setting up the repository on a new machine, ensure the pre-commit hook is executable:

```bash
chmod +x .git/hooks/pre-commit
```

If you need to update the file patterns or size limits, edit the pre-commit script directly.