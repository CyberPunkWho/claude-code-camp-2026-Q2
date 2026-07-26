# Claude Code Boot Camp 2026 - Project Setup

## Project Structure

```
claude-code-camp-2026-Q2/
├── .claude/                          # Project configuration
├── CLAUDE.md                         # This file
└── week0_explore/
    └── explore_architecture/
        └── 02_agent_skills/
            ├── mud-client/           # MUD Client Skill (source code)
            │   ├── SKILL.md          # Skill definition
            │   ├── mud-daemon.js     # Core daemon
            │   ├── mud-cli.js        # CLI interface
            │   ├── package.json      # Dependencies
            │   ├── README.md         # Documentation
            │   ├── scripts/          # Helper scripts
            │   ├── references/       # Reference docs
            │   ├── evals/            # Test cases
            │   └── .mud-state/       # Runtime state
            └── data/                 # Persistent memory (auto-populated)
                ├── player.md         # Character progress
                └── world.md          # World discoveries
```

## MUD Client Skill

Located in: `week0_explore/explore_architecture/02_agent_skills/mud-client/`

### Features
- 🎮 Connect to tbaMUD on Docker (localhost:4000)
- 💾 Auto-save character progress to `data/player.md`
- 🗺️ Auto-save world discoveries to `data/world.md`
- ⚔️ Goal tracking system
- 📈 Real-time stats updates

### Setup

#### Prerequisites
- Node.js installed (get from https://nodejs.org/)
- MUD server running on localhost:4000 (Docker container)

#### Install Dependencies
```bash
cd week0_explore/explore_architecture/02_agent_skills/mud-client
npm install
```

#### Start Playing
```bash
# Start the daemon in background
node mud-daemon.js &

# Connect to the MUD
node mud-cli.js connect

# Look around
node mud-cli.js look

# Set a goal
node mud-cli.js goal set "Find the fountain"

# Navigate
node mud-cli.js go north
node mud-cli.js south

# Check status
node mud-cli.js status
```

### Persistent Memory

The skill automatically updates two files after each command:

**`data/player.md`** - Your character progress:
- Real-time stats (HP, Mana, Moves)
- Current location
- Inventory and equipment
- Active goals
- Location history

**`data/world.md`** - World knowledge base:
- Discovered rooms with descriptions
- NPCs and creatures encountered
- Items and treasures found
- Exploration progress

### Using the Skill in Claude Code

Once the daemon is running, use the mud-client skill:
```
/mud-client explore the world and find the fountain
```

Or send individual commands:
```
/mud-client go north
/mud-client look
/mud-client kill goblin
```

## Development Notes

- Skill source code is version-controlled in `02_agent_skills/mud-client/`
- Data files in `02_agent_skills/data/` are auto-generated and should be reviewed
- The daemon persists to both JSON and Markdown formats
- All game state is captured in real-time

## Project Goals

- Learn about agent skills and persistent memory
- Build an autonomous MUD player that tracks progress
- Explore multi-step goal tracking and completion
- Document discoveries in machine-readable format
