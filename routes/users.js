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
    var query = ("SELECT * FROM Users WHERE username = '" + req.body['username']+"'");
    DButilsAzure.execQuery(query)
        .then(function (results) {
            console.log(results.body);
            if (results.length > 0)
                if (results[0]['password'] === req.params['password']) {
                    const user = {
                        username: req.body['username'],
                        password: req.body['password']
                    };
                    jwt.sign({user}, 'secretkey', (err, token) => {
                        res.json({
                            token,
                            message : "Hello! "+results[0]['FirstName']
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

});
/*Handle favorites manipulation  */
router.route('/favorites')
    .get(function (req, res) {
        //TODO return the list of favorites from DB
    })
    .put(function (req, res) {
        //TODO Update the list of favorites for the user in DB
    });

router.post('/retrievepassword', function (req, res) {
    //TODO retrieve password function will send user information from
    // DB with question and answer
});
module.exports = router;
