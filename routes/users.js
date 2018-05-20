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
    //TODO check if user in DB and connect him + return token
    var query = ("SELECT * FROM USERS WHERE USERNAME = " + req.params['username']);
    DBUtils.execQuery(query)
        .then(function (results) {
            if (results.length > 0)
                if (results[0]['password'] === req.params['password']) {
                    const user = {
                        username: req.params['username'],
                        password: req.params['password']
                    };
                    jwt.sign({user}, 'secretkey', (err, token) => {
                        res.json({
                            token
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
