# MUD Client Skill - Agent Skills Project

## Overview

The **mud-client** skill is a comprehensive Claude Code skill for playing tbaMUD (a CircleMUD variant) with persistent game state tracking, goal management, and automatic memory persistence.

## Project Structure

```
02_agent_skills/
├── CLAUDE.md                    # This file - project documentation
├── .claude/                     # Claude Code configuration
│   └── settings.json           # Project settings
├── mud-client/                 # Skill source code
│   ├── SKILL.md               # Skill definition & documentation
│   ├── mud-daemon.js          # Core daemon (telnet connection)
│   ├── mud-cli.js             # CLI interface
│   ├── package.json           # Node.js dependencies
│   ├── README.md              # Technical documentation
│   ├── scripts/               # Helper scripts
│   ├── references/            # Reference documentation
│   ├── evals/                 # Test cases & evaluations
│   └── .mud-state/            # Runtime state (git-ignored)
└── data/                       # Persistent game memory
    ├── player.md              # Character progress (auto-generated)
    └── world.md               # World discoveries (auto-generated)
```

## Quick Start

### Prerequisites
- **Node.js** v14+ (https://nodejs.org/)
- **MUD Server**: tbaMUD running on `localhost:4000` (Docker container)
- **Claude Code** v1.0+ (for skill integration)

### Installation & Setup

#### 1. Install Dependencies
```bash
cd mud-client
npm install
```

#### 2. Start the Daemon
```bash
# Start in background
node mud-daemon.js &

# Or in foreground (for debugging)
node mud-daemon.js
```

#### 3. Connect to the MUD
```bash
# Via CLI
node mud-cli.js connect
node mud-cli.js look

# Or via Claude Code skill
/mud-client connect to the mud
```

## Usage

### Command-Line Interface

```bash
# Connect/Disconnect
node mud-cli.js connect
node mud-cli.js disconnect

# Game Commands
node mud-cli.js look
node mud-cli.js go north
node mud-cli.js say Hello!
node mud-cli.js kill goblin
node mud-cli.js cast fireball

# Status & Info
node mud-cli.js status
node mud-cli.js score

# Goal Management
node mud-cli.js goal set "Reach level 10"
node mud-cli.js goal list
node mud-cli.js goal complete 0
```

### Claude Code Skill Interface

Once the daemon is running, use the skill in Claude Code:

```
/mud-client connect to the mud and look around
/mud-client explore north and find the fountain
/mud-client set goal: reach level 5 and fight 10 enemies
/mud-client what's my status
```

## Persistent Memory System

The skill automatically maintains two markdown files that track your progress:

### `data/player.md` - Character Progress
- Real-time stats (HP, Mana, Moves)
- Current location
- Inventory and equipment
- Active goals and completion status
- Location exploration history

### `data/world.md` - World Knowledge
- Discovered rooms with descriptions
- NPCs and creatures encountered
- Items and treasures found
- Exploration progress metrics

**Note**: These files update automatically after each command. You can edit them manually to add notes or corrections.

## Architecture

### Components

**mud-daemon.js** (Core)
- Manages persistent telnet connection to MUD
- Handles login and character creation
- Parses game output and extracts state
- Manages TCP server for CLI communication
- Auto-saves state to JSON and Markdown

**mud-cli.js** (CLI Interface)
- Command-line client for the daemon
- Forwards commands to daemon via TCP
- Displays formatted output
- Handles user input

**Game State**
- JSON format: `.mud-state/game-state.json` (machine-readable, fast)
- Markdown format: `data/player.md` and `data/world.md` (human-readable, persistent)

### Communication Flow

```
Claude Code Skill
      ↓
  /mud command
      ↓
mud-cli.js (TCP client)
      ↓
mud-daemon.js (TCP server)
      ↓
telnet connection to localhost:4000 (tbaMUD)
      ↓
Game state (JSON + Markdown files)
```

## Configuration

### Claude Code Integration

To install as a Claude Code skill:

1. **Copy to skills directory**:
   ```bash
   cp -r mud-client ~/.claude/skills/
   ```

2. **Or create a symlink** (for development):
   ```bash
   ln -s /path/to/02_agent_skills/mud-client ~/.claude/skills/mud-client
   ```

3. **Reload Claude Code** to recognize the skill

### Environment Variables (Optional)

```bash
# Set MUD server location (defaults to localhost:4000)
export MUD_HOST=localhost
export MUD_PORT=4000

# Set credentials
export MUD_CHAR=dummy
export MUD_PASS=helloworld
```

## Development

### Running Tests
```bash
cd mud-client
npm test
```

### Debugging

Enable verbose logging:
```bash
node mud-daemon.js 2>&1 | tee debug.log
```

Check daemon logs:
```bash
tail -f mud-client/.mud-state/mud.log
```

### File Structure for Development

```
mud-client/
├── SKILL.md          ← Update this for skill documentation
├── mud-daemon.js     ← Core logic (modify carefully)
├── mud-cli.js        ← CLI interface (safe to modify)
├── package.json      ← Dependencies & metadata
├── README.md         ← Technical details
└── .mud-state/
    ├── mud.log       ← Full debug log
    ├── game-state.json  ← Live game state (JSON)
    └── daemon.log    ← Daemon output
```

## Goals & Features

### Implemented
- ✅ Persistent telnet connection to MUD
- ✅ Real-time character stat tracking
- ✅ Game state persistence (JSON + Markdown)
- ✅ Goal tracking system
- ✅ Location history tracking
- ✅ World knowledge base
- ✅ Automated login/character creation
- ✅ Error handling & reconnection

### Roadmap
- 🔄 Automated NPC/monster data extraction
- 🔄 Quest log tracking
- 🔄 Inventory management automation
- 🔄 Combat automation
- 🔄 Multi-character support
- 🔄 Web dashboard for progress tracking

## Troubleshooting

### Connection Issues

**"Not connected to MUD"**
- Ensure MUD server is running on localhost:4000
- Check firewall settings
- Verify MUD is tbaMUD (CircleMUD variant)

**"spawn nc ENOENT"**
- This is expected on Windows (netcat not available)
- Daemon uses Node.js built-in net module instead

### Daemon Issues

**Daemon won't start**
```bash
# Check if port 9999 is in use
netstat -an | grep 9999

# Kill existing daemon
pkill -f mud-daemon.js
```

**No data in player.md**
- Verify daemon is running: `node mud-cli.js status`
- Check that you've sent at least one command to trigger parsing
- Review `.mud-state/mud.log` for errors

### Game Issues

**Login loops**
- Try disconnecting and reconnecting
- Check character exists: create new if needed
- Verify credentials in CONFIG

**Empty output**
- Parser may need adjustment for your MUD version
- Check `.mud-state/mud.log` for actual server responses
- Modify parseOutput() function in mud-daemon.js if needed

## Advanced Usage

### Goal-Driven Gameplay

```bash
# Set main objective
node mud-cli.js goal set "Defeat the dragon"

# Add sub-goals
node mud-cli.js goal set "Reach level 20"
node mud-cli.js goal set "Collect legendary sword"
node mud-cli.js goal set "Learn dragon slaying spell"

# Track progress
node mud-cli.js goal list

# Complete goals as you achieve them
node mud-cli.js goal complete 0
```

### Exploring & Mapping

The skill automatically builds a world map as you explore:

```bash
# Explore an area
node mud-cli.js go north
node mud-cli.js look
# → Room added to world.md

# View discovered areas
cat data/world.md

# Plan routes using discovered connections
# (exits are documented in world.md)
```

### Persistent Progress

Your character progress is always saved:

```bash
# Even after closing the terminal or rebooting:
cat data/player.md    # Shows your current stats & location
cat data/world.md     # Shows what you've discovered
```

## Contributing

To improve this skill:

1. Test changes thoroughly with the MUD
2. Update SKILL.md documentation
3. Add test cases to `evals/`
4. Test both CLI and skill interfaces
5. Verify data files are properly formatted

## License

Created for Claude Code Boot Camp 2026

## Support

- **SKILL.md** - Full feature documentation and command reference
- **README.md** - Technical implementation details
- **references/** - Additional documentation
- **.mud-state/mud.log** - Debug logs for troubleshooting
