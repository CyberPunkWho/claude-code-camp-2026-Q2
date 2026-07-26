# MUD Client Skill - tbaMUD on localhost:4000

A comprehensive Claude Code skill for playing tbaMUD with persistent connection, character state tracking, combat automation, navigation assistance, and social features.

## Quick Start

### 1. Install Dependencies
```bash
cd mud-skill
npm install
```

### 2. Start the Daemon (if not auto-starting)
```bash
node mud-daemon.js &
```

### 3. Use in Claude Code
Once installed as a skill, simply use natural language:

- "Connect to the MUD and show me my status"
- "Look around and tell me what's here"
- "Go explore to the north"
- "Fight that goblin!"
- "Cast fireball on the enemy"
- "Check my inventory"

Or use direct commands:
```bash
node mud-cli.js connect
node mud-cli.js look
node mud-cli.js cast fireball
node mud-cli.js status
```

## Features

✅ **Persistent Connection** - Daemon maintains open MUD connection  
✅ **Character Tracking** - HP, mana, moves, location, inventory  
✅ **Combat System** - Fight enemies, track health, automatic status updates  
✅ **Navigation** - Move between rooms, explore the world, build map  
✅ **Social Features** - Say, tell, emote, group up with players  
✅ **Inventory Management** - Get/drop items, equip/wield, check equipment  
✅ **Spell Casting** - Issue spell commands with smart parsing  
✅ **Dual Modes** - Both conversational and direct command execution  
✅ **State Persistence** - Game state saved between sessions  
✅ **Auto-Login** - Connects with dummy/helloworld credentials  

## Architecture

```
MUD Server (localhost:4000)
         ↑
         │ (telnet)
         │
    Mud Daemon (mud-daemon.js)
         ↑
         │ (Unix socket)
         │
    Mud CLI (mud-cli.js)
         ↑
    Claude Skill
```

## File Organization

- **mud-daemon.js** - Persistent connection handler
- **mud-cli.js** - CLI interface to daemon
- **mud-skill/SKILL.md** - Skill definition & docs
- **mud-skill/scripts/** - Bash/PowerShell wrappers
- **mud-skill/references/** - Setup & advanced docs
- **mud-skill/evals/** - Test cases
- **package.json** - Node dependencies

## Documentation

- [SKILL.md](mud-skill/SKILL.md) - Complete skill reference and usage
- [SETUP.md](mud-skill/references/SETUP.md) - Installation and troubleshooting
- [evals/evals.json](mud-skill/evals/evals.json) - Test cases for validation

## Game State

The daemon maintains and saves:

- Character stats (HP, mana, moves, level)
- Current location and room description
- Inventory and equipped items
- Combat status and active targets
- Map of explored areas
- Social information (group members, etc.)

Access anytime with `/mud status`.

## Command Examples

```bash
# Navigation
/mud look                    # Describe current location
/mud go north               # Move in direction
/mud enter tavern           # Enter location

# Combat
/mud kill goblin            # Attack enemy
/mud cast fireball           # Cast spell
/mud consider goblin        # Check enemy strength
/mud flee                   # Escape combat

# Social
/mud say Hello!             # Speak to room
/mud tell player Hi there   # Message player
/mud group player           # Add to party
/mud emote laughs          # Perform action

# Inventory
/mud get sword              # Pick up item
/mud wield sword            # Equip weapon
/mud wear armor             # Put on armor
/mud drop gold              # Drop item
/mud inventory              # List items

# Status
/mud score                  # Character stats
/mud equipment              # Show equipped items
/mud experience             # Check XP progress
```

## Troubleshooting

**Connection refused?**
- Check MUD server is running on localhost:4000
- Test with: `telnet localhost 4000`

**Module not found?**
- Run: `npm install` (requires Node.js)

**Daemon won't start?**
- Check log: `tail -f .mud-state/mud.log`
- Remove stale socket: `rm -f .mud-state/daemon.sock`

**Connection drops?**
- Daemon auto-reconnects
- Check network/firewall to localhost:4000

## Next Steps

1. Install dependencies: `npm install`
2. Run setup: Follow [SETUP.md](mud-skill/references/SETUP.md)
3. Test connection: `node mud-cli.js status`
4. Explore in Claude Code using natural language
5. Review test cases: [evals.json](mud-skill/evals/evals.json)

## License

Created for Claude Code skill system.
