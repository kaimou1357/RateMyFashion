/* eslint-env mocha */
process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server/app')
var config = require('../config.js')
var pg = require('pg')
var should = chai.should()

chai.use(chaiHttp)

describe('RateMyFashion', function () {
  var test1 = 'test1'
  var test2 = 'test2'
  var test3 = 'test3'
  

  beforeEach(function (done) {
    pg.connect(config.postgresURI[server.settings.env], function (err, client, fin) {
      if (err) {
        done()
        console.log(err)
      }

      var query = client.query(
        'CREATE TABLE users("userId" text UNIQUE, "firstName" text, "lastName" text);' +
        'CREATE TABLE photos("photoId" SERIAL PRIMARY KEY, likes integer DEFAULT 0, dislikes integer DEFAULT 0, "userId" text);' +
        'CREATE TABLE "seenPhotos"("userId" text, "photoId" integer);', function(err, qry){
          client.query('INSERT INTO users ("userId") VALUES ($1), ($2), ($3);', [test1, test2, test3])
          client.query('INSERT INTO photos ("userId") VALUES ($1), ($1), ($1), ($1), ($1), ($2), ($2), ($2), ($2), ($2), ($3), ($3), ($3), ($3), ($3);', [test1, test2, test3])

        })

      //client.query('INSERT INTO users ("userId") VALUES ($1), ($2), ($3);', [test1, test2, test3])
      //var query = client.query('INSERT INTO photos ("userId") VALUES ($1), ($1), ($1), ($1), ($1), ($2), ($2), ($2), ($2), ($2), ($3), ($3), ($3), ($3), ($3);', [test1, test2, test3])

      query.on('end', function () {
        fin()
        done()
      })
   })
  })

  describe('Photos', function () {
    it('Should like a SINGLE photo on /photos/<id> PUT', function (done) {
      // request({url: 'http://localhost:3000/api/photos/6',
      //          method: 'PUT',
      //          form: {viewer: 'test1', like: true, test: true}}, function (err, res, body) {
      //   if (err) console.log(err)
      //   else console.log(body)
      //   expect(JSON.parse(body).likes).to.equal(1)
      //   expect(JSON.parse(body).dislikes).to.equal(0)
      //   done()
      // })
      chai.request(server)
        .put('/api/photos/6')
        .send({viewer: 'test1', like : true})
        .end(function(err, res){
          //test for cases later.
          res.should.have.status(200)
          done()
        })
    })
    
    it('Should dislike a SINGLE photo on /photos/<id> PUT', function(done){
      chai.request(server)
        .put('/api/photos/6')
        .send({viewer: 'test1', dislike : true})
        .end(function(err, res){
          //test for cases later.
          res.should.have.status(200)
          done()
        })
    })
  })

  // describe('dislike photo', function () {
  //   it('adds one to the dislike count of the photo', function (done) {
  //     request({url: 'http://localhost:3000/api/photos/6',
  //              method: 'PUT',
  //              form: {viewer: 'test1', dislike: true, test: true}
  //             }, function (err, res, body) {
  //       if (err) console.log(err)
  //       else console.log(body)
  //       expect(JSON.parse(body).dislikes).to.equal(1)
  //       expect(JSON.parse(body).likes).to.equal(0)
  //       done()
  //     })
  //   })
  // })

  afterEach(function (done) {
    console.log(config.postgresURI[server.settings.env])
    pg.connect(config.postgresURI[server.settings.env], function (err, client, end) {
      if (err) {
        console.log(err)
        end()
      }

      var query = client.query('DROP TABLE users, photos, "seenPhotos";')

      query.on('end', function () {
        end()
        done()
      })
    })
    done()
  })
})
