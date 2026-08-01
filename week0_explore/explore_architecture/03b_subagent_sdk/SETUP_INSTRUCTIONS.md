# Setup Instructions for run_agent.py

This guide explains how to set up and run the Python agent runner despite the "externally-managed-environment" error.

## The Problem

Modern Python installations (PEP 668) prevent installing packages system-wide to avoid conflicts. You need a **virtual environment**.

## Solution: Virtual Environment Setup

### Option 1: Automated Setup (Recommended)

#### On Linux/WSL/Mac:
```bash
chmod +x setup.sh
./setup.sh
```

#### On Windows (Command Prompt):
```cmd
setup.bat
```

#### On Windows (PowerShell):
```powershell
.\setup.bat
```

The script will:
- ✅ Check for Python 3
- ✅ Create a virtual environment named `venv`
- ✅ Activate it
- ✅ Install requirements automatically

---

### Option 2: Manual Setup

#### Step 1: Create Virtual Environment

**Linux/WSL/Mac:**
```bash
python3 -m venv venv
```

**Windows (any shell):**
```cmd
python -m venv venv
```

This creates a folder named `venv/` with isolated Python installation.

#### Step 2: Activate Virtual Environment

**Linux/WSL/Mac:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error on PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Step 3: Install Dependencies

With the virtual environment activated, run:
```bash
pip install -r requirements.txt
```

You should see:
```
Successfully installed anthropic-x.x.x
```

#### Step 4: Set Your API Key

**Linux/WSL/Mac:**
```bash
export ANTHROPIC_API_KEY='sk-ant-...'
```

**Windows (Command Prompt):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-...
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY='sk-ant-...'
```

#### Step 5: Run the Agent

```bash
python run_agent.py
```

---

## Verification Checklist

- [x] Virtual environment created (`venv/` folder exists)
- [x] Virtual environment activated (`(venv)` in prompt, or `%VIRTUAL_ENV%` is set)
- [x] `pip install` works without "externally-managed-environment" error
- [x] `anthropic` package installed (check with `pip list | grep anthropic`)
- [x] `ANTHROPIC_API_KEY` environment variable set
- [x] `python run_agent.py` starts without errors

---

## Common Issues & Solutions

### "python3: command not found"
**Solution**: Install Python 3.8+ from https://python.org

### "venv module not found"
**Solution**: On Debian/Ubuntu, install python3-venv:
```bash
sudo apt update
sudo apt install python3-venv
```

### "Permission denied" when running setup.sh
**Solution**: Make it executable:
```bash
chmod +x setup.sh
./setup.sh
```

### "externally-managed-environment" error still appears
**Reasons**:
1. Virtual environment not activated
2. Using wrong Python version
3. Virtual environment not created properly

**Fix**: Verify activation:
```bash
which python3          # Should show path with 'venv'
echo $VIRTUAL_ENV      # Should show path to venv folder
python -m pip --version  # Should mention venv
```

### "ModuleNotFoundError: No module named 'anthropic'"
**Solution**: Install in virtual environment:
```bash
source venv/bin/activate  # Linux/Mac
pip install anthropic     # Install in active venv
```

### "ANTHROPIC_API_KEY not set" when running script
**Solution**: API key not set for this session:
```bash
export ANTHROPIC_API_KEY='sk-ant-...'
python run_agent.py
```

For persistence (Linux/Mac), add to `~/.bashrc`:
```bash
export ANTHROPIC_API_KEY='sk-ant-...'
```

---

## What is a Virtual Environment?

A virtual environment is an isolated Python installation:
- **Separate packages**: Each project has its own `anthropic` version
- **No conflicts**: Installing for one project doesn't break others
- **System safe**: Doesn't modify system Python
- **Easy cleanup**: Just delete the `venv/` folder

### Directory Structure After Setup
```
03b_subagent_sdk/
├── venv/                          ← Virtual environment (NEW)
│   ├── bin/                       ← Python executables
│   │   ├── python                 ← Isolated Python
│   │   ├── pip                    ← Isolated pip
│   │   └── activate               ← Activation script
│   ├── lib/                       ← Installed packages
│   │   └── python3.x/site-packages/
│   │       └── anthropic/         ← anthropic package here
│   └── pyvenv.cfg
├── run_agent.py                   ← Your agent runner
├── requirements.txt               ← Dependency list
└── ... (other files)
```

---

## Next Steps After Setup

1. ✅ Virtual environment created and activated
2. ✅ Dependencies installed
3. ✅ API key set
4. Run the agent:
   ```bash
   python run_agent.py
   ```

---

## Keeping Virtual Environment Active

The virtual environment is only active in the **current terminal session**.

**To reuse the same venv**:
```bash
# Next time you open terminal:
source venv/bin/activate          # Linux/Mac
# or
venv\Scripts\activate.bat          # Windows CMD
# or
.\venv\Scripts\Activate.ps1        # Windows PowerShell
```

**Tip**: Add activation to your shell profile to auto-activate:

**Linux/Mac (~/.bashrc or ~/.zshrc)**:
```bash
cd /path/to/03b_subagent_sdk
source venv/bin/activate
```

---

## Troubleshooting Commands

```bash
# Verify Python location
which python3
python3 --version

# Verify virtual environment
echo $VIRTUAL_ENV

# List installed packages
pip list

# Check anthropic installation
pip show anthropic

# Verify API key
echo $ANTHROPIC_API_KEY

# Test script loads
python -m py_compile run_agent.py
```

---

## Getting Help

If you still have issues:

1. **Check Python version** (3.8+ required):
   ```bash
   python3 --version
   ```

2. **Verify venv exists**:
   ```bash
   ls -la venv/     # Linux/Mac
   dir venv         # Windows
   ```

3. **Run setup again**:
   ```bash
   rm -rf venv      # Delete old venv
   ./setup.sh       # Run setup script
   ```

4. **Check pip**:
   ```bash
   pip --version
   pip list
   ```

---

## Summary

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `python3 -m venv venv` | Create isolated environment |
| 2 | `source venv/bin/activate` | Activate it |
| 3 | `pip install -r requirements.txt` | Install anthropic |
| 4 | `export ANTHROPIC_API_KEY='sk-...'` | Set API key |
| 5 | `python run_agent.py` | Run agent! |

---

**Ready?** Follow the setup steps above and start exploring with agents! 🚀
