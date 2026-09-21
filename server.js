const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// In-memory active user sessions
const activeSessions = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cloudgame-auth', uptime: process.uptime() });
});

app.post('/api/auth/guest', (req, res) => {
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
  const token = 'tok_' + Math.random().toString(36).substring(2, 15);
  const user = {
    user_id: guestId,
    username: req.body.username || ('Player_' + guestId.slice(-4)),
    role: 'guest',
    token: token,
    created_at: new Date().toISOString()
  };
  activeSessions.set(token, user);
  res.json({ success: true, user, token });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  if (token && activeSessions.has(token)) {
    res.json({ success: true, user: activeSessions.get(token) });
  } else {
    res.json({
      success: true,
      user: {
        user_id: 'guest_default',
        username: 'GuestPlayer',
        role: 'guest'
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Auth Service] Listening on port ${PORT}`);
});
