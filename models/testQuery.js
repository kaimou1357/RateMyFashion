var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();

var userID = 'asxapxhsahqjqnolhuolroeulcr';
var query = client.query("SELECT (user_id, first_name, last_name) FROM users WHERE user_id = $1;", [userID]);

var user;
query.on('row', function(row) {
	user = row;
});

query.on('end', function() {
	if (user === undefined)
		client.query("INSERT INTO users (user_id) VALUES ($1);", [userID]);
	else
		console.log(user);
});
