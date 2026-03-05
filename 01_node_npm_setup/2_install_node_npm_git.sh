#!/usr/bin/env bash
set -euo pipefail

dnf -y install nodejs npm git unzip

node -v
npm -v
git --version

echo "Node, npm, git install complete."
