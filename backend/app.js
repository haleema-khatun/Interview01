const express = require('express');
const app = express();
const path = require('path');
require("dotenv").config();

const questionRouter = require('./routes/questions');
const db = require('./config/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs')


app.get('/', (req, res) => {
  res.send('working fine');
});

app.use('/questions', questionRouter);


app.listen(process.env.PORT);
