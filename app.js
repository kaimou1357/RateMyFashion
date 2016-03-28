var express = require('express');
var fs = require('fs');
var multer = require('multer');
var bodyParser = require('body-parser');

var app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));

/*
var base_url = "localhost:3000/images/";
var numOfPhotos = 0;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
	cb(null, './images/');
  },
  filename: function (req, file, cb) {
	  var newPhoto = new Photo(base_url + numOfPhotos + ".jpg", 0 ,0, Math.floor(Math.random()*1000));
	  photoArray.push(newPhoto);
	  cb(null, numOfPhotos++ + ".jpg");
  }
});
*/


// var upload = multer({storage:storage});

/*
 * To Do:
 *     Authentication- handled in mobile apps
 *     Database- PostGreSQL
 *     implement route middleware functions
 *     initialize database
*/

app.set('view engine', 'jade');

//route middleware
var api = require('./routes/api');
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
