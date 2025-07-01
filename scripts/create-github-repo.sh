#!/bin/bash

# GitHub Repository Creator Script
# Usage: ./create-github-repo.sh <repo-name> <description> [organization]

# Check if required parameters are provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 <repo-name> <description> [organization]"
    echo "Example: $0 my-project 'My awesome project description' reiautomated"
    exit 1
fi

REPO_NAME="$1"
DESCRIPTION="$2"
ORG="${3:-}" # Optional organization parameter

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set it with: export GITHUB_TOKEN='your_token_here'"
    exit 1
fi

# Determine API endpoint based on whether organization is provided
if [ -n "$ORG" ]; then
    API_URL="https://api.github.com/orgs/$ORG/repos"
    echo "Creating repository '$REPO_NAME' in organization '$ORG'..."
else
    API_URL="https://api.github.com/user/repos"
    echo "Creating repository '$REPO_NAME' in your personal account..."
fi

# Create the repository
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "$API_URL" \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"$DESCRIPTION\",
    \"private\": false,
    \"has_issues\": true,
    \"has_projects\": true,
    \"has_wiki\": false,
    \"auto_init\": false
  }")

# Check if repository was created successfully
if echo "$RESPONSE" | grep -q '"clone_url"'; then
    CLONE_URL=$(echo "$RESPONSE" | grep '"clone_url"' | cut -d'"' -f4)
    echo "✅ Repository created successfully!"
    echo "Clone URL: $CLONE_URL"
    
    # If we're in a git repository, offer to add remote
    if [ -d ".git" ]; then
        echo ""
        read -p "Add this as 'origin' remote to current git repository? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if git remote get-url origin >/dev/null 2>&1; then
                echo "Removing existing origin remote..."
                git remote remove origin
            fi
            git remote add origin "$CLONE_URL"
            echo "✅ Remote 'origin' added!"
            echo ""
            echo "You can now push with: git push -u origin main"
        fi
    fi
else
    echo "❌ Failed to create repository"
    echo "Response: $RESPONSE"
    exit 1
fi