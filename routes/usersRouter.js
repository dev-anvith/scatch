const express = require('express');
const router = express();

router.get('/', function(req, res){
    res.send("HEY OWNER");
})

module.exports = router;