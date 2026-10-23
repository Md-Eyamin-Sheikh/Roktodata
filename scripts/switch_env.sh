#!/usr/bin/env bash
# =========================================================================
# Roktodata Environment Switcher Script
# Usage:
#   ./scripts/switch_env.sh staging     # Switches to .env.staging.local
#   ./scripts/switch_env.sh production  # Switches to .env.production.local
# =========================================================================

set -e

ENV_TYPE=$1

if [ "$ENV_TYPE" != "staging" ] && [ "$ENV_TYPE" != "production" ]; then
  echo "❌ Error: Invalid environment specified."
  echo "Usage: ./scripts/switch_env.sh [staging|production]"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ENV_FILE="$PROJECT_DIR/.env.$ENV_TYPE.local"
ACTIVE_ENV_FILE="$PROJECT_DIR/.env.local"

if [ ! -f "$TARGET_ENV_FILE" ]; then
  echo "⚠️ Target file $TARGET_ENV_FILE does not exist yet."
  echo "Creating from .env.$ENV_TYPE.example..."
  cp "$PROJECT_DIR/.env.$ENV_TYPE.example" "$TARGET_ENV_FILE"
  echo "Created $TARGET_ENV_FILE. Please edit it with your real $ENV_TYPE credentials."
fi

cp "$TARGET_ENV_FILE" "$ACTIVE_ENV_FILE"
echo "✅ Active environment switched to: $ENV_TYPE (.env.local updated from .env.$ENV_TYPE.local)"
echo "⚠️ Reminder: .env.local and .env.*.local are strictly gitignored."
