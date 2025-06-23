const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
  res.send("its working");
})

router.post('/add', (req, res) => {
  res.send("Received POST");
});

module.exports = router;