//create tables in database

var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();
//Create user and photo tables.
var query = client.query("CREATE TABLE users(user_id text UNIQUE, first_name text, last_name text);" +
						 "CREATE TABLE photos(photo_id SERIAL PRIMARY KEY, likes integer, dislikes integer, user_id text);" +
						 "CREATE TABLE seen_photos(user_id text, photo_id integer);");
query.on('end', function(){
  client.end();
});
