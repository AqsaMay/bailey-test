const express = require('express');
const initializeSocket = require('./index'); // Assuming your bailey initialization is in a separate file

let sock;
initializeSocket.then(({ sock: initializedSock }) => {
  sock = initializedSock;
});

const app = express();
//const PORT = 3000;
const PORT = 80;

// Endpoint to send a message using query parameters
app.get('/send-message', async (req, res) => {
  const { number, message } = req.query;

  if (!number || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Both number and message parameters are required.',
    });
  }

  if (!sock || !sock.sendMessage) {
    return res.status(500).json({
      status: 'error',
      message: 'WhatsApp socket is not ready. Please try again later.',
    });
  }

  try {
    const jid = `${number}@s.whatsapp.net`; // Format the number for WhatsApp
    await sock.sendMessage(jid, { text: message });

    res.json({
      status: 'success',
      message: `Message sent to ${number}`,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
