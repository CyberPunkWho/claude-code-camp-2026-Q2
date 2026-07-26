# MUD Client Skill - Complete Setup

Welcome! This is a fully-configured Claude Code skill for playing tbaMUD with persistent memory and goal tracking.

## 🎯 Quick Links

- **[INSTALL.md](INSTALL.md)** - Setup instructions (start here!)
- **[CLAUDE.md](CLAUDE.md)** - Full documentation and architecture
- **[mud-client/SKILL.md](mud-client/SKILL.md)** - Command reference and features
- **[data/player.md](data/player.md)** - Your character progress (auto-generated)
- **[data/world.md](data/world.md)** - World discoveries (auto-generated)

## ⚡ 30-Second Setup

```bash
# 1. Install dependencies
cd mud-client
npm install
cd ..

# 2. Start daemon (Terminal 1)
node mud-client/mud-daemon.js

# 3. Play (Terminal 2)
node mud-client/mud-cli.js connect
node mud-client/mud-cli.js look
```

## 📁 Project Structure

```
02_agent_skills/
├── 📖 README.md              ← You are here
├── 📖 CLAUDE.md              ← Full documentation
├── 📖 INSTALL.md             ← Setup instructions
├── .claude/
│   └── settings.json         ← Claude Code config
├── mud-client/               ← Skill source code
│   ├── SKILL.md             ← Feature docs & commands
│   ├── mud-daemon.js        ← Core (telnet connection)
│   ├── mud-cli.js           ← CLI interface
│   ├── package.json         ← Dependencies
│   ├── README.md            ← Technical details
│   ├── scripts/             ← Helper scripts
│   ├── references/          ← Additional docs
│   ├── evals/               ← Test cases
│   └── .mud-state/          ← Runtime logs & state
└── data/                     ← Persistent memory (auto-generated)
    ├── player.md            ← Character progress
    └── world.md             ← World discoveries
```

## ✨ Key Features

✅ **Persistent Connection** - Maintains connection to tbaMUD daemon  
✅ **Real-time Stats** - HP, Mana, Moves tracked and displayed  
✅ **Goal Tracking** - Set and track long-term objectives  
✅ **World Memory** - Auto-saves room descriptions, NPCs, items  
✅ **Character Memory** - Persists across disconnects  
✅ **Dual Interface** - CLI and Claude Code skill support  
✅ **Auto State Save** - JSON + Markdown formats  

## 🚀 Getting Started

### Step 1: Read [INSTALL.md](INSTALL.md)
Complete setup instructions for your system (Windows/Mac/Linux)

### Step 2: Install & Start
```bash
# Install Node packages
cd mud-client && npm install && cd ..

# Start the daemon
node mud-client/mud-daemon.js
```

### Step 3: Connect & Play
```bash
# In a new terminal
node mud-client/mud-cli.js connect
node mud-client/mud-cli.js look
```

### Step 4: Set Goals & Explore
```bash
node mud-cli.js goal set "Reach level 5"
node mud-cli.js go north
node mud-cli.js look
```

### Step 5: Check Your Progress
```bash
# View character progress
cat data/player.md

# View world discoveries
cat data/world.md

# View goals
node mud-cli.js goal list
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| **INSTALL.md** | Step-by-step setup for all platforms |
| **CLAUDE.md** | Complete feature docs, architecture, troubleshooting |
| **mud-client/SKILL.md** | Command reference, interaction modes, examples |
| **mud-client/README.md** | Technical implementation details |

## 🎮 Usage Examples

### Via CLI
```bash
# Navigation
node mud-cli.js go north
node mud-cli.js look
node mud-cli.js examine sword

# Combat
node mud-cli.js kill goblin
node mud-cli.js cast fireball
node mud-cli.js flee

# Communication
node mud-cli.js say Hello!
node mud-cli.js tell player Hello there!

# Goals
node mud-cli.js goal set "Defeat dragon"
node mud-cli.js goal list
node mud-cli.js goal complete 0
```

### Via Claude Code Skill
```
/mud-client connect to the mud
/mud-client look around and describe what you see
/mud-client go north and report what's there
/mud-client set a goal to reach level 10
/mud-client check my current status
```

## 🔄 Persistent Memory

After each command, two files automatically update:

### `data/player.md` - Your Progress
- Current stats (HP, Mana, Moves)
- Location
- Inventory
- Goals and completion status
- Location history

### `data/world.md` - World Knowledge
- Discovered rooms with descriptions
- NPCs and creatures
- Items found
- Exploration metrics

These files are **human-readable** - you can view and even manually edit them!

## ⚙️ Configuration

### Default Settings
- **MUD Server**: localhost:4000
- **Character**: dummy
- **Password**: helloworld
- **Daemon Port**: 9999

To change, edit `mud-client/mud-daemon.js`:
```javascript
const CONFIG = {
  host: 'localhost',        // ← Change MUD host
  port: 4000,               // ← Change MUD port
  character: 'dummy',       // ← Change character name
  password: 'helloworld'    // ← Change password
};
```

## 🛠️ Troubleshooting

**Can't connect to MUD?**
- Verify MUD is running: `telnet localhost 4000`
- Check daemon is running: `node mud-cli.js status`
- See [CLAUDE.md troubleshooting](CLAUDE.md#troubleshooting)

**No data in player.md?**
- Ensure daemon has received at least one command
- Check logs: `cat mud-client/.mud-state/mud.log`
- Try reconnecting: `node mud-cli.js disconnect` then `connect`

**Port already in use?**
- Kill existing daemon: `pkill -f mud-daemon.js`
- Or specify different port in CONFIG

See [CLAUDE.md](CLAUDE.md) for more troubleshooting.

## 📖 Installation in Claude Code

To use as an official Claude Code skill:

**Windows:**
```powershell
Copy-Item -Path "mud-client" -Destination "$env:USERPROFILE\.claude\skills\" -Recurse
```

**Mac/Linux:**
```bash
cp -r mud-client ~/.claude/skills/
```

Then reload Claude Code to see the skill available.

## 🧪 Testing

The skill comes with test cases:
```bash
cd mud-client
cat evals/evals.json    # View test cases
npm test                # Run tests (if configured)
```

## 📝 Next Steps

1. ✅ Read [INSTALL.md](INSTALL.md)
2. ✅ Run setup: `npm install --prefix mud-client`
3. ✅ Start daemon: `node mud-client/mud-daemon.js`
4. ✅ Connect: `node mud-client/mud-cli.js connect`
5. ✅ Play and explore!
6. ✅ Check progress: `cat data/player.md` and `cat data/world.md`

## 🤝 Contributing

Want to improve this skill? 
- Test thoroughly
- Update SKILL.md docs
- Add test cases to evals/
- Ensure data files are valid

## 📄 License

Created for Claude Code Boot Camp 2026

## 💬 Questions?

See the troubleshooting section in [CLAUDE.md](CLAUDE.md) or check the logs:
```bash
tail -f mud-client/.mud-state/mud.log
```

---

**Ready to play? Start with [INSTALL.md](INSTALL.md)!** 🎮
