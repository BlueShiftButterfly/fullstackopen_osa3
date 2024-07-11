require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const Person = require("./models/person")

const app = express()

app.use(express.static("dist"))
app.use(cors())
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"), "-",
        tokens["response-time"](req, res), "ms",
        tokens.method(req, res) === "POST" ? JSON.stringify(req.body) : ""
    ].join(" ")
}))

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

app.get("/api/persons", (request, response, next) => {
    Person.find({}).then(result => {
        response.json(result)
    })
        .catch(error => next(error))
})

app.get("/info", (request, response, next) => {
    Person.find({}).then(result => {
        response.send(
            `
            <p>Phonebook has info for ${result.length} people</p>
            <p>${GetCurrentDate()}</p>
            `
        )
    })
        .catch(error => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id).then(result => {
        if (result) {
            response.json(result)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true }).then(result => {
        if (result) {
            response.json(result)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})


app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(result => {
        response.json(result)
    })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" })
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
