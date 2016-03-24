var express = require('express');
var fs = require('fs');
var multer = require('multer');
app = express();
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));
var base_url = "localhost:3000/images/";
var numOfPhotos = 0;

var routes = require('./routes');

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

var upload = multer({storage:storage});

/*
 * To Do:
 *     Authentication- handled in mobile apps
 *     Database- PostGreSQL
 *     implement route middleware functions
 *     initialize database
*/

//route middleware
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/load_ten', routes.loadTen);
app.post('/api/uploadPhoto/:photoId', routes.uploadPhoto);
app.delete('/api/deletePhoto/:photoId', routes.deletePhoto);
app.put('/api/likePhoto/:photoId', routes.likePhoto);
app.put('/api/dislikePhoto/:photoId', routes.dislikePhoto);
app.get('api/loadOwn', routes.loadOwn);

//404 errors
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

app.listen(3000);
