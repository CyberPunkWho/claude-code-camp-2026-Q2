# MUD Client Agent - Quick Start

This directory contains a self-contained autonomous agent for playing tbaMUD with persistent memory and goal tracking.

## Structure

```
03_subagent_sdk/
├── .claude/
│   ├── agents/
│   │   └── mud-client.md      ← Agent definition (instructions)
│   └── settings.json          ← Agent configuration
├── data/
│   ├── player.md              ← Character progress (auto-updated)
│   └── world.md               ← World discoveries (auto-updated)
├── .mud-state/                ← Runtime state (auto-created)
├── mud-daemon.js              ← MUD connection daemon
├── mud-cli.js                 ← CLI interface
└── package.json               ← Dependencies
```

## Prerequisites

1. **Node.js** installed (download from https://nodejs.org/)
2. **tbaMUD server** running on localhost:4000 (Docker or local)

## Setup

### 1. Install Dependencies
```bash
cd 03_subagent_sdk
npm install
```

### 2. Start the Daemon
```bash
node mud-daemon.js
```

You should see:
```
[timestamp] MUD daemon started, listening on localhost:9999
```

Keep this running in the background.

### 3. Use the Agent

**Option A: Invoke the agent via Claude Code**
```
/mud-client-agent explore the starting area and document what you find
```

**Option B: Use the CLI directly**
```bash
node mud-cli.js connect
node mud-cli.js look
node mud-cli.js status
node mud-cli.js go north
```

## How It Works

1. **Daemon Process** (`mud-daemon.js`)
   - Maintains persistent connection to MUD on localhost:4000
   - Auto-logs in with dummy/helloworld credentials
   - Listens for commands on localhost:9999
   - Saves state automatically

2. **CLI Interface** (`mud-cli.js`)
   - Client for sending commands to the daemon
   - Auto-starts daemon if not running
   - Returns JSON responses

3. **Agent Definition** (`.claude/agents/mud-client.md`)
   - Instructions for autonomous gameplay
   - Reads from player.md and world.md
   - Makes decisions based on game state

4. **Memory Files** (auto-updated by daemon)
   - `data/player.md` - Character stats, inventory, goals, location history
   - `data/world.md` - Discovered rooms, NPCs, monsters, items

## Common Commands

**Connection**
```bash
node mud-cli.js connect       # Log in
node mud-cli.js disconnect    # Log out
node mud-cli.js status        # Check character status
```

**Navigation**
```bash
node mud-cli.js look          # Describe current room
node mud-cli.js go north      # Move in a direction
node mud-cli.js inventory     # Check inventory
```

**Combat**
```bash
node mud-cli.js kill goblin   # Start fighting
node mud-cli.js cast fireball # Cast spell
node mud-cli.js flee          # Flee combat
```

**Goals**
```bash
node mud-cli.js goal set "Find the fountain"
node mud-cli.js goal list
node mud-cli.js goal complete 0
```

## Agent Workflow

The agent automatically:
1. Checks current status from `data/player.md`
2. Reads world knowledge from `data/world.md`
3. Issues MUD commands via the daemon
4. Analyzes output for discoveries
5. Updates memory files (done automatically by daemon)
6. Plans next actions based on goals and exploration

## Testing the Agent

```bash
# 1. Start the daemon
node mud-daemon.js &

# 2. Connect and explore
node mud-cli.js connect
node mud-cli.js look
node mud-cli.js go north
node mud-cli.js status

# 3. Check memory files
cat data/player.md
cat data/world.md

# 4. Set a goal
node mud-cli.js goal set "Explore the starting area"
node mud-cli.js goal list
```

## Troubleshooting

**Cannot connect to MUD**
- Verify MUD is running on localhost:4000
- Check firewall settings
- Review `.mud-state/mud.log` for connection errors

**Daemon won't start**
- Ensure Node.js is installed: `node --version`
- Check if port 9999 is already in use
- Look at error messages for clues

**Agent not reading memory files**
- Verify `data/player.md` and `data/world.md` exist
- Check file permissions
- Daemon should auto-create and update them

## Next Steps

1. **Start the daemon** to get connected
2. **Explore manually** to test the connection
3. **Invoke the agent** to automate exploration
4. **Review memory files** to see what was discovered

Ready to play? Start with `node mud-daemon.js` then use the agent!
