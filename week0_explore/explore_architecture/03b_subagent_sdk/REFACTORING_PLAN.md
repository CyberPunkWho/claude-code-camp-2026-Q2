# Refactoring Plan: Filesystem-Based Agent Loading → AgentDefinition SDK

## Overview
Refactor the agent loading mechanism from filesystem-based (markdown files in `.claude/agents/`) to programmatic using the Claude Agent SDK's `AgentDefinition` type.

---

## Current State

### How Agents are Currently Loaded
```
.claude/settings.json
  └── customAgents array
        └── name: "mud-client-agent"
        └── path: "./.claude/agents/mud-client.md"
              └── YAML frontmatter + markdown instructions
```

**Current Flow:**
1. Claude Code reads `.claude/settings.json`
2. Finds `customAgents[0]` with name "mud-client-agent"
3. Loads the markdown file from `./.claude/agents/mud-client.md`
4. Parses YAML frontmatter (name, description, model, reasoning_budget)
5. Uses markdown content as agent instructions
6. Agent is available as `/mud-client-agent` skill

**Files Involved:**
- `.claude/settings.json` - Agent registration (8 lines)
- `.claude/agents/mud-client.md` - Agent definition (137 lines)

---

## Target State

### How Agents Will Be Loaded
```
agents.js (or agents.config.js)
  └── Programmatic AgentDefinition
        ├── name: "mud-client-agent"
        ├── description: "..."
        ├── model: "claude-opus-5"
        ├── reasoning_budget: "high"
        └── instructions: "..."
```

**New Flow:**
1. Claude Code reads `.claude/settings.json`
2. Finds `customAgents` configuration pointing to `agents.js`
3. Loads and evaluates the JavaScript module
4. Extracts `AgentDefinition` objects programmatically
5. Agent is available as `/mud-client-agent` skill

**Files to Create/Modify:**
- `.claude/agents.js` (NEW) - Programmatic agent definitions
- `.claude/settings.json` (MODIFY) - Change `customAgents` to use new format
- `.claude/agents/mud-client.md` (DELETE) - No longer needed

---

## Implementation Steps

### Phase 1: Create New Programmatic Agent Definition
**File:** `.claude/agents.js`

```javascript
module.exports = {
  mudClientAgent: {
    name: "mud-client-agent",
    description: "Autonomous MUD player agent using the mud-client skill for tbaMUD gameplay, character progression, and world exploration with persistent memory.",
    model: "claude-opus-5",
    reasoning_budget: "high",
    instructions: `
      You are an autonomous agent controlling a character in tbaMUD...
      [Full instruction text from current .md file]
    `
  }
};
```

**Rationale:**
- Keeps agent definitions in code, version-controlled
- Enables IDE support (autocomplete, type checking)
- Makes agent configuration testable and lint-able
- Single source of truth for agent config

---

### Phase 2: Update Settings Configuration
**File:** `.claude/settings.json`

**Current:**
```json
"customAgents": [
  {
    "name": "mud-client-agent",
    "path": "./.claude/agents/mud-client.md"
  }
]
```

**New approach depends on how Claude Agent SDK expects configuration:**

**Option A - SDK supports JavaScript modules (RECOMMENDED IF AVAILABLE):**
```json
"customAgents": [
  {
    "name": "mud-client-agent",
    "module": "./.claude/agents.js",
    "export": "mudClientAgent"
  }
]
```

**Option B - Claude Code SDK setting for agents:**
```json
"agentsModule": "./.claude/agents.js"
```

**Option C - Standard Node.js require pattern:**
```json
"agents": [
  {
    "definition": "require('./.claude/agents.js').mudClientAgent"
  }
]
```

---

### Phase 3: Delete Obsolete Files
**Files to Remove:**
- `.claude/agents/mud-client.md` - Agent definition now in `agents.js`

**Keep:**
- `.claude/agents/` directory (empty or for documentation)
- Everything else unchanged

---

## File Changes Summary

| File | Action | Size | Changes |
|------|--------|------|---------|
| `.claude/agents.js` | CREATE | ~150 lines | New file with programmatic definitions |
| `.claude/settings.json` | MODIFY | ~24 lines | Update `customAgents` array format |
| `.claude/agents/mud-client.md` | DELETE | 137 lines | Consolidate into agents.js |

**Total Impact:** 
- +1 file created
- 1 file modified (settings)
- 1 file deleted
- Net lines: ~13 lines added to settings, ~150 lines added to agents.js, 137 lines removed from .md

---

## Key Benefits

✅ **Version Control:** Agent definitions tracked in code  
✅ **Type Safety:** Can add JSDoc or TypeScript types for AgentDefinition  
✅ **Testability:** Easier to unit test agent configurations  
✅ **IDE Support:** Autocomplete and syntax highlighting  
✅ **Maintainability:** Single language (JS) vs mixed markdown/YAML  
✅ **Scalability:** Easy to add multiple agents programmatically  
✅ **Simplicity:** No file path resolution issues  

---

## Potential Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| SDK may not support JS modules | Check `claude-api` skill first, adjust format if needed |
| Large instruction text in JS | Use template literals (already planned) |
| Agent not discoverable after change | Test with `/mud-client-agent` command after refactoring |
| Syntax errors in JS file | Validate JS syntax, test load process |

---

## Testing Plan

After refactoring:
1. ✅ Run `npm test` or equivalent (if tests exist)
2. ✅ Verify `.claude/settings.json` is valid JSON
3. ✅ Try to invoke agent: `/mud-client-agent status`
4. ✅ Verify memory files still work (data/player.md, data/world.md)
5. ✅ Run a test command: `/mud-client-agent look`
6. ✅ Confirm output is identical to pre-refactoring behavior

---

## Decision Points for User

Before proceeding, please clarify:

1. **Configuration Format:** Does the Claude Agent SDK prefer:
   - `module` + `export` fields in settings.json?
   - A separate `agentsModule` setting?
   - Direct require() in settings?

2. **Future Growth:** Do you plan to:
   - Add more agents later? (If yes, agents.js is more scalable)
   - Keep agent definitions separate? (If yes, keep .md format)

3. **TypeScript vs JavaScript:**
   - Should we use `.ts` instead of `.js`?
   - Add JSDoc types for AgentDefinition?

---

## Rollback Plan

If issues arise:
1. Keep git history (commit before refactoring)
2. Can restore `.claude/agents/mud-client.md` from git
3. Revert `.claude/settings.json` changes
4. Delete `.claude/agents.js`

---

## Next Steps

**If you approve this plan:**
1. ✅ Clarify configuration format with me
2. ✅ I'll create `.claude/agents.js` with full agent definition
3. ✅ Update `.claude/settings.json` appropriately
4. ✅ Delete `.claude/agents/mud-client.md`
5. ✅ Run tests to verify everything works

**Questions or concerns?** Please review the plan and let me know:
- Any sections you'd like me to adjust?
- Do you have preferences on the configuration format?
- Should we use TypeScript instead?
- Any other agent definitions to migrate?
