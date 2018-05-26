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
    let ans = {};
    let query = "SELECT * FROM Poi Where PoiID = @askedID";
    let params = {askedID : req.params.id};
    DButilsAzure.execQuery(query,params)
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
                query = "UPDATE Poi SET WatchCount = @watchcount Where" +
                    " PoiID = @poiID" ;
                params = {
                    watchcount : ans.WatchCount +1,
                    poiID : ans.PoiID
                };
                DButilsAzure.execQuery(query,params);
            }
        })
        .catch(function (err) {
           if (err)
               res.status(403).send("POI wasn't found: "+err.toString());
        });
});

router.get('/poidetails',function(req,res){
    //        [PoiID]
    //       ,[Name]
    //       ,[WatchCount]
    //       ,[PoiDesc]
    //       ,[TotalRank]
    //       ,[NumberOfRanks]
    //       ,[Category]
    let ans = [];
    let query = "SELECT * FROM Poi";
    DButilsAzure.execQuery(query,{})
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
    let poiname = req.query['name'].replace('_'," ");
    let ans = {};
    let query = "SELECT * FROM Poi Where Name = @poiName";
    let params = {poiName : poiname};
    DButilsAzure.execQuery(query,params)
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
                query = "UPDATE Poi SET WatchCount = @wachcount Where" +
                    " PoiID = @poiID" ;
                params = {
                  watchcount : ans.WatchCount+1,
                  poiID : ans.PoiID
                };
                DButilsAzure.execQuery(query,params);
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
           poiid : req.body.poiid,
           username : result.user.username,
           review : req.body.review,
           date : req.body.date,
           rank : req.body.rank
       };
       let query = "INSERT INTO Reviews VALUES (" +
           "@poiid,@username,@review,@date,@rank)";
       DButilsAzure.execQuery(query,PoiReview)
           .catch(function (err) {
              if (err)
                  res.status(403).send("error while adding review to DB: "+err.toString());
           });
       query = "UPDATE Poi SET TotalRank = (SELECT TotalRank FROM Poi Where Poiid " +
           "= @poiID )+ @rank WHERE PoiID = @poiID UPDATE Poi SET NumberOfRanks = (SELECT NumberOfRanks FROM Poi Where PoiID = @poiID)" +
           "+1 Where PoiID = @poiID";
       params = {
           poiID : PoiReview.poiid,
           rank : PoiReview.rank
       };
       DButilsAzure.execQuery(query,params)
           .catch(function (err){
               if(err)
                   res.status(403).send("error while updating the rank in poi table "+err.toString());
           });
       res.status(200).send("DONE");
    });
});
module.exports = router;