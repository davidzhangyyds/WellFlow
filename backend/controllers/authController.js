const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const pool   = require('../config/db')

const SALT_ROUNDS = 12

// ── POST /api/auth/register ───────────────────
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // 1. Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    // 2. Check if email already exists
    const [existing] = await pool.execute(
      'SELECT user_id FROM user WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    // 3. Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    // 4. Insert user
    const [result] = await pool.execute(
      'INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    )

    res.status(201).json({
      message: 'Account created successfully',
      user_id: result.insertId
    })

  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── POST /api/auth/login ──────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // 2. Find user by email
    const [users] = await pool.execute(
      'SELECT user_id, username, email, password_hash FROM user WHERE email = ?',
      [email]
    )
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = users[0]

    // 3. Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // 5. Calculate expiry date
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // 6. Store session in DB
    await pool.execute(
      'INSERT INTO session (user_id, token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [
        user.user_id,
        token,
        expires_at,
        req.ip,
        req.headers['user-agent'] || null
      ]
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id:  user.user_id,
        username: user.username,
        email:    user.email
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── POST /api/auth/logout ─────────────────────
exports.logout = async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1]

    // Revoke token in DB
    await pool.execute(
      'UPDATE session SET is_revoked = TRUE WHERE token = ?',
      [token]
    )

    res.status(200).json({ message: 'Logged out successfully' })

  } catch (err) {
    console.error('Logout error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}