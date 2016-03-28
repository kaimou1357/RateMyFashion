var pg = require('pg');
var path = require("path");
var connectionString = "postgres://localhost:5432/fashiondb";
var baseFileURL = "http://localhost:3000/static/photos/"

exports.load_ten = function(req, res, next) {
	//load ten random valid pictures
	console.log('loaded ten photos, not id ' + req.query.fb_id);
}

exports.upload_photo = function(req, res, next) {
	var owner_id = req.body.owner_id;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("INSERT INTO photos (likes, dislikes, user_id) VALUES (0, 0, $1) RETURNING photo_id, likes, dislikes, user_id", [owner_id]);
		var result;
		console.log(req.file);
		query.on('row', function(row, req){
			row.file_url =  baseFileURL + row.photo_id + '.jpg';
			result = row;
		});

		query.on('end', function(){
			done();
			req.file.filename = result.photo_id;
			return res.json(result);
		});

	});

}

exports.delete_photo = function(req, res, next) {
	//delete a photo, photo_id and fb_id are passed

	var photo_id = req.params.photo_id;

	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("DELETE FROM photos WHERE photo_id = $1 RETURNING photo_id, likes, dislikes, user_id", [photo_id]);

		returnJSON(client, done, res, query);
	});

	console.log('deleted photo ' + req.params.photo_id);
}

/**
This function will increment one to the positive rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.like_photo = function(req, res, next) {
	var result;
	var photo_id = req.params.photo_id;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}
		var query = client.query("UPDATE photos SET likes = likes + 1 WHERE photo_id = ($1) RETURNING photo_id, likes, dislikes, user_id", [photo_id]);
		returnJSON(client, done, res, query);

	});
}

/**
This function will increment one to the negative rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.dislike_photo = function(req, res, next) {

	var result;
	var photo_id = req.params.photo_id;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}
		var query = client.query("UPDATE photos SET dislikes = dislikes + 1 WHERE photo_id = ($1) RETURNING photo_id, likes, dislikes, user_id;", [photo_id]);
		returnJSON(client, done, res, query);
	});

}

/**
This function will return an JSON array that represents all the photos that belong to a certain fb_id
*/
exports.load_own = function(req, res, next) {
	var result = [];
	var user_id = req.query.fb_id;
	pg.connect(connectionString, function(err, client, done){
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		var query = client.query("SELECT * FROM photos WHERE user_id = $1;", [user_id]);

		returnJSONArray(client, done, res, query);
	});
}
//Helper Functions
var returnJSON = function(client, done, res, query) {
	var result;

	query.on('row', function(row){
		row.file_url =  baseFileURL + row.photo_id + '.jpg';
		result = row;
	});

	query.on('end', function(){
		done();
		return res.json(result);
	});
}

var returnJSONArray = function(client, done, res, query) {
	var result = [];

	query.on('row', function(row){
		row.file_url =  baseFileURL + row.photo_id + '.jpg';
		result.push(row);
	});

	query.on('end', function(){
		done();
		return res.json(result);
	});
}
