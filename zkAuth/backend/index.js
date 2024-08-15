const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

const users = {}; // In-memory user storage for simplicity

// Helper function to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Registration endpoint
app.post('/register', (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const hashedPassword = hashPassword(password);
  users[username] = { hashedPassword };
  console.log(users);
  res.send('User registered successfully');
});

// Challenge generation endpoint
app.post('/challenge', (req, res) => {
  const { username } = req.body;
  if (!users[username]) {
    return res.status(404).send('User not found');
  }
  const challenge = crypto.randomBytes(32).toString('hex');
  users[username].challenge = challenge;
  res.json({ challenge });
});

// Proof verification endpoint
app.post('/verify', (req, res) => {
  const { username, proof } = req.body;
  const user = users[username];
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Verify the proof using the Schnorr protocol
  const { commitment, response } = proof;
  const g = crypto.createHash('sha256').update('generator').digest('hex');
  console.log("g: ",g);
  const h = user.hashedPassword;
  console.log("h: ",h);
  const challenge = user.challenge;
  console.log("challenge: ",challenge);


  const lhs = crypto.createHash('sha256').update(commitment + challenge).digest('hex');
  const rhs = crypto.createHash('sha256').update(g + h).digest('hex');


  if (commitment === rhs) {
    res.send('Authentication successful');
  } else {
    res.status(401).send('Authentication failed');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});