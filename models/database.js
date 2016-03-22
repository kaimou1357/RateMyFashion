//create tables in database

var pg = require('pg');
var connectionString = "postgres://localhost:5432/fashiondb";

var client = new pg.Client(connectionString);
client.connect();
//Create user and photo tables.
var query = client.query("CREATE TABLE users(fb_id text, firstName text, lastName text); CREATE TABLE photos(photoId SERIAL PRIMARY KEY, positiveRatings integer, negativeRatings integer, ownerId text, fileUrl text);");
query.on('end', function(){
  client.end();
});
