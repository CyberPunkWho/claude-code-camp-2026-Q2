# Installation & Setup Guide

## Option 1: Run Locally (Recommended for Development)

### 1. Install Node.js
Download and install from https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Dependencies
```bash
cd week0_explore/explore_architecture/02_agent_skills/mud-client
npm install
```

### 3. Verify MUD Server is Running
The skill connects to tbaMUD on `localhost:4000`. Ensure your Docker container or MUD server is running:

```bash
# Test connection
telnet localhost 4000
# You should see the tbaMUD welcome screen
# Exit with: Ctrl+]  then  quit
```

### 4. Start the Daemon
```bash
# Terminal Window 1 - Keep this running
cd week0_explore/explore_architecture/02_agent_skills/mud-client
node mud-daemon.js
```

You should see:
```
[timestamp] MUD daemon started, listening on localhost:9999
```

### 5. Test the Skill (New Terminal)
```bash
# Terminal Window 2
cd week0_explore/explore_architecture/02_agent_skills/mud-client
node mud-cli.js connect
node mud-cli.js look
```

You should see your character's surroundings!

### 6. Start Playing
```bash
# Set a goal
node mud-cli.js goal set "Reach level 5"

# Explore
node mud-cli.js go north
node mud-cli.js look

# Check your progress
node mud-cli.js goal list
cat ../data/player.md    # View character progress
cat ../data/world.md     # View world discoveries
```

---

## Option 2: Install as Claude Code Skill

### For Claude Code Desktop App

#### Windows PowerShell:
```powershell
# Navigate to skills directory
$skillsDir = "$env:USERPROFILE\.claude\skills"

# Copy the skill
Copy-Item -Path "week0_explore/explore_architecture/02_agent_skills/mud-client" `
          -Destination "$skillsDir/mud-client" -Recurse -Force

# Or create a symlink (for development)
New-Item -ItemType SymbolicLink `
         -Path "$skillsDir/mud-client" `
         -Target "$(Get-Location)\week0_explore\explore_architecture\02_agent_skills\mud-client"
```

#### Mac/Linux:
```bash
# Copy the skill
cp -r week0_explore/explore_architecture/02_agent_skills/mud-client ~/.claude/skills/

# Or symlink (for development)
ln -s "$(pwd)/week0_explore/explore_architecture/02_agent_skills/mud-client" \
      ~/.claude/skills/mud-client
```

### Reload Claude Code
1. Quit Claude Code completely
2. Reopen Claude Code
3. The `mud-client` skill should now be available

### Use in Claude Code
In Claude Code, start the daemon first:
```bash
! cd week0_explore/explore_architecture/02_agent_skills/mud-client && node mud-daemon.js &
```

Then use the skill:
```
/mud-client connect to the mud
/mud-client look around
/mud-client explore north
```

---

## Option 3: Install via Claude Code CLI

### Install Claude Code CLI
```bash
npm install -g @anthropic-ai/claude-code
```

### Install the Skill
```bash
claude-code skill install ./week0_explore/explore_architecture/02_agent_skills/mud-client
```

### Use in Terminal
```bash
# Start daemon
node week0_explore/explore_architecture/02_agent_skills/mud-client/mud-daemon.js &

# Use skill
claude-code /mud-client connect
claude-code /mud-client look
```

---

## Troubleshooting Installation

### Node.js Not Found
```bash
# Make sure Node.js is installed
node --version

# If not installed, download from https://nodejs.org/
# After installation, close and reopen your terminal
```

### Port Already in Use
The daemon uses port 9999. If it's in use:

**Windows:**
```powershell
# Find process using port 9999
netstat -ano | findstr :9999

# Kill it (replace PID with the number shown above)
taskkill /PID <PID> /F

# Try again
node mud-daemon.js
```

**Mac/Linux:**
```bash
# Find process
lsof -i :9999

# Kill it
kill -9 <PID>
```

### Can't Connect to MUD
1. Verify MUD is running: `telnet localhost 4000`
2. Check Docker: `docker ps` (if using Docker)
3. Verify firewall isn't blocking localhost:4000
4. Check daemon logs: `tail -f mud-client/.mud-state/mud.log`

### No Data in player.md / world.md
1. Ensure daemon is running: `node mud-cli.js status`
2. Send at least one command: `node mud-cli.js look`
3. Check for errors: `cat mud-client/.mud-state/mud.log`
4. Files should update after each command

---

## File Permissions

If you get permission errors on Mac/Linux:

```bash
# Make scripts executable
chmod +x mud-client/mud-daemon.js
chmod +x mud-client/mud-cli.js

# Or for all files
chmod -R +x mud-client/
```

---

## Quick Start Checklist

- [ ] Node.js installed and in PATH
- [ ] npm packages installed (`npm install` in mud-client)
- [ ] MUD server running on localhost:4000
- [ ] Daemon started (`node mud-daemon.js`)
- [ ] CLI working (`node mud-cli.js connect`)
- [ ] Can see game output (`node mud-cli.js look`)
- [ ] Data files generating (`ls data/`)

Once all checked, you're ready to play! 🎮

---

## Next Steps

1. Read **CLAUDE.md** for full documentation
2. Read **mud-client/SKILL.md** for command reference
3. Check **data/player.md** and **data/world.md** to see your progress
4. Set goals and start exploring!

---

## Support

For issues or questions:
- Check **mud-client/.mud-state/mud.log** for debug info
- Review **CLAUDE.md** troubleshooting section
- Verify MUD server is running and accessible
