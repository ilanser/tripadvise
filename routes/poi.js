var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('poidetails/:id',function(req,res){
   //TODO return all the information for the poi ID
});

router.get('poidetails',function(req,res){
 //TODO return all the poi from DB
});

router.get('searchpoi',function(req,res){
   //TODO search function ( req.query['name']

});

router.put('review', function(req,res){
   //TODO add review for poi to DB
});
module.exports = router;