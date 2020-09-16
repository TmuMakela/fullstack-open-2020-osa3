const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('Expected arguments: <password> or <password> <name> <number>')
  process.exit(1)
}

const password = process.argv[2]
const dbname = 'person-app'

const url =`mongodb+srv://fullstack:${password}@fullstack-open-2020.0qlol.mongodb.net/${dbname}?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// Log contents of phonebook from database
if (process.argv.length === 3) {
  Person.find({})
    .then(persons => {
      console.log('phonebook:')
      persons.forEach(p => console.log(`${p.name} ${p.number}`))
      mongoose.connection.close()
    })
    .catch(error => console.log('error:', error.message))
}
// Add person to phonebook database
else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save()
    .then(_result => {
      console.log(`${name} with number ${number} added to phonebook.`)
      mongoose.connection.close()
    })
    .catch(error => console.log('error:', error.message))
}
