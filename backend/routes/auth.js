const express    = require('express')
const router     = express.Router()
const authCtrl   = require('../controllers/authController')
const authMiddle = require('../middleware/auth')

router.post('/register', authCtrl.register)
router.post('/login',    authCtrl.login)
router.post('/logout',   authMiddle, authCtrl.logout) // protected

module.exports = router