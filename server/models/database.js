// create tables in database
var pg = require('pg')
var config = require('../config')
var connectionString = 'postgres://localhost:5432/fashiondb'

var client = new pg.Client(connectionString)
client.connect(function (err) {
  if (err) {
    console.log(err)
    client.end()
  }

  // create user and photo tables.
  var query = client.query('CREATE TABLE IF NOT EXISTS users("userId" text UNIQUE, "firstName" text, "lastName" text);' +
    'CREATE TABLE IF NOT EXISTS photos("photoId" SERIAL PRIMARY KEY, likes integer DEFAULT 0, dislikes integer DEFAULT 0, "userId" text);' +
    'CREATE TABLE IF NOT EXISTS "seenPhotos"("userId" text, "photoId" integer);')

  query.on('end', function () {
    client.end()
  })
})
