// create tables in database

var pg = require('pg')
var connectionString = 'postgres://localhost:5432/fashiondb'

var client = new pg.Client(connectionString)
client.connect()

// create user and photo tables.
var query = client.query('CREATE TABLE users("userId" text UNIQUE, "firstName" text, "lastName" text);' +
  'CREATE TABLE photos("photoId" SERIAL PRIMARY KEY, likes integer DEFAULT 0, dislikes integer DEFAULT 0, "userId" text);' +
  'CREATE TABLE "seenPhotos"("userId" text, "photoId" integer);')

query.on('end', function () {
  client.end()
})
