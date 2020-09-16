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
    skip: (req, _res) => { return req.method === 'POST' }
  }),
  morgan(':method :url :status :res[content-length] - :response-time ms :data', {
    skip: (req, _res) => { return req.method !== 'POST' }
  })
])

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.deleteOne({ '_id': req.params.id })
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({ error: 'name missing' })
  } else if (!body.number) {
    return res.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  const query = { '_id': req.params.id }
  const update = { number: person.number }
  const options = { new: true }
  Person.findOneAndUpdate(query, update, options)
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', async (req, res, next) => {
  const entries = await Person.find({})
    .then(persons => {return persons.length})
    .catch(error => next(error))

  const info = `<p>Phonebook has info for ${entries} people</p>`
  const datetime = `<p>${new Date().toString()}</p>`
  res.send(`${info} ${datetime}`)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})