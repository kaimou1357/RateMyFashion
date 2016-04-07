var pg = require('pg');
var path = require("path");
var fs = require('fs');
var connectionString = "postgres://localhost:5432/fashiondb";
var baseFileURL = "http://localhost:3000/static/photos/"

/**
This function loads any number of photos (based on the querystring). It returns the found photos.
*/
exports.load_photos = function(req, res, next) {
	console.log('loaded ten photos, not id ' + req.query.user_id);

	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("SELECT photo_id FROM photos " +
								 	"WHERE NOT EXISTS " +
								 		"(SELECT photo_id FROM seen_photos AS sp " +
								 			"WHERE sp.photo_id = photos.photo_id " +
								 			"AND sp.user_id = $1) " +
								 	"AND NOT user_id = $1 " +
								 	"LIMIT $2;",
								 [req.query.user_id, req.query.num]);

		returnPhotoJSONArray(query, done, res);
	});
}

/**
This function will upload a photo to the file system and update the database. It will return the uploaded photo.
*/
exports.upload_photo = function(req, res, next) {
	var owner_id = req.body.owner_id;
	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("INSERT INTO photos (likes, dislikes, user_id) " +
									"VALUES (0, 0, $1) RETURNING photo_id, likes, dislikes, user_id", [owner_id]);
		var result;
		console.log(req.file);

		query.on('row', function(row){
			row.file_url =  baseFileURL + row.photo_id + '.jpg';
			result = row;
		});

		query.on('end', function(){
			done();
			fs.rename('./static/photos/' + req.file.filename, './static/photos/' + result.photo_id + '.jpg', function(err){
				if(err) console.log("Error Renaming the file!");
				return res.json(result);
			});

		});
	});
}

/**
This function will delete the photo whose photo_id is the one passed by the end point. It will return the deleted photo object.
*/
exports.delete_photo = function(req, res, next) {
	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("DELETE FROM photos WHERE photo_id = $1 RETURNING photo_id, likes, dislikes, user_id", [req.params.photo_id]);

		returnPhotoJSON(query, done, res);
	});

	console.log('deleted photo ' + req.params.photo_id);
}

/**
This function will increment one to the positive rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.like_photo = function(req, res, next) {
	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		client.query("INSERT INTO seen_photos (user_id, photo_id) VALUES ($1, $2);", [req.body.user_id, req.params.photo_id]);
		var query = client.query("UPDATE photos SET likes = likes + 1 WHERE photo_id = ($1) RETURNING photo_id, likes, dislikes, user_id", [req.params.photo_id]);

		returnPhotoJSON(query, done, res);
	});

	console.log('liked photo ' + req.params.photo_id);
}

/**
This function will increment one to the negative rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.dislike_photo = function(req, res, next) {
	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		client.query("INSERT INTO seen_photos (user_id, photo_id) VALUES ($1, $2);", [req.body.user_id, req.params.photo_id]);
		var query = client.query("UPDATE photos SET dislikes = dislikes + 1 WHERE photo_id = ($1) RETURNING photo_id, likes, dislikes, user_id;", [req.params.photo_id]);

		returnPhotoJSON(query, done, res);
	});

	console.log('disliked photo ' + req.params.photo_id);
}

/**
This function will return an JSON array that represents all the photos that belong to a certain fb_id
*/
exports.load_own = function(req, res, next) {
	//var result = [];
	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("SELECT photo_id, likes, dislikes FROM photos WHERE user_id = $1;", [req.query.user_id]);

		returnPhotoJSONArray(query, done, res);
	});

	console.log('loaded photos for ' + req.query.user_id);
}

/**
This function checks if the user is in the database and returns the id if they are. If not, it will add
the user_id into the database and return it. For now Facebook is our only login so Facebook ID will be 
user_id, but eventually when we integrate other ways of logging in this may not be the case, so while it
doesn't make sense to return the user_id right now, it will later on.
*/
exports.check_user = function(req, res, next) {
	pg.connect(connectionString, function(err, client, done){
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("SELECT user_id FROM users WHERE user_id = $1;", [req.query.user_id]);

		var user;
		query.on('row', function(row) {
			user = row;
		});

		query.on('end', function() {
			if (user === null) {
				query = client.query("INSERT INTO users (user_id) VALUES ($1) RETURNING user_id;", [req.query.user_id]);
				returnUserJSON(query, done, res);
			}
			else {
				done();
				return res.json(user);
			}
		});
	});

	console.log('checked user ' + req.query.user_id)
}

//helper functions
var returnPhotoJSONArray = function(query, done, res) {
	var result = [];

	query.on('row', function(row) {
		row.file_url =  baseFileURL + row.photo_id + '.jpg';
		result.push(row);
	});

	query.on('end', function() {
		done();
		return res.json(result);
	});
}

var returnPhotoJSON = function(query, done, res) {
	var result;

	query.on('row', function(row){
		row.file_url =  baseFileURL + row.photo_id + '.jpg';
		result = row;
	});

	query.on('end', function() {
		done();
		return res.json(result);
	});
}
	
var returnUserJSON = function(query, done, res) {
	var result;

	query.on('row', function(row) {
		result = row;
	});

	query.on('end', function() {
		done();
		return res.json(result);
	});
}
