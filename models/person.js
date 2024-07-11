const mongoose = require("mongoose")

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
.then(result => {
    console.log('connected to MongoDB') 
})
.catch((error) => {
    console.log('error connecting to MongoDB:', error.message) 
})

mongoose.set("strictQuery", false)

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [3, "must be at least 3 characters long"],
        required: [true, "must not be empty"] 
    },
    number: {
        type: String,
        validate: [
            {
                validator: function (v) {
                    let parts = v.split("-")
                    return (parts.length == 2)
                },
                message: "must consist of 2 sets of numbers separated by a dash (-)"
            },
            {
                validator: function (v) {
                    let parts = v.split("-")
                    if (parts.length != 2) return false
                    return (
                        parts[0].length >= 2 &&
                        parts[0].length <= 3
                    )
                },
                message: "first set of numbers must be 2-3 numbers long"
            },
        ],
        minlength: [8, "must be at least 8 characters long"],
        required: [true, "must not be empty"]
    },
})

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Person", personSchema);