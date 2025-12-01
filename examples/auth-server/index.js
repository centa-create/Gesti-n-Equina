require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret';

// Allow CORS from your frontend (adjust origin as needed)
app.use(cors({ origin: ['http://localhost:4200'], credentials: true }));

// In-memory users (for example only)
const users = [
  { username: 'admin', password: '1234', role: 'admin' },
  { username: 'empleado', password: 'abcd', role: 'empleado' },
  { username: 'visitante', password: '0000', role: 'visitante' }
];

// In-memory refresh token store
let refreshTokensStore = [];

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const payload = { username: user.username, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  refreshTokensStore.push(refreshToken);

  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // set true if using HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken, user: payload });
});

app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  if (!refreshTokensStore.includes(token)) return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const payload = { username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    res.json({ accessToken });
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  refreshTokensStore = refreshTokensStore.filter(t => t !== token);
  res.clearCookie('refreshToken');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({ user: { username: user.username, role: user.role } });
  });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
