const fs = require('fs');
const path = require('path');
const net = require('net');

const CONFIG = {
  host: 'localhost',
  port: 4000,
  character: 'dummy',    // Character name
  password: 'helloworld', // Character password
  timeout: 10000
};

const STATE_DIR = path.join(__dirname, '.mud-state');
const STATE_FILE = path.join(STATE_DIR, 'game-state.json');
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
let isConnected = false;
let receivedData = Buffer.alloc(0);

let gameState = {
  connected: false,
  character: { name: '', level: 0, hp: 0, mana: 0, moves: 0 },
  location: { room: '', description: '' },
  inventory: [],
  combatActive: false,
  lastPrompt: '',
  outputBuffer: [],
  map: {}
};

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
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

  // Parse character prompt (HP/Mana/Moves)
  const promptMatch = text.match(/\[(\d+)\/(\d+)H \s*(\d+)\/(\d+)M \s*(\d+)V\]/);
  if (promptMatch) {
    gameState.character.hp = parseInt(promptMatch[1]);
    gameState.character.mana = parseInt(promptMatch[3]);
    gameState.character.moves = parseInt(promptMatch[5]);
    gameState.lastPrompt = promptMatch[0];
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
      mudClient = net.createConnection(CONFIG.port, CONFIG.host);
      receivedData = Buffer.alloc(0);

      let loginPhase = 0;
      let loginTimeout;
      let nameAttempts = 0;

      mudClient.on('connect', () => {
        isConnected = true;
        gameState.connected = true;
        log('Connected to MUD server');

        loginTimeout = setTimeout(() => {
          log('Login timeout');
          if (loginPhase < 4) {
            clearTimeout(loginTimeout);
            mudClient.end();
            resolve({ success: false, error: 'Login timeout' });
          }
        }, 12000);
      });

      const onData = (buffer) => {
        // Handle telnet negotiations
        const responses = handleTelnetNegotiation(buffer);
        responses.forEach(resp => {
          try {
            mudClient.write(resp);
          } catch (e) {}
        });

        receivedData = Buffer.concat([receivedData, buffer]);
      };

      // Separate handler for login timing
      const loginSequence = async () => {
        try {
          // Wait for welcome
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (loginPhase === 0) {
            loginPhase = 1;
            log('Sending character name: ' + CONFIG.character);
            mudClient.write(CONFIG.character + '\r\n');
          }

          // Wait for response after name
          await new Promise(resolve => setTimeout(resolve, 1500));

          const dataStr = receivedData.toString().toLowerCase();

          if (dataStr.includes('password')) {
            // Character exists, just send password
            log('Sending password');
            loginPhase = 3;
            mudClient.write(CONFIG.password + '\r\n');
          } else {
            // Might need confirmation first
            log('Sending confirmation Y');
            loginPhase = 2;
            mudClient.write('Y\r\n');

            // Wait then send password
            await new Promise(resolve => setTimeout(resolve, 1000));
            log('Sending password after confirmation');
            loginPhase = 3;
            mudClient.write(CONFIG.password + '\r\n');
          }

          // Wait for game to respond
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check for pending prompts
          const finalData = receivedData.toString().toLowerCase();
          if (finalData.includes('retype password')) {
            log('Handling password retype');
            mudClient.write(CONFIG.password + '\r\n');
            await new Promise(resolve => setTimeout(resolve, 500));
          } else if ((finalData.includes('yes') || finalData.includes('no')) && finalData.includes('?')) {
            log('Clearing pending Y/N prompt');
            mudClient.write('Y\r\n');
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          clearTimeout(loginTimeout);
          log('Login sequence complete');
          loginPhase = 4;

          parseOutput(stripTelnetSequences(receivedData));
          saveState();

          mudClient.removeListener('data', onData);
          mudClient.on('data', handleGameData);

          resolve({ success: true, message: 'Connected and logged in' });

        } catch (error) {
          log(`Login sequence error: ${error.message}`);
          resolve({ success: false, error: error.message });
        }
      };

      mudClient.on('data', onData);

      // Start login sequence after connection
      loginSequence().catch(err => {
        log(`Login failed: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      const handleGameData = (buffer) => {
        const responses = handleTelnetNegotiation(buffer);
        responses.forEach(resp => {
          try {
            mudClient.write(resp);
          } catch (e) {
            log(`Error sending telnet response: ${e.message}`);
          }
        });

        const cleanText = stripTelnetSequences(buffer).toLowerCase();

        // Handle password retype prompt
        if (cleanText.includes('retype') || (cleanText.includes('password') && cleanText.includes(':') && !cleanText.includes('character'))) {
          log('Auto-answering password retype');
          mudClient.write(CONFIG.password + '\r\n');
          return;
        }

        // Handle any Y/N confirmation automatically
        if ((cleanText.includes('yes') || cleanText.includes('no')) && cleanText.includes('?')) {
          log('Auto-confirming Y/N prompt');
          mudClient.write('Y\r\n');
          return;
        }

        // Handle character creation prompts automatically
        if (cleanText.includes('sex') && (cleanText.includes('m/f') || cleanText.includes('male/female'))) {
          log('Auto-answering sex prompt: M');
          mudClient.write('M\r\n');
          return;
        } else if (cleanText.includes('class')) {
          log('Auto-answering class prompt: WARRIOR');
          mudClient.write('WARRIOR\r\n');
          return;
        } else if (cleanText.includes('race')) {
          log('Auto-answering race prompt: HUMAN');
          mudClient.write('HUMAN\r\n');
          return;
        } else if (cleanText.includes('alignment')) {
          log('Auto-answering alignment prompt: NEUTRAL');
          mudClient.write('NEUTRAL\r\n');
          return;
        }

        // Parse regular game output
        parseOutput(stripTelnetSequences(buffer));
      };

      mudClient.on('data', onData);

      mudClient.on('error', (err) => {
        clearTimeout(loginTimeout);
        isConnected = false;
        gameState.connected = false;
        log(`MUD connection error: ${err.message}`);
        if (loginPhase < 4) {
          resolve({ success: false, error: err.message });
        }
      });

      mudClient.on('end', () => {
        isConnected = false;
        gameState.connected = false;
        log('MUD connection closed');
      });

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
      await mudClient.end();
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

async function sendCommand(command) {
  if (!isConnected || !mudClient) {
    return { success: false, error: 'Not connected to MUD. Use connect first.' };
  }

  return new Promise((resolve) => {
    try {
      gameState.outputBuffer = [];

      // Set up a one-time listener for the response
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          saveState();
          resolve({
            success: true,
            output: gameState.outputBuffer.join(''),
            state: {
              hp: gameState.character.hp,
              mana: gameState.character.mana,
              moves: gameState.character.moves,
              combatActive: gameState.combatActive
            }
          });
        }
      }, 400);

      // Send the command
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
