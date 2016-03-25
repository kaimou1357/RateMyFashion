//create tables in database

var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();
//Create user and photo tables.
var query = client.query("CREATE TABLE users(fb_id text, first_name text, last_name text); CREATE TABLE photos(photo_id SERIAL PRIMARY KEY, positive_ratings integer, negative_ratings integer, owner_id text, fileUrl text);");
query.on('end', function(){  
  client.end();
});
