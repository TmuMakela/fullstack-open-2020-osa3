const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('data', (req) => {
  return req.data
})

function assignData(req, res, next) {
  req.data = JSON.stringify(req.body)
  next()
}

app.use(cors())
app.use(express.json())
app.use(assignData)
app.use([
  morgan('tiny', {
    skip: (req, _res) => {return req.method === 'POST'}
  }),
  morgan(':method :url :status :res[content-length] - :response-time ms :data', {
    skip: (req, _res) => {return req.method !== 'POST'}
  })
])

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/api/persons', (_req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  console.log(req.body)
  const person = req.body

  if (!person.name || !person.number) {
    return res.status(400).json({
      error: "name or number missing"
    })
  } else if (persons.some(p => p.name.toUpperCase() === person.name.toUpperCase())) {
    return res.status(400).json({
      error: "name must be unique"
    })
  }

  const randomId = Math.floor(Math.random() * 10000)
  person.id = randomId
  persons = persons.concat(person)
  res.json(person)
})

app.get('/info', (_req, res) => {
  const info = `<p>Phonebook has info for ${persons.length} people</p>`
  const datetime = `<p>${new Date().toString()}</p>`
  res.send(`${info} ${datetime}`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})