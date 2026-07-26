const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const CONFIG = {
  host: 'localhost',
  port: 4000,
  character: 'dummy',    // Character name
  password: 'helloworld', // Character password
  timeout: 10000
};

const STATE_DIR = path.join(__dirname, '.mud-state');
const STATE_FILE = path.join(STATE_DIR, 'game-state.json');
const DATA_DIR = 'C:\\Users\\felip\\OneDrive\\Documentos\\Claude Cowork\\Claude Code Boot Camp 2026\\claude-code-camp-2026-Q2\\week0_explore\\explore_architecture\\02_agent_skills\\data';
const PLAYER_FILE = path.join(DATA_DIR, 'player.md');
const WORLD_FILE = path.join(DATA_DIR, 'world.md');
const DAEMON_PORT = 9999;
const DAEMON_HOST = 'localhost';
const LOG_FILE = path.join(STATE_DIR, 'mud.log');

// Telnet protocol constants
const IAC = 255;   // Interpret As Command
const DONT = 254;
const DO = 253;
const WONT = 252;
const WILL = 251;
const GA = 249;    // Go Ahead
const EL = 248;    // Erase Line
const EC = 247;    // Erase Character
const AYT = 246;   // Are You There
const AO = 245;    // Abort Output
const IP = 244;    // Interrupt Process
const BREAK = 243;
const DM = 242;    // Data Mark
const NOP = 241;   // No Operation
const SE = 240;    // Subnegotiation End

let mudClient = null;
let ncProcess = null;
let isConnected = false;
let receivedData = Buffer.alloc(0);

let gameState = {
  connected: false,
  character: { name: '', level: 0, xp: 0, hp: 0, mana: 0, moves: 0, maxHp: 0, maxMana: 0 },
  location: { room: '', description: '', lastUpdated: null },
  inventory: [],
  equipment: [],
  combatActive: false,
  lastPrompt: '',
  outputBuffer: [],
  map: {},
  goals: [],
  locationHistory: [],
  worldKnowledge: { rooms: {}, npcs: {}, monsters: {}, items: {} }
};

// Ensure directories exist
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, entry);
}

function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(gameState, null, 2));
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    gameState = { ...gameState, ...saved };
  }
}

