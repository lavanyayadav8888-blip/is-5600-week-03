const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const app = express();
const port = process.env.PORT || 3000;

const chatEmitter = new EventEmitter();

// serve static files (CSS + chat.js)
app.use(express.static(__dirname + '/public'));


// =====================
// ROUTES / FUNCTIONS
// =====================

// serve chat UI
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

// JSON endpoint
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// echo endpoint
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// receive chat message
function respondChat(req, res) {
  const { message } = req.query;

  if (message) {
    chatEmitter.emit('message', message);
  }

  res.end();
}

// server-sent events (real-time)
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  const onMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  // cleanup when client disconnects
  req.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}


// =====================
// ENDPOINTS
// =====================

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);


// =====================
// START SERVER
// =====================

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});