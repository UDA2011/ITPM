const mongoose = require("mongoose");
const uri = "mongodb+srv://factory:lvoH4YKfvhZbqaiA@uda.s6qeo.mongodb.net/";



function main() {
    mongoose.connect(uri).then(() => {
        console.log("Succesfull yheee")
    
    }).catch((err) => {
        console.log("Error: ", err)
    })
}

module.exports = { main };