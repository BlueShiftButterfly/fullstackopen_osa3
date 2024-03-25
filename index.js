const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
    let postcontent = ""
    if (tokens.method(req, res) === "POST"){
        postcontent = JSON.stringify(req.body)
    }
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.method(req, res) === "POST" ? JSON.stringify(req.body) : ""
    ].join(' ')
}))

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345'
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-23-6423122'
    }
]

const dateOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZoneName: "longOffset",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h24",
    timeZone: "Europe/Helsinki"
}

const GetCurrentDate = () => {
    const currentDate = new Date()
    return (
        `${currentDate.toLocaleDateString("en",dateOptions)}`
    )
}

const GeneratePersonID = () => {
    return ( Math.floor(Math.random() * 1000000000) )
}

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(
        `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${GetCurrentDate()}</p>
        `
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
        return person.id === id
    })
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }
    if (persons.map(p => p.name).includes(body.name)) {
        return response.status(400).json({ 
            error: 'name is already present. name must be unique' 
        })
    }
    const person = request.body
    person.id = GeneratePersonID()
    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
