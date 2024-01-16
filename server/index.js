const http = require('http');
const path = require('path');
const express = require('express');
const socketIo = require('socket.io');
const needle = require('needle');
const config = require('dotenv').config();

const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json()); // Tambahkan middleware express.json()

const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'));
});

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL =
  'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

const rules = [{ value: 'giveaway' }];

// Get stream rules
async function getRules() {
  const response = await needle('get', rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  console.log(response.body);
  return response.body;
}

// Set stream rules
async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  console.log(response.body);
  return response.body;
}

// Delete stream rules
async function deleteRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

function streamTweets(socket) {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  stream.on('data', (data) => {
    try {
      const jsonString = data.toString(); // Ubah data menjadi string
      const json = JSON.parse(jsonString);
      console.log(json);
      socket.emit('tweet', json);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Received data:', data.toString());
    }
  });

  return stream;
}

io.on('connection', async () => {
  console.log('Client connected...');

  let currentRules;

  try {
    //   Get all stream rules
    currentRules = await getRules();

    // Delete all stream rules
    await deleteRules(currentRules);

    // Set rules based on array above
    await setRules();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  const filteredStream = streamTweets(io);

  let timeout = 0;
  const maxTimeout = 60000; // Set timeout maksimal (misalnya, 60 detik)

  filteredStream.on('timeout', () => {
    // Reconnect on error
    console.warn('A connection error occurred. Reconnecting…');
    setTimeout(() => {
      timeout = Math.min(timeout + 1000, maxTimeout); // Tambahkan batasan waktu maksimal
      streamTweets(io);
    }, timeout);
  });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
