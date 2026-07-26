# MUD Client Agent - Autonomous Gameplay

This is a self-contained autonomous agent that plays tbaMUD with persistent memory and goal tracking.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Daemon
```bash
node mud-daemon.js
```

Keep this running in the background. You should see:
```
[timestamp] MUD daemon started, listening on localhost:9999
```

### 3. Connect to the MUD
```bash
node mud-cli.js connect
node mud-cli.js look
```

### 4. Use the Agent
```
/mud-client-agent explore the world and find interesting areas
```

## Directory Structure

```
03_subagent_sdk/
├── .claude/
│   ├── agents/
│   │   └── mud-client.md           ← Agent definition (intelligence)
│   └── settings.json               ← Claude Code configuration
├── data/
│   ├── player.md                   ← Character stats (auto-updated)
│   └── world.md                    ← World discoveries (auto-updated)
├── .mud-state/
│   ├── game-state.json             ← Real-time game state
│   └── mud.log                     ← Connection logs
├── mud-daemon.js                   ← MUD connection manager
├── mud-cli.js                      ← CLI client
├── package.json                    ← Node.js dependencies
├── AGENT_SETUP.md                  ← Detailed setup guide
└── README.md                       ← This file
```

## How It Works

**Three-tier architecture:**

1. **mud-daemon.js** (Backend)
   - Connects to MUD on localhost:4000
   - Manages persistent connection
   - Parses game output
   - Auto-saves character state to `data/player.md`
   - Auto-saves world knowledge to `data/world.md`

2. **mud-cli.js** (Interface)
   - Client that communicates with daemon
   - Auto-starts daemon if needed
   - Sends commands, receives responses
   - Usable from CLI or scripts

3. **mud-client-agent** (Brain)
   - Reads current state from `data/player.md` and `data/world.md`
   - Makes intelligent decisions about what to do
   - Invokes commands via mud-cli.js
   - Learns from game output and updates strategy

## Memory Management

Both files are **automatically updated by the daemon** after each command:

### `data/player.md`
- Character name, level, XP
- Current HP/mana/moves
- Current location
- Inventory and equipment
- Active goals and completion status
- Location history

### `data/world.md`
- Discovered rooms with descriptions and exits
- NPCs and creatures encountered
- Items found and their locations
- Exploration progress stats

## Commands

### Daemon Control
```bash
node mud-daemon.js              # Start the daemon
node mud-cli.js connect         # Connect to MUD
node mud-cli.js disconnect      # Disconnect
node mud-cli.js status          # Check status
```

### Navigation
```bash
node mud-cli.js look            # Describe current room
node mud-cli.js go north        # Move (supports north/south/east/west/up/down)
node mud-cli.js inventory       # List inventory
node mud-cli.js equipment       # Show equipped items
```

### Combat
```bash
node mud-cli.js kill goblin     # Attack enemy
node mud-cli.js cast fireball   # Cast spell
node mud-cli.js consider goblin # Assess enemy strength
node mud-cli.js flee            # Run from combat
```

### Goals
```bash
node mud-cli.js goal set "Explore tavern"    # Create goal
node mud-cli.js goal list                    # List goals
node mud-cli.js goal complete 0              # Mark goal done
```

## Using the Agent

The agent automatically:

1. **Reads** current state from memory files
2. **Analyzes** game world and character progress
3. **Plans** next actions based on goals
4. **Executes** MUD commands via the daemon
5. **Learns** from discoveries and updates memory

### Invoke the agent:
```
/mud-client-agent [your instruction]
```

**Examples:**
```
/mud-client-agent explore the starting area systematically
/mud-client-agent level up by fighting weak enemies
/mud-client-agent find and report all NPCs and their locations
/mud-client-agent complete the goal "reach level 5"
```

The agent will:
- Use `/mud look`, `/mud status`, `/mud go`, etc. via the daemon
- Read updated player.md and world.md after each command
- Report discoveries and progress
- Adjust strategy based on what it learns

## Prerequisites

- **Node.js** (v12+) - download from https://nodejs.org/
- **MUD Server** running on localhost:4000
- **tbaMUD** (CircleMUD variant)

## Detailed Setup

See **AGENT_SETUP.md** for:
- Troubleshooting guide
- Testing procedures
- Advanced configuration
- Understanding the daemon

## Architecture Benefits

✅ **Self-contained** - No dependencies on parent directories
✅ **Autonomous** - Agent makes intelligent gameplay decisions
✅ **Persistent** - Memory survives disconnects and restarts
✅ **Observable** - Plain text memory files for debugging
✅ **Extensible** - Easy to add new commands or features

Ready to explore? Start the daemon and run the agent!
