const WebSocket = require('ws');
const crypto = require('crypto');

const wss = new WebSocket.Server({ port: 8080 });

let clients = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    const { type, content, groupId, userId } = parsedMessage;

    switch (type) {
      case 'register':
        clients[userId] = ws;
        break;
      case 'message':
        if (groupId) {
          // Handle group message
          // Assuming we have a function getGroupMembers(groupId) that returns userIds
          const members = getGroupMembers(groupId);
          members.forEach(memberId => {
            if (clients[memberId]) {
              clients[memberId].send(JSON.stringify({ type: 'message', content }));
            }
          });
        } else {
          // Handle direct message
          const recipientWs = clients[content.recipientId];
          if (recipientWs) {
            recipientWs.send(JSON.stringify({ type: 'message', content }));
          }
        }
        break;
    }
  });

  ws.on('close', () => {
    // Handle client disconnection
    for (let userId in clients) {
      if (clients[userId] === ws) {
        delete clients[userId];
        break;
      }
    }
  });
});

function getGroupMembers(groupId) {
  // Mock function to return group members
  return ['user1', 'user2', 'user3'];
}

function encryptMessage(message, secretKey) {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptMessage(encryptedMessage, secretKey) {
  const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
  let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage
// const secretKey = 'mySecretKey';
// const originalMessage = 'Hello, World!';
// const encryptedMessage = encryptMessage(originalMessage, secretKey);
// const decryptedMessage = decryptMessage(encryptedMessage, secretKey);

// console.log('Original:', originalMessage);
// console.log('Encrypted:', encryptedMessage);
// console.log('Decrypted:', decryptedMessage);