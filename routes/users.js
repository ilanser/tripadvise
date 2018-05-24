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
    let user = {
        username: "",
        password: "",
        firstname: "",
        interests: "",
        favorites: ""
    };
    let query = ("SELECT * FROM Users WHERE username = '" + req.body['username']+"'");
    DButilsAzure.execQuery(query)
        .then(function (results) {
            console.log(results.body);
            if (results.length > 0)
                if (results[0]['password'] === req.params['password']) {
                    user.username = req.body.username;
                    user.password = req.body.password;
                    query = "SELECT interest FROM Interests WHERE username = '"+req.body.username+"'";
                    DButilsAzure.execQuery(query)
                        .then(function(results){
                            user.interests = results[0].join();
                        })
                    query = "SELECT PoiID FROM Favorites WHERE username = '"+user.username+"'";
                    DButilsAzure.execQuery(query)
                        .then(function(results){
                            user.favorites = results[0].join();
                        })
                    jwt.sign({user}, 'secretkey', (err, token) => {
                        res.json({
                            token,
                            firstname : user.firstname,
                            interests: user.interests,
                            favorites: user.favorites
                        });
                    });
                }
        })
        .catch(function (err) {
            if (err)
                res.sendStatus(403);
        });
});


/*Handle Register */
router.post('/register', function (req, res) {
    //TODO read the body and register the user and return response
    let user = {
      username: "'"+req.body.username+"'",
        password: "'"+req.body.password+"'",
        secrequestion: "'"+req.body.secrequestion+"'",
        secretanswer: "'"+req.body.secretanswer+"'",
        firstname: "'"+req.body.firstname+"'",
        lastname: "'"+req.body.lastname+"'",
        email: "'"+req.body.email+"'",
        country: "'"+req.body.country+"'",
        city: "'"+req.body.city+"'"
    };
    // TODO maybe do input validation testing
    let query = "INSERT INTO USERS VALUES ("+Object.values(user).join()+")";
    console.log(query);
    DButilsAzure.execQuery(query)
        .then(function(results){
            console.log("username added to the DB");
            let interestlist = req.body.interests.split(',');
            console.log(interestlist);
            query ="INSERT INTO Interests VALUES ";
            interestlist.forEach(function(entry){
                query = query + "("+ user.username+ ",'" + entry+ "')," ;
            })
            query= query.substr(0,query.length-1);
            console.log(query);
            DButilsAzure.execQuery(query)
                .then(function (results){
                    console.log("added interests into DB")
                    res.json({
                        status : "success add user and interest to DB"
                    });
                })
                .catch(function(err){
                    res.status(403).send({error: err.toString()});
                });
        })
        .catch(function(err){
           if(err)
               res.status(403).send({error: err.toString()});
        });

});
/*Handle favorites manipulation  */
router.route('/favorites')
    .get(function (req, res) {
        //TODO return the list of favorites from DB
        let user = {};
        jwt.verify(req.body.token,'secretkey',(err,result)=>
        {
            if(!err)
            user.username = result.username;
        });
        let query = "SELECT poiid from favorites where username = '"+user.username+"'";
        DButilsAzure.execQuery(query)
            .then(function(results){
                res.json({
                    favorites : results[0].join()
                });
            })
    })
    .put(function (req, res) {
        //TODO Update the list of favorites for the user in DB
        let user = {};
        jwt.verify(req.body.token,'secretkey',(err,result)=>
        {
           if(!err){
               user.username = result.username;
               user.favorites = result.favorites;
               let query = "UPDATE Favorites SET poiid = '"+user.favorites+"' " +
                   "WHERE username = '"+user.username+"'";
               DButilsAzure.execQuery(query)
                   .then(function(results){
                       res.status(200);
                   })
                   .catch(function (err) {
                       res.status(403).send({error: err.toString()});
                   })
           }

        });

    });

router.post('/retrievePassword', function (req, res) {
    //TODO retrieve password function will send user information from
    let query = "SELECT (secretquestion, secretanswer , password) FROM" +
        "users where username = '"+req.body.username+"'";
    DButilsAzure.execQuery(query)
        .then(function (results) {
            res.json({
                secretquestion: results[0]['secretquestion'],
                secretanswer: results[0]['secretanswer'],
                password : results[0]['password']
            });
        })
        .catch(function (err) {
            res.status(403).send({error  : err.toString()});
        })
});
module.exports = router;
