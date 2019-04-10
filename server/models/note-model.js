const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteModel = new Schema({
  id: { type: String, required: true },
  tags: { type: Array, required: true },
  title: { type: String, required: true }
});

module.exports = mongoose.model('notes', noteModel);
