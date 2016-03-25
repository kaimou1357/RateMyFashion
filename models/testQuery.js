var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();

var query = client.query("INSERT INTO photos (owner_id) VALUES ('1') RETURNING photo_id;");

var rows;

query.on('row', function(row) {
	rows = row;
});

query.on('end', function(result) {
	console.log(rows);
	client.query("DELETE FROM photos WHERE owner_id = '1';");
	client.end();
});