const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("give password as argument")
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://Reawake7704:${password}@cluster0.xffcckc.mongodb.net/puhelinluettelo?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model("Person", personSchema)

if (process.argv.length < 5) {
    console.log("phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
        
    })
} else {
    

    const personName = process.argv[3]
    const phoneNumber = process.argv[4]

    const person = new Person({
        name: personName,
        number: phoneNumber,
    })

    person.save().then(result => {
        console.log(`added ${personName} number ${phoneNumber} to phonebook`)
        mongoose.connection.close()
    })
}

