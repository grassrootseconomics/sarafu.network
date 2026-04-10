#!/bin/bash
# This will promote the preview branch to the main branch
read -p "Are you sure you want to promote the preview branch to the main branch? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Aborting"
    exit 1
fi
git switch main
git fetch origin
git merge --ff-only origin/preview   # no new code, just pointer move
git push origin main