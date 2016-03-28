var express = require('express');
var fs = require('fs');
var app = express();
var api = require('./routes/api');
var bodyParser = require('body-parser');

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(__dirname + '/images'));
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

app.listen(app.get('port'), function() {
	console.log('App listening on port ' + app.get('port'));
});