function savePlayerMarkdown() {
  const char = gameState.character;
  const loc = gameState.location;
  const now = new Date().toISOString();

  let md = `# Helloworld - Warrior\n\n`;
  md += `**Last Updated:** ${now}\n\n`;

  md += `## Current Status\n`;
  md += `- **Location**: ${loc.room || 'Unknown'}\n`;
  md += `- **Status**: ${gameState.combatActive ? '⚔️ IN COMBAT' : '✨ Exploring'}\n\n`;

  md += `## Stats\n`;
  md += `- **HP**: ${char.hp}/100\n`;
  md += `- **Mana**: ${char.mana}/100\n`;
  md += `- **Moves**: ${char.moves}/200\n`;
  md += `- **Level**: ${char.level || 1}\n`;
  md += `- **XP**: ${char.xp || 0}\n\n`;

  if (gameState.inventory.length > 0) {
    md += `## Inventory\n`;
    gameState.inventory.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  if (gameState.equipment.length > 0) {
    md += `## Equipment\n`;
    gameState.equipment.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  if (gameState.goals.length > 0) {
    md += `## Goals\n`;
    gameState.goals.forEach((goal) => {
      const status = goal.completed ? '✓' : '○';
      md += `- [${status}] ${goal.name}\n`;
    });
    md += '\n';
  }

  if (gameState.locationHistory.length > 0) {
    md += `## Explored Locations\n`;
    const recent = gameState.locationHistory.slice(-15);
    recent.forEach(h => {
      const timestamp = typeof h === 'string' ? h : (h.room || h);
      md += `- ${timestamp}\n`;
    });
  }

  fs.writeFileSync(PLAYER_FILE, md);
}

function saveWorldMarkdown() {
  const world = gameState.worldKnowledge;
  const now = new Date().toISOString();

  let md = `# World Knowledge - TbaMUD\n\n`;
  md += `**Last Updated:** ${now}\n\n`;

  if (Object.keys(world.rooms).length > 0) {
    md += `## Discovered Rooms (${Object.keys(world.rooms).length})\n\n`;
    Object.entries(world.rooms).forEach(([name, room]) => {
      md += `### ${name}\n`;
      if (room.description) {
        const desc = room.description.substring(0, 300).trim();
        md += `${desc}\n`;
      }
      if (room.exits && room.exits.length > 0) {
        md += `**Exits:** ${room.exits.join(', ')}\n`;
      }
      if (room.npcs && room.npcs.length > 0) {
        md += `**NPCs/Objects:** ${room.npcs.join(', ')}\n`;
      }
      md += '\n';
    });
  }

  if (Object.keys(world.npcs).length > 0) {
    md += `## NPCs & Creatures\n`;
    Object.entries(world.npcs).forEach(([name, npc]) => {
      md += `- **${name}** (${npc.location || 'Unknown'})\n`;
    });
    md += '\n';
  }

  if (Object.keys(world.monsters).length > 0) {
    md += `## Monsters Encountered\n`;
    Object.entries(world.monsters).forEach(([name, monster]) => {
      md += `- **${name}** (Lvl ${monster.level || '?'})\n`;
      if (monster.location) md += `  Location: ${monster.location}\n`;
    });
    md += '\n';
  }

  if (Object.keys(world.items).length > 0) {
    md += `## Items & Treasures\n`;
    Object.entries(world.items).forEach(([name, item]) => {
      md += `- **${name}** (${item.location || 'Unknown'})\n`;
    });
  }

  // Add exploration progress
  md += `\n## Exploration Progress\n`;
  md += `- **Rooms Discovered**: ${Object.keys(world.rooms).length}\n`;
  md += `- **NPCs Met**: ${Object.keys(world.npcs).length}\n`;
  md += `- **Monsters Encountered**: ${Object.keys(world.monsters).length}\n`;

  fs.writeFileSync(WORLD_FILE, md);
}

// Handle telnet protocol negotiation
function handleTelnetNegotiation(buffer) {
  const responses = [];
  let i = 0;

  while (i < buffer.length) {
    if (buffer[i] === IAC) {
      if (i + 1 >= buffer.length) break;

      const cmd = buffer[i + 1];

      if (cmd === IAC) {
        // Escaped IAC (literal 255)
        i += 2;
        continue;
      }

      if (cmd === GA) {
        // Go Ahead - just skip it
        i += 2;
        continue;
      }

      if ([DO, DONT, WILL, WONT].includes(cmd)) {
        if (i + 2 >= buffer.length) break;

        const option = buffer[i + 2];

        // Respond to negotiation requests
        if (cmd === DO) {
          // Server asks us to do something - usually decline
          const response = Buffer.alloc(3);
          response[0] = IAC;
          response[1] = WONT;
          response[2] = option;
          responses.push(response);
        } else if (cmd === WILL) {
          // Server will do something - usually accept
          const response = Buffer.alloc(3);
          response[0] = IAC;
          response[1] = DO;
          response[2] = option;
          responses.push(response);
        }

        i += 3;
        continue;
      }

      // Skip unknown IAC sequences
      i += 2;
      continue;
    }

    i++;
  }

  return responses;
}

// Strip telnet control sequences and ANSI escape codes
function stripTelnetSequences(buffer) {
  let output = '';
  let i = 0;

  while (i < buffer.length) {
    // Handle IAC (telnet) sequences
    if (buffer[i] === IAC) {
      if (i + 1 >= buffer.length) {
        i++;
        continue;
      }

      const cmd = buffer[i + 1];

      if (cmd === IAC) {
        // Escaped IAC (literal 255)
        output += String.fromCharCode(255);
        i += 2;
        continue;
      }

      // GA, EL, EC, AYT, etc. - single byte commands
      if ([GA, EL, EC, AYT, AO, IP, BREAK, DM, NOP].includes(cmd)) {
        i += 2;
        continue;
      }

      // DO, DONT, WILL, WONT - three byte sequences
      if ([DO, DONT, WILL, WONT].includes(cmd)) {
        i += 3;
        continue;
      }

      // Unknown IAC command - skip
      i += 2;
      continue;
    }

    // Handle ANSI escape sequences (ESC [ ... m or ESC [ ... H, etc.)
    if (buffer[i] === 27) { // ESC
      if (i + 1 >= buffer.length) {
        i++;
        continue;
      }

      if (buffer[i + 1] === 91) { // [
        // ANSI escape sequence - skip until we find a letter
        let j = i + 2;
        while (j < buffer.length && buffer[j] < 65) {
          j++;
        }
        if (j < buffer.length) {
          j++; // Skip the letter too
        }
        i = j;
        continue;
      }

      // Other ESC sequences
      i++;
      continue;
    }

    // Handle MUD-specific escape sequences like [1z, [7z
    if (buffer[i] === 91) { // [
      let j = i + 1;
      while (j < buffer.length && buffer[j] >= 48 && buffer[j] <= 57) {
        j++; // Skip digits
      }
      if (j < buffer.length && (buffer[j] === 122 || buffer[j] === 122)) { // z
        i = j + 1;
        continue;
      }
    }

    // Regular character
    const char = String.fromCharCode(buffer[i]);
    // Keep printable characters and whitespace
    if (buffer[i] >= 32 || buffer[i] === 9 || buffer[i] === 10 || buffer[i] === 13) {
      output += char;
    }
    i++;
  }

  return output;
}

function parseOutput(data) {
  const text = data.toString();

  // Parse character prompt - NEW FORMAT: "24H 100M 82V"
  const promptMatch = text.match(/(\d+)H\s+(\d+)M\s+(\d+)V/);
  if (promptMatch) {
    gameState.character.hp = parseInt(promptMatch[1]);
    gameState.character.mana = parseInt(promptMatch[2]);
    gameState.character.moves = parseInt(promptMatch[3]);
    gameState.lastPrompt = promptMatch[0];
  }

  // Parse room name (typically on its own line at start of output)
  const roomMatch = text.match(/^([A-Z][^\n]+?)$/m);
  if (roomMatch && !roomMatch[1].includes('Exits:') && !roomMatch[1].includes('H ') && roomMatch[1].length < 100) {
    gameState.location.room = roomMatch[1].trim();
    gameState.location.lastUpdated = new Date().toISOString();

    // Track location history
    if (!gameState.locationHistory.includes(gameState.location.room)) {
      gameState.locationHistory.push({
        room: gameState.location.room,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Parse exits: [ Exits: n e s w ]
  const exitsMatch = text.match(/\[\s*Exits:\s*([^\]]+)\s*\]/);
  if (exitsMatch) {
    const exits = exitsMatch[1].trim().split(/\s+/);
    if (gameState.location.room) {
      gameState.worldKnowledge.rooms[gameState.location.room] = {
        description: text.substring(0, 500),
        exits: exits
      };
    }
  }

  // Parse room description (text between room title and exits)
  const descMatch = text.match(/^[A-Z][^\n]+\n([\s\S]+?)\[?\s*Exits:/m);
  if (descMatch) {
    gameState.location.description = descMatch[1].trim();
  }

  // Detect NPCs/objects in room (lines starting with "A" or "An" or "The")
  const lines = text.split('\n');
  for (const line of lines) {
    const npcMatch = line.match(/^(A |An |The )([^,]+)/);
    if (npcMatch && gameState.location.room) {
      const npcName = npcMatch[2].trim();
      if (!gameState.worldKnowledge.rooms[gameState.location.room]) {
        gameState.worldKnowledge.rooms[gameState.location.room] = { description: '', exits: [] };
      }
      if (!gameState.worldKnowledge.rooms[gameState.location.room].npcs) {
        gameState.worldKnowledge.rooms[gameState.location.room].npcs = [];
      }
      if (!gameState.worldKnowledge.rooms[gameState.location.room].npcs.includes(npcName)) {
        gameState.worldKnowledge.rooms[gameState.location.room].npcs.push(npcName);
      }
    }
  }

  // Detect combat
  if (text.includes('fights with')) {
    gameState.combatActive = true;
  }
  if (text.includes('has fled!') || text.includes('stops following') || text.match(/\d+ experience/)) {
    gameState.combatActive = false;
  }

  gameState.outputBuffer.push(text);
}

async function connect() {
  return new Promise((resolve) => {
    try {
      log('Starting connection to ' + CONFIG.host + ':' + CONFIG.port);

      // Use Node.js net module
      mudClient = net.createConnection(CONFIG.port, CONFIG.host);
      receivedData = Buffer.alloc(0);
      let loginPhase = 0;
      let loginComplete = false;

      const loginTimeout = setTimeout(() => {
        log('Login timeout');
        if (!loginComplete) {
          loginComplete = true;
          try { mudClient.destroy(); } catch (e) {}
          resolve({ success: false, error: 'Login timeout' });
        }
      }, 15000);

      mudClient.on('connect', () => {
        isConnected = true;
        gameState.connected = true;
        log('Connected to MUD, starting login');
      });

      // Collect data from MUD
      mudClient.on('data', (buffer) => {
        receivedData = Buffer.concat([receivedData, buffer]);
        const text = stripTelnetSequences(buffer).toString();
        if (text.trim()) {
          log('MUD says: ' + text.substring(0, 100));
        }
      });

      // Simple login sequence
      const loginSequence = async () => {
        try {
          await new Promise(r => setTimeout(r, 1000));
          log('Sending name: ' + CONFIG.character);
          mudClient.write(CONFIG.character + '\r\n');

          await new Promise(r => setTimeout(r, 1500));
          log('Sending password');
          mudClient.write(CONFIG.password + '\r\n');

          await new Promise(r => setTimeout(r, 2000));

          clearTimeout(loginTimeout);
          loginComplete = true;
          log('Login complete');
          parseOutput(receivedData);
          saveState();
          resolve({ success: true, message: 'Connected and logged in' });

        } catch (err) {
          log(`Login error: ${err.message}`);
          if (!loginComplete) {
            loginComplete = true;
            resolve({ success: false, error: err.message });
          }
        }
      };

      mudClient.on('error', (err) => {
        log(`Connection error: ${err.message}`);
        isConnected = false;
        gameState.connected = false;
        if (!loginComplete) {
          loginComplete = true;
          resolve({ success: false, error: err.message });
        }
      });

      loginSequence();

    } catch (error) {
      isConnected = false;
      gameState.connected = false;
      log(`Connection error: ${error.message}`);
      resolve({ success: false, error: error.message });
    }
  });
}

async function disconnect() {
  try {
    if (mudClient) {
      mudClient.destroy();
      mudClient = null;
    }
    isConnected = false;
    gameState.connected = false;
    log('Disconnected from MUD');
    saveState();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function handleGoalCommand(args) {
  if (args[0] === 'set') {
    const name = args.slice(1).join(' ');
    gameState.goals.push({
      name,
      description: '',
      completed: false,
      createdAt: new Date().toISOString(),
      subGoals: []
    });
    saveState();
    return { success: true, message: `Goal added: ${name}` };
  } else if (args[0] === 'complete') {
    const goalIdx = parseInt(args[1]);
    if (gameState.goals[goalIdx]) {
      gameState.goals[goalIdx].completed = true;
      saveState();
      return { success: true, message: 'Goal marked complete' };
    }
  } else if (args[0] === 'list') {
    const list = gameState.goals.map((g, i) => `${i}: [${g.completed ? '✓' : ' '}] ${g.name}`).join('\n');
    return { success: true, message: list || 'No goals set' };
  }
  return { success: false, message: 'Unknown goal command' };
}

async function sendCommand(command) {
  if (!isConnected || !mudClient) {
    return { success: false, error: 'Not connected to MUD. Use connect first.' };
  }

  // Handle skill-specific commands
  if (command.startsWith('goal ')) {
    const args = command.substring(5).split(' ');
    const result = handleGoalCommand(args);
    savePlayerMarkdown();
    saveWorldMarkdown();
    return result;
  }

  return new Promise((resolve) => {
    try {
      gameState.outputBuffer = [];
      let buffer = '';
      let dataReceived = false;

      // Set up listener BEFORE sending command to avoid race condition
      const dataHandler = (chunk) => {
        const cleanText = stripTelnetSequences(chunk).toString();
        if (cleanText.trim() && !cleanText.includes('telnet: connect to address')) {
          dataReceived = true;
          buffer += cleanText;
          gameState.outputBuffer.push(cleanText);
          parseOutput(chunk);
          log('Data: ' + cleanText.substring(0, 60));
        }
      };

      mudClient.on('data', dataHandler);

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          mudClient.removeListener('data', dataHandler);

          // Always save after each command
          saveState();
          savePlayerMarkdown();
          saveWorldMarkdown();

          resolve({
            success: true,
            output: buffer || gameState.outputBuffer.join(''),
            state: {
              hp: gameState.character.hp,
              mana: gameState.character.mana,
              moves: gameState.character.moves,
              combatActive: gameState.combatActive
            }
          });
        }
      }, 1000);

      // Send command
      mudClient.write(command + '\r\n');

    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

function getStatus() {
  return {
    connected: gameState.connected,
    character: gameState.character,
    location: gameState.location,
    inventory: gameState.inventory,
    combatActive: gameState.combatActive,
    lastPrompt: gameState.lastPrompt
  };
}

// CLI Server (TCP instead of Unix sockets for Windows compatibility)
function startCliServer() {
  const server = net.createServer((socket) => {
    let request = '';

    socket.on('data', async (data) => {
      request = data.toString().trim();

      try {
        let response;

        if (request === 'status') {
          response = getStatus();
        } else if (request === 'connect') {
          response = await connect();
        } else if (request === 'disconnect') {
          response = await disconnect();
        } else if (request.startsWith('send:')) {
          const command = request.substring(5);
          response = await sendCommand(command);
        } else {
          response = { error: 'Unknown command' };
        }

        socket.write(JSON.stringify(response) + '\n');
      } catch (error) {
        socket.write(JSON.stringify({ error: error.message }) + '\n');
      } finally {
        socket.end();
      }
    });
  });

  server.listen(DAEMON_PORT, DAEMON_HOST, () => {
    log(`CLI server listening on ${DAEMON_HOST}:${DAEMON_PORT}`);
  });

  return server;
}

// Initialize
async function main() {
  loadState();

  try {
    startCliServer();
    log('MUD daemon started, listening on localhost:9999');
  } catch (error) {
    log(`Failed to start CLI server: ${error.message}`);
    process.exit(1);
  }

  // Keep alive
  setInterval(() => {
    if (isConnected && mudClient) {
      // Heartbeat to keep connection alive
    }
  }, 30000);
}

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  // Don't crash, just log and continue
});

main().catch(error => {
  log(`Fatal error: ${error.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log('SIGTERM received, shutting down');
  await disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('SIGINT received, shutting down');
  await disconnect();
  process.exit(0);
});
