const express  = require('express')
const router   = express.Router()
const userCtrl = require('../controllers/userController')
const auth     = require('../middleware/auth')

router.use(auth)

router.get('/profile',   userCtrl.getProfile)
router.put('/password',  userCtrl.updatePassword)

module.exports = router