#!/usr/bin/env node

const { Client } = require('discord.js');
const fetch = require('node-fetch');
const nacl = require('tweetnacl');

const BOT_TOKEN = process.env.BOT_TOKEN;

const PORT = process.env.PORT ?? '8080';
const PATH = process.env.URL ?? '';

const URL_BASE = 'https://discord.com/api/v10';

const client = new Client({ intents: [] });

function getKeys() {
  if(!process.env.PUBLIC_KEY || !process.env.SECRET_KEY) {
    return nacl.sign.keyPair();
  } else {
    return {
      publicKey: new Uint8Array(Buffer.from(process.env.PUBLIC_KEY, 'hex')),
      secretKey: new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'hex')),
    };
  }
}

const keys = getKeys();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Sending Interactions to http://localhost:${PORT}${PATH}`);
  console.log(`Public key: ${Buffer.from(keys.publicKey).toString('hex')}`);
  console.log(`Secret key: ${Buffer.from(keys.secretKey).toString('hex')}`);
});

client.ws.on('INTERACTION_CREATE', async(e) => {
  const timestamp = Buffer.from(`${Date.now() / 1000}`);
  const message = Buffer.from(JSON.stringify(e));
  const signature = nacl.sign.detached(Buffer.concat([timestamp, message]), keys.secretKey);
  const URL = `${URL_BASE}/interactions/${e.id}/${e.token}/callback`;

  try {
    const botResult = await fetch(`http://localhost:${PORT}${PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature-Ed25519': Buffer.from(signature).toString('hex'),
        'X-Signature-Timestamp': timestamp.toString(),
      },
      body: message.toString(),
    });

    const response = await botResult.text();

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
  } catch(e) {
    console.log(e);
    return;
  }
});

client.login(process.env.BOT_TOKEN);

