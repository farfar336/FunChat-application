//This file describes the schema for a message

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//When doing CRUD operations for a message object use the following fields along with _id
const messageSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: 'chat', },
  sender: { type: Schema.Types.ObjectId, ref: 'user', },
  time: Date,
  content: String,
  image: Buffer
});

//Export this schema model for use in the index.js file
module.exports = mongoose.model('message', messageSchema);