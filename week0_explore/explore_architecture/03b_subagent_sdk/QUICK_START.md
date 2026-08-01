# Quick Start - run_agent.py

## 🚀 TL;DR - 3 Steps

### Step 1: Setup (One Time)
```bash
# Linux/Mac/WSL:
chmod +x setup.sh && ./setup.sh

# Windows:
setup.bat
```

### Step 2: Activate (Each Session)
```bash
# Linux/Mac/WSL:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### Step 3: Run
```bash
export ANTHROPIC_API_KEY='sk-ant-...'  # Set your key
python run_agent.py
```

---

## ❓ Got "externally-managed-environment" Error?

**You need a virtual environment.** Run setup script:

```bash
./setup.sh          # Linux/Mac/WSL
# or
setup.bat           # Windows
```

That's it! The script handles everything.

---

## 💬 Using the Agent

Once `python run_agent.py` is running:

```
1. mud-client-agent
   Autonomous MUD player agent...

[Options]
  1. Run an agent
  2. View agent details  
  3. Clear history
  4. Exit

> mud-client-agent              ← Type agent name

[mud-client-agent] Enter request:
> explore the world             ← Type your request

[Agent responds...]

> exit                           ← Exit anytime
```

---

## 🔑 API Key Setup

Get your key from: https://console.anthropic.com

**Set it (choose one):**

```bash
# Linux/Mac (temporary for session):
export ANTHROPIC_API_KEY='sk-ant-...'

# Windows PowerShell:
$env:ANTHROPIC_API_KEY='sk-ant-...'

# Windows Command Prompt:
set ANTHROPIC_API_KEY=sk-ant-...

# Linux/Mac (permanent, add to ~/.bashrc):
echo "export ANTHROPIC_API_KEY='sk-ant-...'" >> ~/.bashrc
```

---

## 📁 Project Structure

```
03b_subagent_sdk/
├── venv/                    ← Virtual environment (created by setup)
├── .claude/agents.js        ← Agent definitions
├── run_agent.py             ← Main script
├── requirements.txt         ← Dependencies
├── setup.sh / setup.bat     ← Setup scripts
├── SETUP_INSTRUCTIONS.md    ← Detailed guide
└── QUICK_START.md           ← This file
```

---

## ✅ Verify Installation

After setup, verify everything works:

```bash
source venv/bin/activate
pip list | grep anthropic      # Should show anthropic version
python -c "import anthropic; print('✅ OK')"
echo $ANTHROPIC_API_KEY        # Should show your key
python run_agent.py            # Should start script
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "python3 not found" | Install from https://python.org |
| "venv command not found" | `sudo apt install python3-venv` (Ubuntu) |
| "setup.sh: permission denied" | `chmod +x setup.sh` |
| "externally-managed" error | Run `./setup.sh` or `setup.bat` |
| "ANTHROPIC_API_KEY not set" | Set your key (see API Key Setup above) |
| "ModuleNotFoundError: anthropic" | Activate venv: `source venv/bin/activate` |

---

## 📚 Full Documentation

- **SETUP_INSTRUCTIONS.md** - Detailed setup guide (manual & automated)
- **RUN_AGENT_GUIDE.md** - Full usage documentation
- **CHANGES_SUMMARY.md** - What was changed & why
- **TEST_RESULTS.md** - Test results & verification

---

## 🎯 Common Commands

```bash
# Activate venv (do this each session)
source venv/bin/activate

# Deactivate venv
deactivate

# Delete venv (start fresh)
rm -rf venv

# Re-create and setup
./setup.sh

# Check Python version
python --version

# List installed packages
pip list

# Install additional packages
pip install package-name

# Run the agent
python run_agent.py

# Exit agent
exit (or quit)
```

---

## 🔧 Still Stuck?

1. **Re-run setup**:
   ```bash
   rm -rf venv
   ./setup.sh
   ```

2. **Check Python**:
   ```bash
   python3 --version  # Should be 3.8+
   ```

3. **Verify venv activation**:
   ```bash
   echo $VIRTUAL_ENV   # Should show path to venv/
   ```

4. **Check API key**:
   ```bash
   echo $ANTHROPIC_API_KEY  # Should show your key
   ```

---

## 🚀 Ready?

```bash
./setup.sh
source venv/bin/activate
export ANTHROPIC_API_KEY='sk-...'
python run_agent.py
```

Enjoy exploring with Claude agents! 🤖
