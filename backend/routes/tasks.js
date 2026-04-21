const express  = require('express')
const router   = express.Router()
const taskCtrl = require('../controllers/taskController')
const auth     = require('../middleware/auth')

// All task routes are protected
router.use(auth)

router.get('/',              taskCtrl.getTasks)
router.get('/:id',           taskCtrl.getTaskById)
router.post('/',             taskCtrl.createTask)
router.put('/:id',           taskCtrl.updateTask)
router.patch('/:id/status',  taskCtrl.updateStatus)
router.delete('/:id',        taskCtrl.deleteTask)

module.exports = router