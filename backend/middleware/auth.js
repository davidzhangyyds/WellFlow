const jwt = require('jsonwebtoken')
const pool = require('../config/db')

module.exports = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // 2. Verify JWT signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Check token is not revoked in DB
    const [rows] = await pool.execute(
      'SELECT session_id FROM session WHERE token = ? AND is_revoked = FALSE AND expires_at > NOW()',
      [token]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Token is invalid or expired' })
    }

    // 4. Attach user info to request
    req.user = { user_id: decoded.user_id }

    next()

  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}