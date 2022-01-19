const fs = require('fs');

const { Client, Intents } = require('discord.js');
const fetch = require('node-fetch');
const nacl = require('tweetnacl');

const BOT_TOKEN = process.env.BOT_TOKEN;

const PORT = process.env.PORT ?? '8080';
const PATH = process.env.URL ?? '';

const URL_BASE = 'https://discord.com/api/v9';

const KEYFILE = process.argv[2];

const client = new Client({ intents: [] });

function getKeys(fileName) {
  if (fileName) {
    try {
      const file = fs.readFileSync(fileName);
      const savedKeys = JSON.parse(file);
      return {
        publicKey: new Uint8Array(Buffer.from(savedKeys.publicKey, 'hex')),
        secretKey: new Uint8Array(Buffer.from(savedKeys.secretKey, 'hex')),
      };
    } catch {
      console.log('Cannot read file, generating key...');
    }
  }
  const keyPair = nacl.sign.keyPair();
  if (fileName) {
    try {
      const savedKeys = {
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        secretKey: Buffer.from(keyPair.secretKey).toString('hex'),
      };
      fs.writeFileSync(fileName, JSON.stringify(savedKeys, null, 2));
    } catch {
      console.log('Cannot write keyfile.');
    }
  }
  return keyPair;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} with public key: ${Buffer.from(keys.publicKey).toString('hex')}`);
});

const keys = getKeys(KEYFILE);

client.ws.on('INTERACTION_CREATE', async(e) => {
  const timestamp = Buffer.from(`${Date.now()}`);
  const message = Buffer.from(JSON.stringify(e));
  const signature = nacl.sign.detached(Buffer.concat([timestamp, message]), keys.secretKey);
  try {
    const serverResult = await fetch(`http://localhost:${PORT}${PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature-Ed25519': Buffer.from(signature).toString('hex'),
        'X-Signature-Timestamp': timestamp.toString(),
      },
      body: message.toString(),
    });

    const URL = `${URL_BASE}/interactions/${e.id}/${e.token}/callback`;

    const response = await serverResult.text();
  } catch(e) {
    console.log(e);
    return;
  }

  const discordResult = await fetch(URL, {
    method: 'POST',
    body: response,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log(discordResult.status, await discordResult.text());

  if(discordResult.status >= 400) {
    console.log('Interaction Response body: ', response);
  }
});

client.login(process.env.BOT_TOKEN);

