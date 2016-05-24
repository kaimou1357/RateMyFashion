/* eslint-env mocha */
process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server/app')
var config = require('../server/config.js')
var pg = require('pg')

chai.should()
chai.use(chaiHttp)

describe('Photos', function () {
  var test1 = 'test1'
  var test2 = 'test2'
  var test3 = 'test3'

  beforeEach(function (done) {
    pg.connect(config.postgresURI[process.env.NODE_ENV], function (err, client, fin) {
      if (err) {
        console.log(err)
        done()
      } else {
        client.query('CREATE TABLE users("userId" text UNIQUE, "firstName" text, "lastName" text);' +
                     'CREATE TABLE photos("photoId" SERIAL PRIMARY KEY, likes integer DEFAULT 0, dislikes integer DEFAULT 0, "userId" text);' +
                     'CREATE TABLE "seenPhotos"("userId" text, "photoId" integer);', function () {
          client.query('INSERT INTO users ("userId") VALUES ($1), ($2), ($3);', [test1, test2, test3], function () {
            client.query('INSERT INTO photos ("userId") VALUES ($1), ($1), ($1), ($1), ($1), ' +
                                                              '($2), ($2), ($2), ($2), ($2), ' +
                                                              '($3), ($3), ($3), ($3), ($3);',
                                                              [test1, test2, test3], function () {
                                                                fin()
                                                                done()
                                                              })
          })
        })
      }
    })
  })

  describe('like photo', function () {
    it('should like a SINGLE photo on /api/photos/<id> PUT', function (done) {
      chai.request(server)
        .put('/api/photos/6')
        .send({viewer: 'test1', like: true})
        .end(function (err, res) {
          if (err) {
            console.log(err)
            done()
          } else {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.all.keys('photoId', 'likes', 'dislikes', 'userId', 'fileUrl')
            res.body.should.deep.equal({photoId: 6, likes: 1, dislikes: 0, userId: 'test2', fileUrl: 'http://localhost:3000/static/photos/6.jpg'})

            pg.connect(config.postgresURI[process.env.NODE_ENV], function (err, client, fin) {
              if (err) {
                console.log(err)
                done()
              } else {
                client.query('SELECT "photoId", "userId" FROM "seenPhotos" WHERE "userId" = \'test1\' AND "photoId" = 6;', function (err, result) {
                  if (err) {
                    done()
                    console.log(err)
                  } else {
                    result.rows.should.be.an('array')
                    result.rowCount.should.equal(1)
                    result.rows[0].userId.should.equal('test1')
                    result.rows[0].photoId.should.equal(6)
                  }
                })
              }
            })
          }
        })

      chai.request(server)
        .put('/api/photos/11')
        .send({viewer: 'test1', like: true})
        .end(function (err, res) {
          if (err) {
            console.log(err)
            done()
          } else {
            // console.log(res.body)
            // test for cases later.
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.all.keys('photoId', 'likes', 'dislikes', 'userId', 'fileUrl')
            res.body.should.deep.equal({photoId: 11, likes: 1, dislikes: 0, userId: 'test3', fileUrl: 'http://localhost:3000/static/photos/11.jpg'})

            pg.connect(config.postgresURI[process.env.NODE_ENV], function (err, client, fin) {
              if (err) {
                console.log(err)
                done()
              } else {
                client.query('SELECT "photoId", "userId" FROM "seenPhotos" WHERE "userId" = \'test1\' AND "photoId" = 11;', function (err, result) {
                  if (err) {
                    done()
                    console.log(err)
                  } else {
                    result.rows.should.be.an('array')
                    result.rowCount.should.equal(1)
                    result.rows[0].userId.should.equal('test1')
                    result.rows[0].photoId.should.equal(11)
                    done()
                  }
                })
              }
            })
          }
        })
    })
  })

  describe('dislike photo', function () {
    it('should dislike a SINGLE photo on /api/photos/<id> PUT', function (done) {
      chai.request(server)
        .put('/api/photos/6')
        .send({viewer: 'test1', dislike: true})
        .end(function (err, res) {
          if (err) {
            console.log(err)
            done()
          } else {
            // test for cases later.
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.deep.equal({photoId: 6, likes: 0, dislikes: 1, userId: 'test2', fileUrl: 'http://localhost:3000/static/photos/6.jpg'})

            pg.connect(config.postgresURI[process.env.NODE_ENV], function (err, client, fin) {
              if (err) {
                console.log(err)
                done()
              } else {
                client.query('SELECT "photoId", "userId" FROM "seenPhotos" WHERE "userId" = \'test1\' AND "photoId" = 6;', function (err, result) {
                  if (err) {
                    console.log(err)
                    done()
                  } else {
                    result.rowCount.should.equal(1)
                    result.rows[0].userId.should.equal('test1')
                    result.rows[0].photoId.should.equal(6)
                  }
                })
              }
            })
          }
        })

      chai.request(server)
        .put('/api/photos/11')
        .send({viewer: 'test1', dislike: true})
        .end(function (err, res) {
          if (err) {
            console.log(err)
            done()
          } else {
            // test for cases later.
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.deep.equal({photoId: 11, likes: 0, dislikes: 1, userId: 'test3', fileUrl: 'http://localhost:3000/static/photos/11.jpg'})

            pg.connect(config.postgresURI[process.env.NODE_ENV], function (err, client, fin) {
              if (err) {
                console.log(err)
                done()
              } else {
                client.query('SELECT "photoId", "userId" FROM "seenPhotos" WHERE "userId" = \'test1\' AND "photoId" = 11;', function (err, result) {
                  if (err) {
                    console.log(err)
                    done()
                  } else {
                    result.rowCount.should.equal(1)
                    result.rows[0].userId.should.equal('test1')
                    result.rows[0].photoId.should.equal(11)
                    done()
                  }
                })
              }
            })
          }
        })
    })
  })

  describe('find photos', function () {
    it('should find photos that haven\'t been seen by the user on /api/photos?viewer=<id>&limit=<num> GET', function (done) {
      chai.request(server)
        .get('/api/photos?viewer=test1&limit=6')
        .end(function (err, res) {
          if (err) {
            console.log(err)
            done()
          } else {
            // console.log(res.body)
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.equal(6)
            for (var i = 0; i < res.body.length; i++) {
              res.body[i].should.have.all.keys('photoId', 'likes', 'dislikes', 'userId', 'fileUrl')
              res.body[i].userId.should.be.a('string')
              res.body[i].userId.should.not.equal('test1')
            }
            done()
          }
        })
    })
    it('should return user\'s own photos on /api/users/<id>/photos GET', function(done){
      chai.request(server)
        .get('/api/users/test2/photos')
        .end(function(err, res){
          if(err){
            console.log(err)
            done()
          } else{
            console.log(res)
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.equal(5)
            //each user should have 5 photos to themselves. 
            for (var i = 0; i < res.body.length; i++) {
              res.body[i].should.have.all.keys('photoId', 'likes', 'dislikes', 'userId', 'fileUrl')
              res.body[i].userId.should.be.a('string')
              res.body[i].userId.should.not.equal('test1')
            }
            done()
          }
        })
    })
  })

  describe('delete photo', function () {
    it('should remove a photo on /api/photos/<id> DELETE', function (done) {
      chai.request(server)
        .delete('/api/photos/6')
        .end(function (err, res) {
          if (err) {
            console.log(err)
            done()
          } else {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.deep.equal({photoId: 6, likes: 0, dislikes: 0, userId: 'test2', fileUrl: 'http://localhost:3000/static/photos/6.jpg'})

            pg.connect(config.postgresURI[process.env.NODE_ENV], function (err, client, fin) {
              if (err) {
                console.log(err)
                done()
              } else {
                client.query('SELECT * FROM "photos" WHERE "photoId" = 6;', function (err, result) {
                  if (err) {
                    console.log(err)
                    done()
                  } else {
                    result.rowCount.should.equal(0)
                    done()
                  }
                })
              }
            })
          }
        })
    })
  })

  afterEach(function (done) {
    pg.connect(config.postgresURI[server.settings.env], function (err, client, end) {
      if (err) {
        console.log(err)
        end()
      } else {
        var query = client.query('DROP TABLE users, photos, "seenPhotos";')

        query.on('end', function () {
          end()
          done()
        })
      }
    })
  })
})
