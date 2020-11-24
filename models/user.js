//This file describes the schema for the user collection

const mongoose = require('mongoose')
const Schema = mongoose.Schema

//When doing CRUD operations for a user object use the following fields along with _id
const userSchema = new Schema({
  type: String,
  approved: Boolean,
  email: String,
  password: String,
  displayName: String,
  friends: Array,
  friendRequests: Array
})

//Export this schema model for use in the index.js file
module.exports = mongoose.model('user', userSchema)