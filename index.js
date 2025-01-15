const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

let sock;
let isReady = false;

function initializeSocket() {
  return new Promise(async (resolve) => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        console.log('Connection closed due to:', lastDisconnect?.error, 'Reason:', reason);

        if (reason === DisconnectReason.loggedOut) {
          console.log('Logged out. Please delete the session and rescan the QR code.');
          process.exit();
        } else {
          console.log('Reconnecting...');
          setTimeout(initializeSocket, 5000); // Retry after 5 seconds
        }
        isReady = false;
      } else if (connection === 'open') {
        console.log('WhatsApp connection opened!');
        isReady = true;

        resolve({ sock, isReady });
      }
    });

    sock.ev.on('creds.update', saveCreds); 
  });
};

module.exports = initializeSocket(); 