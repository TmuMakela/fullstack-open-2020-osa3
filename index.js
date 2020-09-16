require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('data', (req) => {
  return req.data
})

function assignData(req, res, next) {
  req.data = JSON.stringify(req.body)
  next()
}

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(assignData)
app.use([
  morgan('tiny', {
    skip: (req, res) => {return req.method === 'POST'}
  }),
  morgan(':method :url :status :res[content-length] - :response-time ms :data', {
    skip: (req, res) => {return req.method !== 'POST'}
  })
])

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => console.log("error:", error.message))
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(error => console.log("error:", error.message))
})

app.delete('/api/persons/:id', (req, res) => {
  Person.deleteOne({"_id": req.params.id})
    .then(err => res.status(204).end())
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({error: 'name missing'})
  } else if (!body.number) {
    return res.status(400).json({error: 'number missing'})
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => console.log("error:", error.message))
})

app.get('/info', async (req, res) => {
  const entries = await Person.find({}).then(persons => {return persons.length})
  const info = `<p>Phonebook has info for ${entries} people</p>`
  const datetime = `<p>${new Date().toString()}</p>`
  res.send(`${info} ${datetime}`)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})