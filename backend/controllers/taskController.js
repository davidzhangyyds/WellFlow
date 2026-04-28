const pool = require('../config/db')

// Format DATETIME to MySQL format string for JSON serialization
function formatDateTime(date) {
  if (!date) return null
  if (typeof date === 'string') return date
  // If it's a Date object from MySQL, convert to YYYY-MM-DD HH:MM:SS format
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Map category_id to category name for frontend display
function idToCategoryName(categoryId) {
  const categoryMap = {
    1: 'sport',
    2: 'mental',
    3: 'hydration',
    4: 'sleep',
    5: 'nutrition',
    6: 'break',
  }
  return categoryMap[categoryId] || null
}

// ── GET /api/tasks ────────────────────────────
exports.getTasks = async (req, res) => {
  try {
    const { user_id } = req.user
    const { status, category_id } = req.query

    let query  = 'SELECT * FROM task WHERE user_id = ?'
    let params = [user_id]

    if (status) {
      query  += ' AND status = ?'
      params.push(status)
    }
    if (category_id) {
      query  += ' AND category_id = ?'
      params.push(category_id)
    }

    query += ' ORDER BY created_at DESC'

    const [tasks] = await pool.execute(query, params)
    // Format datetime fields and add category name for JSON serialization
    const formattedTasks = tasks.map(t => ({
      ...t,
      category: idToCategoryName(t.category_id),
      scheduled_time: formatDateTime(t.scheduled_time),
      created_at: formatDateTime(t.created_at),
      updated_at: formatDateTime(t.updated_at)
    }))
    res.status(200).json(formattedTasks)

  } catch (err) {
    console.error('GetTasks error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── GET /api/tasks/:id ────────────────────────
exports.getTaskById = async (req, res) => {
  try {
    const { user_id } = req.user
    const { id }      = req.params

    const [tasks] = await pool.execute(
      'SELECT * FROM task WHERE task_id = ? AND user_id = ?',
      [id, user_id]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = tasks[0]
    // Format datetime fields and add category name for JSON serialization
    const formattedTask = {
      ...task,
      category: idToCategoryName(task.category_id),
      scheduled_time: formatDateTime(task.scheduled_time),
      created_at: formatDateTime(task.created_at),
      updated_at: formatDateTime(task.updated_at)
    }

    res.status(200).json(formattedTask)

  } catch (err) {
    console.error('GetTaskById error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── POST /api/tasks ───────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { user_id }  = req.user
    const { title, description, status, category_id, category, scheduled_time } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const validStatuses = ['todo', 'doing', 'done']
    const taskStatus = status && validStatuses.includes(status) ? status : 'todo'

    // Resolve category_id from category name if provided
    let finalCategoryId = category_id
    if (category && !category_id) {
      // Map category name to ID (case-insensitive)
      const categoryMap = {
        'sport': 1,
        'mental': 2,
        'hydration': 3,
        'sleep': 4,
        'nutrition': 5,
        'break': 6,
      }
      finalCategoryId = categoryMap[category.toLowerCase()] || null
    }

    // Convert time format "HH:MM" to DATETIME if provided
    let scheduledDateTime = null
    if (scheduled_time) {
      // Use local date (not UTC) to match the user's timezone
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`
      scheduledDateTime = `${today} ${scheduled_time}:00`
    }

    const [result] = await pool.execute(
      `INSERT INTO task (user_id, category_id, title, description, status, scheduled_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, finalCategoryId || null, title, description || null, taskStatus, scheduledDateTime]
    )

    res.status(201).json({
      message: 'Task created',
      task_id: result.insertId
    })

  } catch (err) {
    console.error('CreateTask error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── PUT /api/tasks/:id ────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const { user_id } = req.user
    const { id }      = req.params
    const { title, description, status, category_id, category, scheduled_time } = req.body

    // Verify ownership
    const [existing] = await pool.execute(
      'SELECT task_id FROM task WHERE task_id = ? AND user_id = ?',
      [id, user_id]
    )
    if (existing.length === 0) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const validStatuses = ['todo', 'doing', 'done']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    // Resolve category_id from category name if provided
    let finalCategoryId = category_id
    if (category && !category_id) {
      // Map category name to ID (case-insensitive)
      const categoryMap = {
        'sport': 1,
        'mental': 2,
        'hydration': 3,
        'sleep': 4,
        'nutrition': 5,
        'break': 6,
      }
      finalCategoryId = categoryMap[category.toLowerCase()] || null
    }

    // Convert time format "HH:MM" to DATETIME if provided
    let scheduledDateTime = null
    if (scheduled_time && scheduled_time.includes(':')) {
      // Use local date (not UTC) to match the user's timezone
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`
      scheduledDateTime = `${today} ${scheduled_time}:00`
    } else if (scheduled_time) {
      scheduledDateTime = scheduled_time
    }

    await pool.execute(
      `UPDATE task
       SET title = ?, description = ?, status = ?, category_id = ?,
           scheduled_time = ?, updated_at = NOW()
       WHERE task_id = ? AND user_id = ?`,
      [title, description || null, status, finalCategoryId || null,
       scheduledDateTime, id, user_id]
    )

    res.status(200).json({ message: 'Task updated' })

  } catch (err) {
    console.error('UpdateTask error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── PATCH /api/tasks/:id/status ───────────────
exports.updateStatus = async (req, res) => {
  try {
    const { user_id } = req.user
    const { id }      = req.params
    const { status }  = req.body

    const validStatuses = ['todo', 'doing', 'done']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be: todo, doing or done' })
    }

    const [result] = await pool.execute(
      'UPDATE task SET status = ?, updated_at = NOW() WHERE task_id = ? AND user_id = ?',
      [status, id, user_id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.status(200).json({ message: 'Status updated', status })

  } catch (err) {
    console.error('UpdateStatus error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── DELETE /api/tasks/:id ─────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const { user_id } = req.user
    const { id }      = req.params

    const [result] = await pool.execute(
      'DELETE FROM task WHERE task_id = ? AND user_id = ?',
      [id, user_id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.status(200).json({ message: 'Task deleted successfully' })

  } catch (err) {
    console.error('DeleteTask error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}