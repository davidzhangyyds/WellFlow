const pool = require('../config/db')

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
    res.status(200).json(tasks)

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

    res.status(200).json(tasks[0])

  } catch (err) {
    console.error('GetTaskById error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── POST /api/tasks ───────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { user_id }  = req.user
    const { title, description, status, category_id, scheduled_time } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const validStatuses = ['todo', 'doing', 'done']
    const taskStatus = status && validStatuses.includes(status) ? status : 'todo'

    const [result] = await pool.execute(
      `INSERT INTO task (user_id, category_id, title, description, status, scheduled_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, category_id || null, title, description || null, taskStatus, scheduled_time || null]
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
    const { title, description, status, category_id, scheduled_time } = req.body

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

    await pool.execute(
      `UPDATE task
       SET title = ?, description = ?, status = ?, category_id = ?,
           scheduled_time = ?, updated_at = NOW()
       WHERE task_id = ? AND user_id = ?`,
      [title, description || null, status, category_id || null,
       scheduled_time || null, id, user_id]
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

    res.status(204).send()

  } catch (err) {
    console.error('DeleteTask error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}