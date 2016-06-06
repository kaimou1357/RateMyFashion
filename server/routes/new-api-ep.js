var fs = require('fs')
var pg = require('pg')
var config = require('../config.js')

var connectionString = config.postgresURI[process.env.NODE_ENV]
var baseFileURL = 'http://localhost:3000/static/photos/'

exports.loadPhotos = function (req, res, next) {
  var error
  if (!req.query.viewer) {
    error = new Error('Missing Parameters:\n  must include viewer')
    error.status = 400
    next(error)
    return
  }
  var limit = req.query.limit || 5

  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      var error = new Error('Database Connection Failed:\n  check database server')
      error.status = 500
      next(error)
      return
    }

    var query = client.query('SELECT "photoId", likes, dislikes, "userId" FROM photos ' +
                               'WHERE NOT EXISTS ' +
                                 '(SELECT "photoId" FROM "seenPhotos" AS sp ' +
                                    'WHERE sp."photoId" = photos."photoId" ' +
                                      'AND sp."userId" = $1) ' +
                                      'AND NOT "userId" = $1 ' +
                             'LIMIT $2;',
                             [req.query.viewer, limit])
    returnPhotoJSONArray(query, done, res, next)
  })

  // console.log('loading ' + limit + ' photos, not id ' + req.query.viewer)
}

/**
This function will upload a photo to the file system and update the database. It will return the uploaded photo.
*/
exports.uploadPhoto = function (req, res, next) {
  var id = req.body.id
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      var error = new Error('Database Connection Failed:\n  check database server')
      error.status = 500
      next(error)
      return
    }

    var query = client.query('INSERT INTO photos ("userId") ' +
      'VALUES ($1) RETURNING "photoId", likes, dislikes, "userId"', [id])

    var result
    console.log(req.file)

    query.on('row', function (row) {
      row.file_url = baseFileURL + row.photoId + '.jpg'
      result = row
    })

    query.on('end', function () {
      done()
      fs.rename('./static/photos/' + req.file.filename, './static/photos/' + result.photoId + '.jpg', function (err) {
        if (err) console.log('Error Renaming the file!')
        return res.json(result)
      })
    })
  })
}

/**
This function will delete the photo whose \"photoId\" is the one passed by the end point. It will return the deleted photo object.
*/
exports.deletePhoto = function (req, res, next) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      var error = new Error('Database Connection Failed:\n  check database server')
      error.status = 500
      next(error)
      return
    }

    var query = client.query('DELETE FROM photos WHERE "photoId" = $1 RETURNING "photoId", likes, dislikes, "userId"', [req.params.photoid])

    returnPhotoJSON(query, done, res, next)
  })

  // console.log('deleting photo ' + req.params.photoId)
}

/**
This function will increment one to the positive rating of a photo object in the database. It will return a photo object in JSON format.
*/

exports.updatePhoto = function (req, res, next) {
  if (!req.body.viewer || !(req.body.like || req.body.dislike)) {
    var err = new Error('Parameters Missing:\n  must include viewer and either like or dislike')
    err.status = 400
    next(err)
    return
  }

  pg.connect(connectionString, function (err, client, done) {
    // console.log(process.env.NODE_ENV)
    if (err) {
      done()
      var error = new Error('Database Connection Failed:\n  check database server')
      error.status = 500
      next(error)
      return
    }

    var action

    if (req.body.like) action = 'likes'
    else action = 'dislikes'

    client.query('INSERT INTO "seenPhotos" ("userId", "photoId") VALUES ($1, $2);', [req.body.viewer, req.params.photoid], function () {
      var query = client.query('UPDATE photos SET ' + action + ' = ' + action + ' + 1 WHERE "photoId" = ($1) RETURNING "photoId", likes, dislikes, "userId"', [req.params.photoid])
      returnPhotoJSON(query, done, res, next)
    })

    // console.log(action + ' photo ' + req.params.id)
  })
}

/**
This function will return an JSON array that represents all the photos that belong to a certain fb_id
*/
exports.loadOwn = function (req, res, next) {
  // var result = []
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      var error = new Error('Database Connection Failed:\n  check database server')
      error.status = 500
      next(error)
      return
    }

    var query = client.query('SELECT "photoId", likes, dislikes, "userId" FROM photos WHERE "userId" = $1;', [req.params.userid])

    returnPhotoJSONArray(query, done, res, next)
  })

  // console.log('loading photos for ' + req.query.userId)
}

/**
This function checks if the user is in the database and returns the id if they are. If not, it will add
the \"userId\" into the database and return it. For now Facebook is our only login so Facebook ID will be
user_id, but eventually when we integrate other ways of logging in this may not be the case, so while it
doesn't make sense to return the \"userId\" right now, it will later on.
*/
exports.checkUser = function (req, res, next) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      var error = new Error('Database Connection Failed:\n  check database server')
      error.status = 500
      next(error)
      return
    }

    var query = client.query('SELECT "userId" FROM users WHERE "userId" = $1;', [req.params.userid])

    var user
    query.on('row', function (row) {
      user = row
    })

    query.on('end', function () {
      if (user) {
        console.log(user)
        done()
        return res.json(user)
      } else {
        console.log("user doesn't exist")
        query = client.query('INSERT INTO users ("userId") VALUES ($1) RETURNING "userId";', [req.params.userid])
        returnUserJSON(query, done, res)
      }
    })
  })

  // console.log('checking user ' + req.query.userId)
}

// Helper functions
var returnPhotoJSONArray = function (query, done, res, next) {
  var result = []

  query.on('row', function (row) {
    row.fileUrl = baseFileURL + row.photoId + '.jpg'
    result.push(row)
  })

  query.on('end', function () {
    done()
    if (result.length > 0) {
      // console.log('  Success')
      return res.json(result)
    } else {
      var err = new Error('No Content')
      err.status = 204
      next(err)
    }
  })
}

var returnPhotoJSON = function (query, done, res, next) {
  var result

  query.on('row', function (row) {
    row.fileUrl = baseFileURL + row.photoId + '.jpg'
    result = row
  })

  query.on('end', function () {
    done()
    if (result) {
      // console.log('  Success')
      return res.json(result)
    } else {
      var err = new Error('No Content')
      err.status = 204
      next(err)
    }
  })
}

var returnUserJSON = function (query, done, res, next) {
  var result

  query.on('row', function (row) {
    result = row
  })

  query.on('end', function () {
    done()
    return res.json(result)
  })
}
