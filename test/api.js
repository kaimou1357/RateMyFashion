/* eslint-env mocha */

var expect = require('chai').expect
var pg = require('pg')
var request = require('request')

describe('Photos API', function () {
  var test1 = 'test1'
  var test2 = 'test2'
  var test3 = 'test3'
  var connectionString = 'postgres://localhost:5432/fashiondb'

  beforeEach(function (done) {
    pg.connect(connectionString, function (err, client, fin) {
      if (err) {
        done()
        console.log(err)
      }

      client.query('CREATE SCHEMA test;' +
        'SET SEARCH_PATH TO test;' +
        'CREATE TABLE users("userId" text UNIQUE, "firstName" text, "lastName" text);' +
        'CREATE TABLE photos("photoId" SERIAL PRIMARY KEY, likes integer DEFAULT 0, dislikes integer DEFAULT 0, "userId" text);' +
        'CREATE TABLE "seenPhotos"("userId" text, "photoId" integer);')

      client.query('INSERT INTO users ("userId") VALUES ($1), ($2), ($3);', [test1, test2, test3])
      var query = client.query('INSERT INTO photos ("userId") VALUES ($1), ($1), ($1), ($1), ($1), ($2), ($2), ($2), ($2), ($2), ($3), ($3), ($3), ($3), ($3);', [test1, test2, test3])

      query.on('end', function () {
        fin()
        done()
      })
    })
  })

  describe('like photo', function () {
    it('adds one to the like count of the photo', function (done) {
      request({url: 'http://localhost:3000/api/photos/6',
               method: 'PUT',
               form: {viewer: 'test1', like: true, test: true}}, function (err, res, body) {
        if (err) console.log(err)
        else console.log(body)
        expect(JSON.parse(body).likes).to.equal(1)
        expect(JSON.parse(body).dislikes).to.equal(0)
        done()
      })
    })
  })

  describe('dislike photo', function () {
    it('adds one to the dislike count of the photo', function (done) {
      request({url: 'http://localhost:3000/api/photos/6',
               method: 'PUT',
               form: {viewer: 'test1', dislike: true, test: true}
              }, function (err, res, body) {
        if (err) console.log(err)
        else console.log(body)
        expect(JSON.parse(body).dislikes).to.equal(1)
        expect(JSON.parse(body).likes).to.equal(0)
        done()
      })
    })
  })

  afterEach(function (done) {
    pg.connect(connectionString, function (err, client, end) {
      if (err) {
        console.log(err)
        end()
      }

      var query = client.query('DROP SCHEMA test CASCADE;')

      query.on('end', function () {
        end()
        done()
      })
    })
  })
})
