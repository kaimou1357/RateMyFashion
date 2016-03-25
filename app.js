var express = require('express');
var fs = require('fs');
var multer = require('multer');
var bodyParser = require('body-parser');
app = express();
app.use(bodyParser.urlencoded({ extended: true }));
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
app.set('view engine', 'jade');
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/load_ten', routes.loadTen);
app.post('/api/upload_photo/:photo_id', routes.uploadPhoto);
app.delete('/api/delete_photo/:photo_id', routes.deletePhoto);
app.put('/api/like_photo/:photo_id', routes.likePhoto);
app.put('/api/dislike_photo/:photo_id', routes.dislikePhoto);
app.get('/api/load_own', routes.loadOwn);

//404 errors
// app.use(function (req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// //error handlers
// app.use(function(err, req, res, next) {
//   res.render('error', {message: err.status,
// 					   error: err});
// });

app.listen(3000);
