var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
    next();
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
    let query = "SELECT * FROM Poi";
    DButilsAzure.execQuery(query)
        .then(function (results){
            for( let i=0 ; i<results.length ; i++){
                let poi = {
                    PoiID : results[i]['PoiID'],
                    Name : results[i]['Name'],
                    WatchCount : results[i]['WatchCount'],
                    PoiDesc : results[i]['PoiDesc'],
                    TotalRank : results[i]['TotalRank'],
                    NumberOfRanks : results[i]['TotalRank'],
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
    //        [ReviewID]
    //       ,[PoiID]
    //       ,[Username]
    //       ,[Review]
    //       ,[ReviewDate]
    //       ,[ReviewRank]
    let PoiReview = {};
    jwt.verify(req.headers.token, 'secretkey' , (err,result)=>
    {
       PoiReview = {
           poiid : "'"+req.body.poiid+"'",
           username : "'"+result.user.username+"'",
           review : "'"+req.body.review+"'",
           date : "'"+req.body.date+"'",
           rank : "'"+req.body.rank+"'"
       };
       let query = "INSERT INTO Reviews VALUES ("+ Object.values(PoiReview).join()+
           ")";
       DButilsAzure.execQuery(query)
           .catch(function (err) {
              if (err)
                  res.status(403).send("error while adding review to DB: "+err.toString());
           });
       query = "UPDATE Poi SET TotalRank = (SELECT TotalRank FROM Poi Where Poiid " +
           "= "+PoiReview.poiid+" )+ "+PoiReview.rank +" WHERE PoiID = " +PoiReview.poiid+
           "UPDATE Poi SET NumberOfRanks = (SELECT NumberOfRanks FROM Poi Where PoiID = "+
           PoiReview.poiid+")+1 Where PoiID = "+PoiReview.poiid;
       DButilsAzure.execQuery(query)
           .catch(function (err){
               if(err)
                   res.status(403).send("error while updating the rank in poi table "+err.toString());
           });
       res.status(200).send("DONE");
    });
});
module.exports = router;