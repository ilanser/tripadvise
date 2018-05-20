var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*Handle Login */
router.post('/login', function(req,res){
 //TODO check if user in DB and connect him + return token
});

/*Handle Register */
router.post('/register', function(req,res){
   //TODO read the body and register the user and return response
});
/*Handle favorites manipulation  */
router.route('/favorites')
    .get(function(req,res){
    //TODO return the list of favorites from DB
    })
    .put(function(req,res){
    //TODO Update the list of favorites for the user in DB
    });

router.post('/retrievepassword',function(req,res){
    //TODO retrieve password function will send user information from
    // DB with question and answer
    });
module.exports = router;
