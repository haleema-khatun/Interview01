

const mongoose = require('mongoose');

require('dotenv').config();

console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('Mongo error:', err));
