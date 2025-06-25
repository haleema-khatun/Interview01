const express = require('express');
const router = express.Router();
const { getQuestions , addQuestion, adminForm } = require('../controllers/questionController');


router.get('/', getQuestions);

router.post('/add', addQuestion);

router.get('/admin',adminForm)

module.exports = router;