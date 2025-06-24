const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: String,
  difficulty: String,
  description: String,
  category: String,
  tags: [String],
});

module.exports = mongoose.model('question', questionSchema);


  
  
  
