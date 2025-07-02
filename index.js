const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const { handleCommand } = require('./command');
const settings = require('./setting');

const app = express();
const port = process.env.PORT || 5000;

let qrCodeData = '';
let botStatus = 'Starting...';
let sockInstance = null;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });
    sockInstance = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, qr } = update;

        if (qr) {
            qrCodeData = await QRCode.toDataURL(qr);
            botStatus = 'QR Code Generated - Waiting for Scan';
        }

        if (connection === 'open') {
            botStatus = 'Connected ✅';
            qrCodeData = '';
            console.log('SENU MD BOT Connected');
        }

        if (connection === 'close') {
            botStatus = 'Disconnected ❌ - Restarting...';
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        await handleCommand(sock, msg);
    });
}
