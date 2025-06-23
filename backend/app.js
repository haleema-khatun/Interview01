const express = require('express');
const app = express();

require("dotenv").config();

const questionRouter = require('./routes/questions');
const db = require('./config/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('working fine');
});

app.use('/questions', questionRouter);

app.listen(process.env.PORT);
