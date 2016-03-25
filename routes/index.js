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
  //increment likes in database
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