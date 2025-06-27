const questionModel = require('../models/questionModel');

module.exports.getQuestions = async (req, res) => {
  try {
    const questions = await questionModel.find();
    res.json(questions);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

module.exports.addQuestion = async (req, res) => {
  let { title, difficulty, description,category,tags } = req.body;
  try {
    const newQuestion = await questionModel.create({
      title,
      difficulty,
      description,
      category,
      tags
    })
    await newQuestion.save();
    res.redirect('/questions/admin');
  } catch (err) {
    res.status(500).send("Error saving question");
  }
};

module.exports.adminForm = async (req,res)=>{
  res.render('add-question');
}

