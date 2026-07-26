# MUD Client Skill - Setup Guide

## Prerequisites

- Node.js (v14+)
- npm
- A running tbaMUD server on localhost:4000
- Telnet access to the server

## Installation

### Step 1: Install Dependencies

Navigate to the skill directory and install npm packages:

```bash
cd mud-skill
npm install
```

This installs the `telnet-client` library needed for MUD connection.

### Step 2: Start the Daemon

The MUD daemon maintains a persistent connection. You can start it manually:

```bash
# From the skill root directory
node mud-daemon.js &
```

Or let the CLI auto-start it (first time you run a command):

```bash
node mud-cli.js connect
```

### Step 3: Test Connection

```bash
node mud-cli.js status
```

You should see output like:
```json
{
  "connected": true,
  "character": {
    "name": "dummy",
    "level": 1,
    "hp": 50,
    "mana": 100,
    "moves": 82
  },
  "combatActive": false
}
```

## Usage in Claude Code

### Using the CLI Directly

```bash
node mud-cli.js connect           # Connect to MUD
node mud-cli.js look              # Execute a command
node mud-cli.js cast fireball     # Multi-word commands work
node mud-cli.js status            # Check game state
node mud-cli.js disconnect        # Disconnect
```

### Using the Bash Wrapper

```bash
./scripts/mud-command.sh connect
./scripts/mud-command.sh look
./scripts/mud-command.sh cast fireball
./scripts/mud-command.sh status
```

### Using the PowerShell Wrapper (Windows)

```powershell
.\scripts\mud-command.ps1 connect
.\scripts\mud-command.ps1 look
.\scripts\mud-command.ps1 cast fireball
.\scripts\mud-command.ps1 status
```

## File Structure

```
mud-skill/
├── SKILL.md                    # Skill definition and documentation
├── scripts/
│   ├── mud-command.sh         # Bash wrapper for commands
│   └── mud-command.ps1        # PowerShell wrapper for commands
├── references/
│   └── SETUP.md               # This file
└── (mud-cli.js and mud-daemon.js are in the parent directory)
```

## Game State Files

The daemon creates a `.mud-state/` directory in the skill root with:

- `game-state.json` — Character info, location, inventory (saved after each command)
- `daemon.sock` — Socket for CLI communication
- `mud.log` — Detailed log of all commands and responses

## Troubleshooting

### "Cannot find module 'telnet-client'"

Run `npm install` in the skill directory.

### "Connection refused" or "Cannot connect to localhost:4000"

Check that your tbaMUD server is running on localhost:4000:
```bash
# Test connection with telnet
telnet localhost 4000
```

### Daemon won't start

Check the log file:
```bash
tail -f .mud-state/mud.log
```

### Stale socket file

If you get socket errors, remove the old socket:
```bash
rm -f .mud-state/daemon.sock
```

Then restart the CLI or daemon.

## Advanced: Managing Multiple Characters

Currently, the skill uses a single persistent connection (dummy/helloworld). To play multiple characters, you can:

1. Modify the CONFIG in `mud-daemon.js` to use different credentials
2. Create separate daemon instances with different state directories
3. Run multiple CLI processes against different daemons

For now, a single shared connection is recommended for simplicity.

## Performance Notes

- Commands execute in ~300-500ms (telnet latency)
- Large MUD outputs (room descriptions, combat logs) may take longer
- The daemon buffers output and keeps connection alive automatically
- State is saved to disk after each command for persistence

## Security Notes

- Credentials (dummy/helloworld) are hardcoded for the demo
- For production, move to environment variables or a config file
- The skill connects to localhost only — not suitable for remote servers without modification
- Socket communication is local-only, not encrypted
