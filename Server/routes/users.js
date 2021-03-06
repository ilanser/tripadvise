var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/*Handle Login */
router.post('/login', function (req, res) {
    //check if user in DB and connect him + return token
    console.log(req.body);
    let user = {};
    let other = {};

    //Login Without Token
    let query = "SELECT * FROM Users WHERE username = @username";
    let params = {
      username : req.body['username']
    };
    DButilsAzure.execQuery(query,params)
        .then(function (results) {
            console.log(results.body);
            if (results.length > 0)
                if (results[0]['password'] === req.params['password']) {
                    user.username = req.body.username;
                    user.password = req.body.password;
                    other.firstname = results[0]['FirstName'];
                    query = "SELECT interest FROM Interests WHERE username = @username";
                    DButilsAzure.execQuery(query,params)
                        .then(function (results) {
                            other.interests = "";
                            results.forEach(function (value) {
                                other.interests += (value.interest) + ",";
                            });
                            other.interests = other.interests.substr(0, other.interests.length - 1);
                            console.log(user);
                        })
                        .catch(function (err) {
                            console.log("Can't retrieve interests from DB: " + err.toString());
                        });
                    query = "SELECT PoiID FROM Favorites WHERE username = @username";
                    params = { username: req.body.username};
                    DButilsAzure.execQuery(query,params)
                        .then(function (results) {
                            if (results.length > 0) {
                                other.favorites = results[0]['PoiID'];
                            }
                            jwt.sign({user}, 'secretkey', (err, token) => {
                                console.log(other);
                                res.json({
                                    token,
                                    firstname: other.firstname,
                                    interests: other.interests,
                                    favorites: other.favorites
                                });
                            });
                        })
                        .catch(function (err) {
                            console.log("Could not find favorites: " + err.toString());
                        })

                }
        })
        .catch(function (err) {
            if (err)
                res.sendStatus(403);
        });
});


/*Handle Register */
router.post('/register', function (req, res) {
    let user = {
        username: req.body.username,
        password: req.body.password,
        secretquestion: req.body.secretquestion,
        secretanswer: req.body.secretanswer,
        firstname: req.body.firstname,
        lastname:req.body.lastname,
        email: req.body.email,
        country: req.body.country,
        city: req.body.city
    };
    let query = "INSERT INTO USERS VALUES (@username,@password,@secretquestion,@secretanswer," +
        "@firstname,@lastname,@email,@country,@city)";
    DButilsAzure.execQuery(query,user)
        .then(function (results) {
            console.log("username added to the DB");
            let interestlist = req.body.interests;
            console.log(interestlist);
            query = "INSERT INTO Interests VALUES ";
            interestlist.forEach(function (entry) {
                query = query + "(@username ,'" + entry + "'),";
            });
            let params = {
              username : user.username
            };
            query = query.substr(0, query.length - 1);
            console.log(query);
            DButilsAzure.execQuery(query,params)
                .then(function (results) {
                    console.log("added interests into DB");
                    res.status(200).json({
                        status: "success add user and interest to DB"
                    });

                })
                .catch(function (err) {
                    res.status(200).send({error: err.toString()}); //workaround
                });
        })
        .catch(function (err) {
            if (err)
                res.status(403).send({error: err.toString()});
        });

});
/*Handle favorites manipulation  */
router.route('/Favorites')
    .get(function (req, res) {
        let user = {};
        jwt.verify(req.headers.token, 'secretkey', (err, result) => {
            if (!err) {
                console.log(result);
                user.username = result.user.username;
                let query = "SELECT poiid from favorites where username = @username";
                let params = {
                  username : user.username
                };
                DButilsAzure.execQuery(query,params)
                    .then(function (results) {
                        res.json({
                            favorites: results[0]['poiid']
                        });
                    });
            }
            else
                res.json({error: err.toString()});
        });
    })
    .put(function (req, res) {
        let user = {
            "favorites": req.body.favorites
        };
        console.log(user);
        console.log(req.body);
        jwt.verify(req.headers.token, 'secretkey', (err, result) => {
            console.log(result);
            if (!err) {
                user.username = result.user.username;
                let query = "IF EXISTS (SELECT * FROM Favorites WHERE username = @username) " +
                    "BEGIN Update Favorites SET poiid = @favorites " +
                    "WHERE username = @username END ELSE BEGIN INSERT INTO Favorites VALUES (@username, @favorites) END";
                let params = {
                  username : user.username,
                  favorites : user.favorites
                };
                DButilsAzure.execQuery(query,params)
                    .then(function (results) {
                        console.log(results + " " + results.length);

                        res.status(200).send("Favorites updated");

                    })
                    .catch(function (err) {
                        res.status(403).send({error: err.toString()});
                    })
            }
            else
                res.json({
                    error: err.toString()
                });

        });

    });

router.route('/SuggestedPOI')
    .post(function(req,res){
   let query = "SELECT Poi.* " +
       "FROM Interests " +
       "INNER JOIN Poi ON Interests.Interest=Poi.Category WHERE Username=@username";
   let params = {
       username : req.body.username
   };
   DButilsAzure.execQuery(query,params)
       .then(function (results){
            res.status(200).send(results);
       })
       .catch(function(err){
           console.log("Error Fetching SuggestedPOI: "+err);
           res.status(403).send("Error Fetching SuggestedPOI: "+err);
       })
});

router.post('/retrievePassword', function (req, res) {
    let query = "SELECT secretquestion, secretanswer, password FROM " +
        "users where username = @username";
    let params = {
      username : req.body.username
    };
    DButilsAzure.execQuery(query,params)
        .then(function (results) {
            console.log(req.body.secretquestion+" ,"+req.body.secretanswer)
            if(req.body.secretquestion==results[0]['secretquestion']&&req.body.secretanswer==results[0]['secretanswer'])
            res.json({
                password: results[0]['password']
            });
            else
                res.json({password: "wrong question/answer"});
        })
        .catch(function (err) {
            res.status(403).send({error: err.toString()});
        })
});



module.exports = router;
