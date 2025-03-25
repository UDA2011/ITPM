// models/index.js
const mongoose = require("mongoose");
const uri = "mongodb+srv://factory:lvoH4YKfvhZbqaiA@uda.s6qeo.mongodb.net/";

function main() {
  return mongoose.connect(uri) 
    .then(() => {
      console.log("Successfully connected to MongoDB");
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
}

module.exports = { main };