var express = require('express');
var fs = require('fs');
var app = express();
var api = require('./routes/api');
var bodyParser = require('body-parser');

app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));


/*
 * To Do:
 *     Authentication- handled in mobile apps
 *     Database- PostGreSQL
 *     implement route middleware functions
 *     initialize database
*/

app.set('view engine', 'jade');

//route middleware

app.use('/api', api);


/*
404 errors
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//error handlers
app.use(function(err, req, res, next) {
  res.render('error', {message: err.status,
					   error: err});
});
*/

var listener = app.listen(3000, function(){
  console.log("Listening on port " + listener.address().port);
});
