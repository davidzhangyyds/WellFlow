require('dotenv').config()          // charge le .env en premier

const express = require('express')
const helmet  = require('helmet')
const cors    = require('cors')

const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')
const userRoutes = require('./routes/user')

const app = express()

app.get('/api/hello', (req, res) => {
  res.json({ text: "Salut depuis le backend !" });
});


// Middlewares globaux
app.use(helmet())                   // sécurité HTTP
app.use(cors({ origin: 'http://localhost:5173' }))  // autorise Vue.js
app.use(express.json())             // lit le JSON dans req.body

// Routes
app.use('/api/auth',  authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/user',  userRoutes)

// Démarrage
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`WellFlow server running on port ${PORT}`)
})