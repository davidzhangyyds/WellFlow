const bcrypt = require('bcrypt')
const pool   = require('../config/db')

// ── GET /api/user/profile ─────────────────────
exports.getProfile = async (req, res) => {
  try {
    const { user_id } = req.user

    const [users] = await pool.execute(
      'SELECT user_id, username, email, created_at FROM user WHERE user_id = ?',
      [user_id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(users[0]) // password_hash is never returned

  } catch (err) {
    console.error('GetProfile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── PUT /api/user/password ────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { user_id }             = req.user
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both passwords are required' })
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    // 1. Get current hash
    const [users] = await pool.execute(
      'SELECT password_hash FROM user WHERE user_id = ?',
      [user_id]
    )

    // 2. Verify current password
    const isMatch = await bcrypt.compare(current_password, users[0].password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // 3. Hash new password
    const new_hash = await bcrypt.hash(new_password, 12)

    // 4. Update password
    await pool.execute(
      'UPDATE user SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
      [new_hash, user_id]
    )

    // 5. Revoke all active sessions (force re-login everywhere)
    await pool.execute(
      'UPDATE session SET is_revoked = TRUE WHERE user_id = ?',
      [user_id]
    )

    res.status(200).json({ message: 'Password updated. Please log in again.' })

  } catch (err) {
    console.error('UpdatePassword error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}