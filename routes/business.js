var express = require('express');
var Operator = require('../controllers/business.js');
var router = express.Router();

router.post('/signup', Operator.signup);
router.post('/login', Operator.login);

module.exports = router
