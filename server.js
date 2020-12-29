const express = require('express');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require('http');
const mongoose = require('mongoose');
var business = require('./routes/business.js');
var invoice = require('./routes/invoice.js');
const fileUpload = require('express-fileupload');
const config=require('./helpers/config.js');

app.use(bodyParser.json({
    limit: "50mb"
}));


module.exports.secure = function(app) {
    var policy = {
      'default-src': [
          "'self'",
          "data:",
          "'unsafe-inline'",
          "'unsafe-eval'"
      ],
      'img-src': [
          "'self'",
          "data:",
          "www.google-analytics.com"
      ],
      'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "www.google-analytics.com"
      ]
    }

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        next()
    })

}

mongoose.Promise = global.Promise;
var url= config.mongoUrl;

mongoose.connect(url, {
    useNewUrlParser: true,
    useFindAndModify:false
}).then(() => {
    console.log("Successfully connected to the database "+config.mongoUrl);
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use(cors());

app.use(function(req, res, next) {
       res.header("Access-Control-Allow-Origin", "*");
       res.header('Access-Control-Allow-Credentials', true);
       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,authorization,accessToken");
       res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS');
       next();
   })

app.use(fileUpload({
      useTempFiles: false,
      tempFileDir: process.cwd(),
      preserveExtension:4,
      safeFileNames: true
    }));

app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



app.use('/business', business);
app.use('/invoice', invoice);


app.listen(config.port,() => console.log('App listening on port '+config.port));




module.exports = app;
