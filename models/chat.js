//This file describes the schema for the chat collection

const mongoose = require('mongoose')
const Schema = mongoose.Schema

//When doing CRUD operations for a chat object use the following fields along with _id
const chatSchema = new Schema({
  approved: Boolean,
  name: String,
  participants: Array,
  mods: Array
})

//Export this schema model for use in the index.js file
module.exports = mongoose.model('chat', chatSchema)