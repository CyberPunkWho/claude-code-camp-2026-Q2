# run_agent.py - Interactive Agent Runner

An interactive Python CLI for running agents defined in `.claude/agents.js` using the Claude Agent SDK.

## Setup

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- `anthropic>=0.21.0` - Claude SDK for Python

### 2. Set Your API Key
The runner requires an Anthropic API key. Set it in your environment:

**Linux/Mac:**
```bash
export ANTHROPIC_API_KEY='sk-...'
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY='sk-...'
```

**Windows (CMD):**
```cmd
set ANTHROPIC_API_KEY=sk-...
```

## Usage

### Start the Runner
```bash
python run_agent.py
```

You'll see:
```
============================================================
  CLAUDE AGENT RUNNER - Interactive Mode
============================================================

Loaded 1 agent(s):

  1. mud-client-agent
     Autonomous MUD player agent using the mud-client skill...
     Model: claude-opus-5 | Reasoning: high
```

### Main Menu
```
Options:
  1. Run an agent
  2. View agent details
  3. Clear conversation history
  4. Exit

Or type an agent name directly to run it.
```

### Examples

#### Run an Agent by Name
```
> mud-client-agent
Selected agent: mud-client-agent

[mud-client-agent] Enter your request (or 'menu' to see options):
> explore the starting area and tell me what you find
```

#### View Agent Details
```
> 2
Enter agent name: mud-client-agent

============================================================
Agent: mud-client-agent
============================================================

Description: Autonomous MUD player agent using the mud-client skill...
Model: claude-opus-5
Reasoning Budget: high

Instructions:
------------------------------------------------------------
You are an autonomous agent controlling a character in tbaMUD...
------------------------------------------------------------
```

#### Clear Conversation History
```
> 3
Enter agent name: mud-client-agent
Cleared conversation history for 'mud-client-agent'.
```

#### Exit
```
> exit
Goodbye!
```

## Features

### Interactive CLI
- **Menu-driven interface** - Easy navigation with numbered options
- **Direct agent selection** - Type agent name to run immediately
- **Context-sensitive prompts** - Different prompts depending on current state

### Conversation Management
- **Persistent history** - Multi-turn conversations with context
- **Per-agent memory** - Each agent maintains separate conversation history
- **Auto-cleanup** - History limited to last 20 messages for efficiency

### Extended Thinking
The runner automatically uses Claude's extended thinking feature:
- **High reasoning budget** (10k tokens) for agents with `reasoning_budget: "high"`
- **Medium reasoning budget** (5k tokens) for `reasoning_budget: "medium"`
- **No thinking** for agents without reasoning budget

### Agent Loading
Automatically parses `.claude/agents.js` to load:
- Agent name and description
- Model configuration
- Reasoning budget
- Full instructions

## How It Works

```
User Input (stdin)
    ↓
[run_agent.py]
    ├─ Loads agents from .claude/agents.js
    ├─ Maintains conversation history
    └─ Calls Claude API with AgentDefinition
        ↓
    [Claude API]
    ├─ Uses extended thinking if budget set
    ├─ Applies agent instructions as system prompt
    └─ Returns response
        ↓
    Display to stdout
```

## Environment Variables

- **ANTHROPIC_API_KEY** (required) - Your Claude API key
  - Get from: https://console.anthropic.com

## Troubleshooting

### "ANTHROPIC_API_KEY environment variable not set"
Set your API key as shown in the Setup section above.

### "anthropic library not installed"
Run:
```bash
pip install anthropic
```

### "No agents found in agents.js"
Ensure `.claude/agents.js` exists and contains valid agent definitions in the format:
```javascript
module.exports = {
  agentName: {
    name: "agent-name",
    description: "...",
    model: "claude-opus-5",
    reasoning_budget: "high",
    instructions: "..."
  }
};
```

### "No response from agent"
- Check your internet connection
- Verify API key is valid
- Check that model name is correct (default: claude-opus-5)

## API Usage & Pricing

Each interaction:
1. Sends agent instructions as system message
2. Sends your input as user message
3. Gets Claude API response

Tokens counted toward your Anthropic usage. For pricing, visit:
https://www.anthropic.com/pricing

## Advanced Usage

### Running Multiple Agents
```
> mud-client-agent
[mud-client-agent] > explore the world

> menu
> another-agent
[another-agent] > different task
```

### Maintaining Context
Conversations are automatically tracked per agent. Type the same agent name to continue:
```
> mud-client-agent
[mud-client-agent] > what's your current location?
[Agent responds with info]

[mud-client-agent] > go north
[Agent continues with context from previous message]
```

## Comparison: run_agent.py vs Claude Code UI

| Feature | run_agent.py | /mud-client-agent |
|---------|--------------|-------------------|
| Interactive Loop | ✅ Yes | ❌ No |
| Conversation History | ✅ Persistent | ❌ Per-message |
| Direct API Access | ✅ Yes | ❌ Via Claude Code |
| Extended Thinking | ✅ Configurable | ✅ Built-in |
| Agent Definition | ✅ From agents.js | ✅ From agents.js |
| MUD Integration | Via daemon | Via mud-client skill |

## Notes

- The runner loads agent definitions fresh each time it starts
- Conversation history is stored in memory (lost on exit)
- To persist conversations, save chat output to a file
- Agent instructions override any built-in behaviors

## Next Steps

1. Start the MUD daemon: `node mud-daemon.js`
2. Run the agent runner: `python run_agent.py`
3. Interact with agents in a loop!

Enjoy exploring with Claude agents! 🤖
