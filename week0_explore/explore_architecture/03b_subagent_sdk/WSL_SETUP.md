# Running run_agent.py in WSL - Complete Guide

## 🐧 WSL Setup

### Option 1: Access from Windows Path (Easiest)

The files are already in your Windows OneDrive. Access them directly from WSL:

**Step 1: Open WSL Terminal**
```bash
wsl
```

**Step 2: Navigate to Project**
```bash
cd /mnt/c/Users/felip/OneDrive/Documentos/"Claude Cowork"/"Claude Code Boot Camp 2026"/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk
```

Or shorter:
```bash
cd /mnt/c/Users/felip/'OneDrive/Documentos/Claude Cowork/Claude Code Boot Camp 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk'
```

**Step 3: Check Python is Available**
```bash
python3 --version
```

Should show Python 3.12+

**Step 4: Run Setup Script**
```bash
chmod +x setup.sh
./setup.sh
```

The script will create a `venv` folder and install dependencies.

**Step 5: Activate Virtual Environment**
```bash
source venv/bin/activate
```

You should see `(venv)` in your prompt.

**Step 6: Set API Key**
```bash
export ANTHROPIC_API_KEY='sk-ant-...'
```

Replace `sk-ant-...` with your actual API key from https://console.anthropic.com

**Step 7: Run Agent**
```bash
python run_agent.py
```

---

### Option 2: Copy to WSL Home (Better Performance)

For faster file access, copy files to WSL home directory:

**Step 1: Open WSL**
```bash
wsl
```

**Step 2: Create Project Directory**
```bash
mkdir -p ~/projects/mud-agent
cd ~/projects/mud-agent
```

**Step 3: Copy Files from Windows**
```bash
cp -r /mnt/c/Users/felip/'OneDrive/Documentos/Claude Cowork/Claude Code Boot Camp 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk'/* .
```

**Step 4: Verify Files Copied**
```bash
ls -la
```

Should show: `run_agent.py`, `setup.sh`, `requirements.txt`, etc.

**Step 5: Setup and Run**
```bash
chmod +x setup.sh
./setup.sh
source venv/bin/activate
export ANTHROPIC_API_KEY='sk-...'
python run_agent.py
```

---

## 🔑 Setting API Key in WSL

### Option A: Temporary (Current Session Only)
```bash
export ANTHROPIC_API_KEY='sk-ant-your-key-here'
python run_agent.py
```

### Option B: Persistent (Add to ~/.bashrc)

```bash
# Add to ~/.bashrc file
nano ~/.bashrc
```

Add this line at the end:
```bash
export ANTHROPIC_API_KEY='sk-ant-your-key-here'
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`

Then reload:
```bash
source ~/.bashrc
```

---

## 📝 WSL Quick Command Reference

```bash
# Start WSL from Windows
wsl

# Navigate to project (from Windows path)
cd /mnt/c/Users/felip/'OneDrive/Documentos/Claude Cowork/Claude Code Boot Camp 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk'

# Or copy to WSL home first
mkdir -p ~/projects && cd ~/projects/mud-agent

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set API key
export ANTHROPIC_API_KEY='sk-...'

# Run agent
python run_agent.py

# Exit agent
# Type: exit

# Deactivate venv (when done)
deactivate

# Exit WSL
exit
```

---

## ✅ Full WSL Setup (Copy & Paste)

```bash
# 1. Open WSL
wsl

# 2. Navigate to project
cd /mnt/c/Users/felip/'OneDrive/Documentos/Claude Cowork/Claude Code Boot Camp 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk'

# 3. Make setup script executable
chmod +x setup.sh

# 4. Run setup (creates venv and installs anthropic)
./setup.sh

# 5. Activate virtual environment
source venv/bin/activate

# 6. Set your API key (get from https://console.anthropic.com)
export ANTHROPIC_API_KEY='sk-ant-put-your-key-here'

# 7. Run the agent
python run_agent.py
```

Done! You're running in WSL now.

---

## 🐛 WSL Troubleshooting

### "python3 not found"
```bash
# Install Python in WSL
sudo apt update
sudo apt install python3 python3-venv python3-pip
```

### "venv module not found"
```bash
sudo apt install python3-venv
```

### "permission denied" on setup.sh
```bash
chmod +x setup.sh
./setup.sh
```

### Path too long error on Windows paths
Use shorter copied version:
```bash
mkdir -p ~/mud-agent
cp -r /mnt/c/Users/felip/OneDrive/Documentos/Claude\ Cowork/Claude\ Code\ Boot\ Camp\ 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk/* ~/mud-agent
cd ~/mud-agent
```

### Can't find files
Check path:
```bash
# List Windows path from WSL
ls /mnt/c/Users/felip/

# Or use Tab autocomplete
cd /mnt/c/Users/felip/On[TAB]
```

### Virtual environment not activating
Make sure you're in the right directory:
```bash
pwd  # Should show project directory
ls venv/  # Should list venv folder
source venv/bin/activate  # Activate it
```

---

## 📂 What Gets Created

After setup, your directory looks like:
```
03b_subagent_sdk/
├── venv/                       ← Virtual environment (auto-created)
│   ├── bin/
│   │   ├── python             ← Isolated Python
│   │   ├── pip                ← Isolated pip
│   │   └── activate           ← Activation script
│   └── lib/
│       └── site-packages/
│           └── anthropic/     ← anthropic package
├── run_agent.py               ← Main script
├── requirements.txt           ← Dependencies
├── setup.sh                   ← Setup script
└── ... (other files)
```

---

## 🔄 Reusing in Future Sessions

Each time you open WSL:

```bash
# 1. Open WSL
wsl

# 2. Navigate to project
cd /mnt/c/Users/felip/'OneDrive/Documentos/Claude Cowork/Claude Code Boot Camp 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk'

# 3. Activate venv (it already exists from first setup)
source venv/bin/activate

# 4. Set API key (if not in ~/.bashrc)
export ANTHROPIC_API_KEY='sk-...'

# 5. Run
python run_agent.py
```

---

## 💡 Tips

### Use Shorter Paths
```bash
# Add alias to ~/.bashrc
echo "alias mud='cd ~/projects/mud-agent && source venv/bin/activate'" >> ~/.bashrc
source ~/.bashrc

# Then just:
mud
python run_agent.py
```

### Copy to WSL for Better Performance
Windows paths (`/mnt/c/...`) are slower in WSL. For daily use:
```bash
cp -r /mnt/c/Users/felip/OneDrive/Documentos/'Claude Cowork'/'Claude Code Boot Camp 2026'/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk ~/projects/mud-agent
cd ~/projects/mud-agent
```

### Use VS Code with WSL
1. Install "Remote - WSL" extension in VS Code
2. Open VS Code
3. `Ctrl+Shift+P` → "Remote-WSL: Open Folder in WSL"
4. Select your project folder
5. Terminal in VS Code is now WSL

---

## 🎯 Minimal Setup for Impatient

```bash
wsl
cd /mnt/c/Users/felip/OneDrive/Documentos/Claude\ Cowork/Claude\ Code\ Boot\ Camp\ 2026/claude-code-camp-2026-Q2/week0_explore/explore_architecture/03b_subagent_sdk
chmod +x setup.sh && ./setup.sh && source venv/bin/activate
export ANTHROPIC_API_KEY='sk-...'
python run_agent.py
```

One command line, all setup done!

---

Done! 🚀 You're running run_agent.py in WSL!
