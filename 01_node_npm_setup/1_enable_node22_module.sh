#!/usr/bin/env bash
set -euo pipefail

dnf -y module reset nodejs
dnf -y module enable nodejs:22

echo "Node.js module stream 22 enabled."
