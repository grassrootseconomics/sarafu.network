#!/bin/bash
# This will sync the preview branch with the main branch press y to confirm
read -p "Are you sure you want to sync the preview branch with the main branch? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Aborting"
    exit 1
fi

git switch preview
git reset --hard origin/main   # preview now equals prod
git push --force origin preview