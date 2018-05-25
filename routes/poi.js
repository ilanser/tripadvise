var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/poidetails/:id',function(req,res){
   //TODO return all the information for the poi ID
    let ans = {};
    let askedID = req.params.id;
    let query = "SELECT * FROM Poi Where PoiID = '"+askedID+"'";
    DButilsAzure.execQuery(query)
        .then( function (results) {
            if (results.length > 0 ){
                ans = {
                    PoiID : results[0]['PoiID'],
                    Name : results[0]['Name'],
                    WatchCount : results[0]['WatchCount'],
                    PoiDesc : results[0]['PoiDesc'],
                    TotalRank : results[0]['TotalRank'],
                    NumberOfRanks : results[0]['NumberOfRanks'],
                    Category : results[0]['Category']
                };
                res.status(200).send(ans);
                query = "UPDATE Poi SET WatchCount = "+(ans.WatchCount+1) +"Where" +
                    " PoiID = "+ans.PoiID ;
                DButilsAzure.execQuery(query);
            }
        })
        .catch(function (err) {
           if (err)
               res.status(403).send("POI wasn't found: "+err.toString());
        });
});

router.get('/poidetails',function(req,res){
 //TODO return all the poi from DB
    //        [PoiID]
    //       ,[Name]
    //       ,[WatchCount]
    //       ,[PoiDesc]
    //       ,[TotalRank]
    //       ,[NumberOfRanks]
    //       ,[Category]
    let ans = [];
    let query = "SELECT * FROM Poi"
    DButilsAzure.execQuery(query)
        .then(function (results){
            for( let i=0 ; i<results.length ; i++){
                let poi = {
                    PoiID : results[i]['PoiID'],
                    Name : results[i]['Name'],
                    WatchCount : results[i]['WatchCount'],
                    PoiDesc : results[i]['PoiDesc'],
                    TotalRank : results[i]['TotalRank'],
                    NumberOfRanks : results[i]['NumberOfRanks'],
                    Category : results[i]['Category']
                };
                ans.push(poi);
            }
            res.status(200).send(ans);
        })
        .catch(function(err){
           if(err)
               res.status(403).send("Error while retrieving poi from DB: "+err.toString());
        });
});

router.get('/searchpoi',function(req,res){
   //TODO search function ( req.query['name']
    let poiname = req.query['name'].replace('_'," ");
    let ans = {};
    let query = "SELECT * FROM Poi Where Name = '"+poiname+"'";
    DButilsAzure.execQuery(query)
        .then ( function(results){
            if (results.length > 0 ){
                ans = {
                    PoiID : results[0]['PoiID'],
                    Name : results[0]['Name'],
                    WatchCount : results[0]['WatchCount'],
                    PoiDesc : results[0]['PoiDesc'],
                    TotalRank : results[0]['TotalRank'],
                    NumberOfRanks : results[0]['NumberOfRanks'],
                    Category : results[0]['Category']
                };
                res.status(200).send(ans);
                query = "UPDATE Poi SET WatchCount = "+(ans.WatchCount+1) +"Where" +
                    " PoiID = "+ans.PoiID ;
                DButilsAzure.execQuery(query);
            }
            else
                res.status(403).send("poi name was not found");
        })
        .catch(function (err) {
           if(err)
               res.status(403).send("Poi Wasn't found: "+err.toString());
        });
});

router.put('/review', function(req,res){
   //TODO add review for poi to DB

});
module.exports = router;