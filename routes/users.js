var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req,res){
 //TODO check if user in DB and connect him + return token
});

router.post('/register', function(req,res){
   //TODO read the body and register the user and return response
});

router.route('/favorites')
    .get(function(req,res){

    })
    .put(function(req,res){

    });

router.post('/retrievepassword',function(req,res){
    //TODO retrieve password function will send user information from
    // DB with question and answer
    });
module.exports = router;
