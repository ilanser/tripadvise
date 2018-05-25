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
    let query = ("SELECT * FROM Users WHERE username = '" + req.body['username'] + "'");
    DButilsAzure.execQuery(query)
        .then(function (results) {
            console.log(results.body);
            if (results.length > 0)
                if (results[0]['password'] === req.params['password']) {
                    user.username = req.body.username;
                    user.password = req.body.password;
                    other.firstname = results[0]['FirstName'];
                    query = "SELECT interest FROM Interests WHERE username = '" + req.body.username + "'";
                    DButilsAzure.execQuery(query)
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
                    query = "SELECT PoiID FROM Favorites WHERE username = '" + user.username + "'";
                    DButilsAzure.execQuery(query)
                        .then(function (results) {
                            if (results.length > 0) {
                                other.favorites = "";
                                results.forEach(function (value) {
                                    other.favorites += (value.poiid) + ",";
                                });
                                other.favorites = other.favorites.substr(0, other.favorites.length - 1);

                            }

                            jwt.sign({user}, 'secretkey', (err, token) => {
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
        username: "'" + req.body.username + "'",
        password: "'" + req.body.password + "'",
        secrequestion: "'" + req.body.secrequestion + "'",
        secretanswer: "'" + req.body.secretanswer + "'",
        firstname: "'" + req.body.firstname + "'",
        lastname: "'" + req.body.lastname + "'",
        email: "'" + req.body.email + "'",
        country: "'" + req.body.country + "'",
        city: "'" + req.body.city + "'"
    };
    // TODO maybe do input validation testing
    let query = "INSERT INTO USERS VALUES (" + Object.values(user).join() + ")";
    console.log(query);
    DButilsAzure.execQuery(query)
        .then(function (results) {
            console.log("username added to the DB");
            let interestlist = req.body.interests.split(',');
            console.log(interestlist);
            query = "INSERT INTO Interests VALUES ";
            interestlist.forEach(function (entry) {
                query = query + "(" + user.username + ",'" + entry + "'),";
            })
            query = query.substr(0, query.length - 1);
            console.log(query);
            DButilsAzure.execQuery(query)
                .then(function (results) {
                    console.log("added interests into DB")
                    res.json({
                        status: "success add user and interest to DB"
                    });
                })
                .catch(function (err) {
                    res.status(403).send({error: err.toString()});
                });
        })
        .catch(function (err) {
            if (err)
                res.status(403).send({error: err.toString()});
        });

});
/*Handle favorites manipulation  */
router.route('/favorites')
    .get(function (req, res) {
        //TODO return the list of favorites from DB
        let user = {};
        jwt.verify(req.headers.token, 'secretkey', (err, result) => {
            if (!err) {
                console.log(result);
                user.username = result.user.username;
                let query = "SELECT poiid from favorites where username = '" + user.username + "'";
                DButilsAzure.execQuery(query)
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
        //TODO Update the list of favorites for the user in DB
        let user = {};
        jwt.verify(req.headers.token, 'secretkey', (err, result) => {
            console.log(result);
            if (!err) {
                user.username = result.user.username;
                user.favorites = req.body.favorites;
                let query = "IF EXISTS (SELECT * FROM Favorites WHERE username = '" + user.username + "') " +
                    "BEGIN Update Favorites SET poiid = '" + user.favorites + "' " +
                    "WHERE username = '" + user['username'] + "' END ELSE BEGIN INSERT INTO Favorites VALUES ('" + user['username'] +
                    "', '" + user.favorites + "') END";
                console.log(query)
                DButilsAzure.execQuery(query)
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

router.post('/retrievePassword', function (req, res) {
    let query = "SELECT secretquestion, secretanswer, password FROM " +
        "users where username = '" + req.body.username + "'";
    DButilsAzure.execQuery(query)
        .then(function (results) {
            res.json({
                secretquestion: results[0]['secretquestion'],
                secretanswer: results[0]['secretanswer'],
                password: results[0]['password']
            });
        })
        .catch(function (err) {
            res.status(403).send({error: err.toString()});
        })
});
module.exports = router;
