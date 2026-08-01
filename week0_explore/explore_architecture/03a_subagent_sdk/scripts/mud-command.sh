#!/bin/bash

# MUD Command Wrapper
# Usage: ./mud-command.sh <command> [args...]
# Examples:
#   ./mud-command.sh connect
#   ./mud-command.sh status
#   ./mud-command.sh look
#   ./mud-command.sh cast fireball

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MUD_CLI="$SCRIPT_DIR/../02_agent_skills/mud-client/mud-cli.js"

if [ ! -f "$MUD_CLI" ]; then
    echo "Error: mud-cli.js not found at $MUD_CLI"
    echo "Expected path: ../02_agent_skills/mud-client/mud-cli.js"
    exit 1
fi

# Parse arguments
COMMAND="$1"
shift || true

# Build the full command string
if [ -z "$COMMAND" ]; then
    echo "Usage: mud-command.sh <command> [args...]"
    echo "Commands: connect, disconnect, status, or any MUD command"
    exit 1
fi

# Handle multi-word commands (e.g., "cast fireball")
if [ $# -gt 0 ]; then
    FULL_COMMAND="$COMMAND $@"
else
    FULL_COMMAND="$COMMAND"
fi

# Execute via mud-cli
node "$MUD_CLI" "$FULL_COMMAND"
