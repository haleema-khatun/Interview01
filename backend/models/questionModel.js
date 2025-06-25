const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type:String,
    required:true,
  },
  difficulty: {
    type:String,
    required:true,
  },
  description: {
    type:String,
    required:true,
  },
  category: {
    type:String,
    required:true,
  },
  tags: {
    type:[String],
    default:[],
  },
});

module.exports = mongoose.model('question', questionSchema);


  
  
  
