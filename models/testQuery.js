var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();

var query = client.query("INSERT INTO photos (positive_ratings, negative_ratings, owner_id) VALUES (0, 0, '1') RETURNING photo_id;");

query.on('row', function(row) {
	console.log('static/photos/' + row.photo_id);
	var update = client.query("UPDATE photos SET file_url = $1 WHERE photo_id = $2;", ['static/photos/' + row.photo_id, row.photo_id]);

	update.on('end', function() {
		client.end();
	})
});

query.on('end', function(result) {
	//client.query("DELETE FROM photos WHERE owner_id = '1';");
});