var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();

var userID = 'fa';
var query = client.query("SELECT (user_id) FROM users WHERE user_id = $1;", [userID]);

var user;
query.on('row', function(row) {
	user = row;
});

query.on('end', function() {
	if (user === undefined) {
		query = client.query("INSERT INTO users (user_id) VALUES ($1) RETURNING (user_id);", [userID]);
		returnUserJSON(client, query);
	}
	else {
		console.log(user);
		client.end();
	}
});

var returnUserJSON = function(client, query) {
	var result;

	query.on('row', function(row) {
		result = row;
	});

	query.on('end', function() {
		client.end();
	});
}
