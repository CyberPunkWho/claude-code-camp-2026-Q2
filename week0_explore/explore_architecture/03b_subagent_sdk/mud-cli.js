#!/usr/bin/env node

const net = require('net');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const DAEMON_PORT = 9999;
const DAEMON_HOST = 'localhost';

async function ensureDaemon() {
  // Check if daemon is running by trying to connect
  const client = net.createConnection({ host: DAEMON_HOST, port: DAEMON_PORT });

  return new Promise((resolve) => {
    client.on('connect', () => {
      client.end();
      resolve(true);
    });

    client.on('error', () => {
      // Daemon not running, start it
      const daemon = spawn('node', [path.join(__dirname, 'mud-daemon.js')], {
        detached: true,
        stdio: 'ignore'
      });
      daemon.unref();

      // Wait for daemon to start
      setTimeout(() => resolve(false), 1000);
    });
  });
}

async function sendRequest(command) {
  await ensureDaemon();

  return new Promise((resolve, reject) => {
    const client = net.createConnection({ host: DAEMON_HOST, port: DAEMON_PORT });
    let response = '';

    client.on('data', (data) => {
      response += data.toString();
    });

    client.on('end', () => {
      try {
        resolve(JSON.parse(response));
      } catch {
        resolve({ error: 'Invalid response from daemon' });
      }
    });

    client.on('error', (error) => {
      reject(error);
    });

    client.write(command);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`Usage: mud-cli <command> [args]
Commands:
  connect              - Connect and log in to MUD
  disconnect           - Disconnect from MUD
  status               - Get game status
  goal set <name>      - Create a new goal
  goal list            - Show active goals
  goal complete <id>   - Mark goal as complete
  <command>            - Send a command to MUD`);
    process.exit(0);
  }

  try {
    let result;

    if (command === 'connect') {
      result = await sendRequest('connect');
    } else if (command === 'disconnect') {
      result = await sendRequest('disconnect');
    } else if (command === 'status') {
      result = await sendRequest('status');
    } else {
      // Treat as MUD command
      result = await sendRequest(`send:${command}`);
    }

    if (result.error) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    } else if (result.output) {
      console.log(result.output);
    } else if (result.connected !== undefined) {
      console.log(JSON.stringify(result, null, 2));
    } else if (result.message) {
      console.log(result.message);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
