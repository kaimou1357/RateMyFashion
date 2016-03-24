var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

exports.loadTen = function(req, res, next) {
  //load ten random valid pictures
  console.log('loaded ten photos, not id ' + req.query.fbId);
}

exports.uploadPhoto = function(req, res, next) {
  //upload photo, associated with fb_id
  //create database row with next id
  var photoId = 0; //placeholder
  //fill in fbId, 0 likes, 0 dislikes
  console.log('uploaded photo ' + photoId + ' for fbId ' + req.body.fbId);
  //return JSON of photo object
}

exports.deletePhoto = function(req, res, next) {
  //delete a photo, photoId and fbId are passed
  console.log('deleted photo ' + req.params.photoId);
}

exports.likePhoto = function(req, res, next) {
  //request should take in parameters photo_id.
  //UPDATE HTTP request.
  //increment likes in database
  var results = [];
  var data = {photo_id:req.body.photo_id, complete:false};

  pg.connect(connectionString, function(err, client, done){
    if(err){
      done();
      console.log(err);
      return res.status(500).json({success:false, data: err});
    }
    client.query("UPDATE photos SET positiveRatings = positiveRatings + 1 WHERE photo_id = $1", [data.photo_id]);
  });

  query.on('end', function(){
    client.end();
  });

  console.log('liked photo ' + req.params.photoId);
}

exports.dislikePhoto = function(req, res, next) {
  //increment dislikes in database
  console.log('disliked photo ' + req.params.photoId);
}

exports.loadOwn = function(req, res, next) {
  //load the user's own photos
  console.log('loaded own photos, id ' + req.query.fbId);
}
