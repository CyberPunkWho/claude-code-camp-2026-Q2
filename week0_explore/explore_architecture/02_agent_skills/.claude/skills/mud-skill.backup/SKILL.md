---
name: mud-client
description: Play tbaMUD on localhost:4000 with character status, navigation, combat automation, and game state tracking. Use this skill whenever the user wants to: play the MUD, issue commands (look, say, go, cast, attack, etc.), check character status, navigate the world, engage in combat, manage inventory, interact socially, or explore the game. The skill maintains a persistent connection, tracks character state, and provides both interactive conversation mode and discrete command execution.
compatibility: Requires Node.js and telnet-client npm package
---

# MUD Client Skill

A comprehensive skill for playing tbaMUD (a CircleMUD variant) on localhost:4000. This skill manages a persistent MUD connection and provides multiple interaction modes.

## Quick Start

### Initialize
Before using the skill, install dependencies and start the daemon:

```bash
cd <skill-directory>
npm install
node mud-daemon.js &
```

Or just run the CLI — it auto-starts the daemon if needed:
```bash
node mud-cli.js connect
```

### Basic Commands

**Connect to the MUD:**
```
/mud connect
```

**Check status:**
```
/mud status
```

**Send any MUD command:**
```
/mud look
/mud say Hello everyone!
/mud go north
/mud cast fireball
/mud kill goblin
```

**Disconnect:**
```
/mud disconnect
```

## Interaction Modes

### 1. Discrete Command Mode
Issue individual commands and get responses. Perfect for one-off actions:

- `/mud look` — Describe current room
- `/mud inventory` — Check what you're carrying
- `/mud tell dummy hello` — Message another player
- `/mud cast magic missile` — Cast a spell
- `/mud wield sword` — Equip an item

### 2. Conversational Mode
Keep a natural conversation flow where you execute commands embedded in dialogue. You can:

- Ask the skill to explore, and it navigates for you
- Request specific actions ("cast detect magic"), and the skill issues the command and shows output
- Describe what you want to do in plain language, and the skill translates to MUD commands
- Get real-time status updates embedded in responses

Example: "I want to cast fireball on the goblin"
→ Skill identifies combat context, issues `cast fireball`, shows result with HP/status update

### 3. Automated Workflows
Use the skill to chain complex actions:

- **Navigation**: "Go find the guard captain" → Skill uses map/exploration
- **Combat**: "Fight until I'm low on health" → Skill automates combat, watches HP
- **Social**: "Join the group and introduce yourself" → Skill handles tell/say sequences
- **Inventory management**: "Sell everything except my weapon" → Skill handles shop interactions

## Command Reference

### Navigation
```
go <direction>      — Move north/south/east/west/up/down
enter <exit>        — Enter a door/portal
leave               — Exit current location
recall              — Teleport back to recall point
```

### Combat
```
kill <target>       — Attack an enemy
cast <spell>        — Cast a spell (fireball, magic missile, etc.)
backstab <target>   — Sneak attack
dodge               — Attempt to dodge
```

### Social & Communication
```
say <message>       — Speak in current room
tell <player> <msg> — Private message
emote <action>      — Perform an action
group <player>      — Invite to party
```

### Items & Inventory
```
get <item>          — Pick up an item
drop <item>         — Drop an item
inventory           — List what you carry
equipment           — Show equipped items
wield <item>        — Equip a weapon
wear <item>         — Put on armor
remove <item>       — Unequip something
```

### Character Info
```
consider <target>   — Assess an enemy's power
score               — Show character stats
level               — Check your level
experience          — Check XP progress
```

### Other
```
look [target]       — Describe room or examine object
examine <item>      — Get details about an item
rest                — Sit and recover
sleep               — Go to sleep
wake                — Wake up
help <topic>        — Get in-game help
```

## Game State Tracking

The skill maintains persistent state:

- **Character**: Name, level, HP/mana/moves
- **Location**: Current room description and exits
- **Inventory**: What you're carrying
- **Equipment**: What you're wearing
- **Combat Status**: Active fights, targets
- **Map**: Discovered rooms and connections
- **Social**: Group members, relationships

Access current state anytime with `/mud status`.

## Examples

### Starting an Adventure
```
User: Let's explore this dungeon. Start by looking around.
Skill: → `/mud look`
Output: [Shows room description]

User: Any enemies here?
Skill: → Parses room description, checks for hostile creatures
Response: "No enemies here. Three exits: north, east, and a locked door to the south."

User: Go north
Skill: → `/mud go north`
Output: [Shows new room, encounters a goblin]
```

### Combat Scenario
```
User: Fight that goblin!
Skill: → `/mud kill goblin`
Output: You start fighting the goblin! It hits you for 12 damage.
HP: 38/50

Skill: Detects you're in combat, offers options:
"You're fighting a goblin (12 damage taken). Cast a spell, attack again, or flee?"

User: Cast fireball
Skill: → `/mud cast fireball` 
Output: [Spell damage, combat continues or ends]
```

### Interactive Exploration
```
User: Let me explore. Show me what's here and I'll decide where to go.
Skill: → `/mud look`
Output: [Room description with exits]

User: I'll go to the tavern (south)
Skill: → `/mud go south`
Output: [Tavern description, NPCs present, items available]

User: Talk to the bartender about quests
Skill: Recognizes NPC interaction, suggests available commands
```

## Technical Details

### Connection Management
- **Auto-connect**: Daemon handles login with credentials (dummy/helloworld)
- **Persistent**: Connection stays open across multiple commands
- **Stateful**: Game state saved to `.mud-state/game-state.json`
- **Logging**: All commands and responses logged to `.mud-state/mud.log`

### Output Parsing
The skill parses MUD output to extract:
- Character stats (HP/mana/moves) from prompts
- Room descriptions
- Combat status
- NPC interactions
- Inventory changes

### Error Handling
- Automatic reconnection if connection drops
- Command validation before sending
- Clear error messages if commands fail
- Graceful handling of connection timeouts

## Workflow Tips

### For Exploration
1. Use `/mud look` to get oriented
2. Ask the skill to describe what you see
3. Ask "Is there anything interesting here?" — skill analyzes room
4. Navigate with `/mud go <direction>`
5. Let the skill update your mental map of the world

### For Combat
1. Identify enemies with `/mud look`
2. Use `/mud consider <target>` to gauge difficulty
3. Start with `/mud kill <target>`
4. Skill monitors HP and suggests when to heal/retreat
5. Use `/mud cast` for spells or `/mud flee` to escape

### For Interaction
1. Use `/mud say` for public chat
2. Use `/mud tell` for private messages
3. Use `/mud emote` for roleplay actions
4. Group up with `/mud group <player>`
5. Let skill track ongoing conversations

## Limitations & Notes

- Connection is to localhost:4000, assumed to be a tbaMUD instance
- Auto-login uses dummy/helloworld credentials
- Some features (advanced automation, complex AI) are manual for now
- Full map generation requires exploration (not auto-populated)
- Combat automation is defensive (healing when low, fleeing when needed)
