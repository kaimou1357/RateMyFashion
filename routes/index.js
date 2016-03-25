var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var returnJSON = function(client, done, res) {
	var query = client.query("SELECT photo_id, positive_ratings, negative_ratings, owner_id, file_url FROM photos;");

	query.on('row', function(row){
		result = row;
	});

	query.on('end', function(){
		done();
		return res.json(result);
	});
}

exports.loadTen = function(req, res, next) {
	//load ten random valid pictures
	console.log('loaded ten photos, not id ' + req.query.fbId);
}

exports.uploadPhoto = function(req, res, next) {
	//upload photo, associated with fb_id
	//create database row with next id
	//fill in fbId, 0 likes, 0 dislikes
	console.log('uploaded photo ' + photoId + ' for fbId ' + req.body.fbId);
	//return JSON of photo object

	var ownerId = req.body.ownerId;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("INSERT INTO photos (positive_ratings, negative_ratings, owner_id) VALUES (0, 0, $1) RETURNING photo_id", [ownerId]);

		query.on('row', function(row) {
			client.query("UPDATE photos SET file_url = '/static/photos/$1'", row.photo_id);
		});

		query.on('end', function() {
			returnJSON(client, done, res);
		})
	});
}

exports.deletePhoto = function(req, res, next) {
	//delete a photo, photoId and fbId are passed
	console.log('deleted photo ' + req.params.photoId);
}

/**
This function will increment one to the positive rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.likePhoto = function(req, res, next) {
	var result;
	var photoId = req.params.photoId;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}
		client.query("UPDATE photos SET positive_ratings = positive_ratings + 1 WHERE photo_id = ($1)", [photoId]);

		returnJSON(client, done, res);

	});
}

/**
This function will increment one to the negative rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.dislikePhoto = function(req, res, next) {

	var result;
	var photoId = req.params.photoId;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}
		client.query("UPDATE photos SET negative_ratings = negative_ratings + 1 WHERE photo_id = ($1);", [photoId]);

		returnJSON(client, done, res);
	});

}

/**
This function will return an JSON array that represents all the photos that belong to a certain fb_id
*/
exports.loadOwn = function(req, res, next) {
	var result = [];
	var userId = req.query.fb_id;

	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("SELECT * FROM photos WHERE owner_id = $1;", [userId]);

		query.on('row', function(row){
			result.push(row);
		})

		query.on('end', function(){
			done();
			if(result.length == 0){
				return res.json({success: false, data:userId});
			}

			return res.json(result);
		});
	});
}
