#!/usr/bin/env bash
set -euo pipefail

if id app >/dev/null 2>&1; then
  echo "User 'app' already exists."
else
  useradd -m -s /bin/bash app
  echo "User 'app' created."
fi
