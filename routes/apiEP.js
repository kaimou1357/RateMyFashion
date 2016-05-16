var pg = require('pg')
var fs = require('fs')
var connectionString = 'postgres://localhost:5432/fashiondb'
var baseFileURL = 'http://localhost:3000/static/photos/'

exports.loadPhotos = function (req, res, next) {
  var limit = req.query.limit || 5
  console.log('loading ' + limit + ' photos, not id ' + req.query.viewer)

  if (!req.query.viewer) {
    var err = new Error('No Content')
    err.status = 204
    next(err)
  }

  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }

    var query

    if (req.query.test) {
      query = client.query('SET SEARCH_PATH TO test;')
      query.on('end', function () {
        query = client.query('SELECT "photoId", likes, dislikes FROM photos ' +
          'WHERE NOT EXISTS ' +
          '(SELECT "photoId" FROM "seenPhotos" AS sp ' +
          'WHERE sp.photoId = photos.photoId ' +
          'AND sp.userId = $1) ' +
          'AND NOT "userId" = $1 ' +
          'LIMIT $2;',
          [req.query.userId, req.query.num])
        returnPhotoJSONArray(query, done, res, next)
      })
    } else {
      query = client.query('SELECT "photoId", likes, dislikes FROM photos ' +
        'WHERE NOT EXISTS ' +
        '(SELECT "photoId" FROM "seenPhotos" AS sp ' +
        'WHERE sp.photoId = photos.photoId ' +
        'AND sp.userId = $1) ' +
        'AND NOT "userId" = $1 ' +
        'LIMIT $2;',
        [req.query.userId, req.query.num])
      returnPhotoJSONArray(query, done, res, next)
    }
  })
}

/**
This function loads any number of photos (based on the querystring). It returns the found photos.
*/
exports.load_photos = function (req, res, next) {
  console.log('loading ' + req.query.num + ' photos, not id ' + req.query.userId)

  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }

    var query

    if (req.query.test) {
      query = client.query('SET SEARCH_PATH TO test;')
      query.on('end', function () {
        query = client.query('SELECT "photoId", likes, dislikes FROM photos ' +
          'WHERE NOT EXISTS ' +
          '(SELECT "photoId" FROM "seenPhotos" AS sp ' +
          'WHERE sp.photoId = photos.photoId ' +
          'AND sp.userId = $1) ' +
          'AND NOT "userId" = $1 ' +
          'LIMIT $2;',
          [req.query.userId, req.query.num])
        returnPhotoJSONArray(query, done, res, next)
      })
    } else {
      query = client.query('SELECT "photoId", likes, dislikes FROM photos ' +
        'WHERE NOT EXISTS ' +
        '(SELECT "photoId" FROM "seenPhotos" AS sp ' +
        'WHERE sp.photoId = photos.photoId ' +
        'AND sp.userId = $1) ' +
        'AND NOT "userId" = $1 ' +
        'LIMIT $2;',
        [req.query.userId, req.query.num])
      returnPhotoJSONArray(query, done, res, next)
    }
  })
}

/**
This function will upload a photo to the file system and update the database. It will return the uploaded photo.
*/
exports.upload_photo = function (req, res, next) {
  var ownerId = req.body.ownerId
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }

    var query = client.query('INSERT INTO photos (likes, dislikes, "userId") ' +
      'VALUES (0, 0, $1) RETURNING "photoId", likes, dislikes, "userId"', [ownerId])
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
exports.delete_photo = function (req, res, next) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }

    var query = client.query('DELETE FROM photos WHERE "photoId" = $1 RETURNING "photoId", likes, dislikes, "userId"', [req.body.photoId])

    returnPhotoJSON(query, done, res, next)
  })

  console.log('deleting photo ' + req.body.photoId)
}

/**
This function will increment one to the positive rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.like_photo = function (req, res, next) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var query
    if (req.query.test) query = client.query('SET SEARCH_PATH TO test;')

    if (query) {
      query.on('end', function () {
        client.query('INSERT INTO "seenPhotos" ("userId", "photoId") VALUES ($1, $2);', [req.body.userId, req.body.photoId])
        query = client.query('UPDATE photos SET likes = likes + 1 WHERE "photoId" = ($1) RETURNING "photoId", likes, dislikes, "userId"', [req.body.photoId])
        returnPhotoJSON(query, done, res, next)
      })
    } else {
      client.query('INSERT INTO "seenPhotos" ("userId", "photoId") VALUES ($1, $2);', [req.body.userId, req.body.photoId])
      query = client.query('UPDATE photos SET likes = likes + 1 WHERE "photoId" = ($1) RETURNING "photoId", likes, dislikes, "userId"', [req.body.photoId])
      returnPhotoJSON(query, done, res, next)
    }
  })

  console.log('liking photo ' + req.body.photoId)
}

/**
This function will increment one to the negative rating of a photo object in the database. It will return a photo object in JSON format.
*/
exports.dislike_photo = function (req, res, next) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }
    var query
    if (req.query.test) query = client.query('SET SEARCH_PATH TO test;')

    if (query) {
      query.on('end', function () {
        client.query('INSERT INTO "seenPhotos" ("userId", "photoId") VALUES ($1, $2);', [req.body.userId, req.body.photoId])
        query = client.query('UPDATE photos SET dislikes = dislikes + 1 WHERE "photoId" = ($1) RETURNING "photoId", likes, dislikes, "userId"', [req.body.photoId])
        returnPhotoJSON(query, done, res, next)
      })
    } else {
      client.query('INSERT INTO "seenPhotos" ("userId", "photoId") VALUES ($1, $2);', [req.body.userId, req.body.photoId])
      query = client.query('UPDATE photos SET dislikes = dislikes + 1 WHERE "photoId" = ($1) RETURNING "photoId", likes, dislikes, "userId"', [req.body.photoId])
      returnPhotoJSON(query, done, res, next)
    }
  })

  console.log('disliking photo ' + req.body.photoId)
}

/**
This function will return an JSON array that represents all the photos that belong to a certain fb_id
*/
exports.load_own = function (req, res, next) {
  // var result = []
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }

    var query = client.query('SELECT "photoId", likes, dislikes, "userId" FROM photos WHERE "userId" = $1;', [req.query.userId])

    returnPhotoJSONArray(query, done, res, next)
  })

  console.log('loading photos for ' + req.query.userId)
}

/**
This function checks if the user is in the database and returns the id if they are. If not, it will add
the \"userId\" into the database and return it. For now Facebook is our only login so Facebook ID will be
user_id, but eventually when we integrate other ways of logging in this may not be the case, so while it
doesn't make sense to return the \"userId\" right now, it will later on.
*/
exports.check_user = function (req, res, next) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({success: false, data: err})
    }

    var query = client.query('SELECT "userId" FROM users WHERE "userId" = $1;', [req.query.userId])

    var user
    query.on('row', function (row) {
      user = row
    })

    query.on('end', function () {
      if (user) {
        done()
        return res.json(user)
      } else {
        console.log("user doesn't exist")
        query = client.query('INSERT INTO users ("userId") VALUES ($1) RETURNING "userId";', [req.query.userId])
        returnUserJSON(query, done, res)
      }
    })
  })

  console.log('checking user ' + req.query.userId)
}

// Helper functions
var returnPhotoJSONArray = function (query, done, res, next) {
  var result = []

  query.on('row', function (row) {
    row.file_url = baseFileURL + row.photoId + '.jpg'
    result.push(row)
  })

  query.on('end', function () {
    done()
    if (result.length > 0) {
      console.log('  Success')
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
    row.file_url = baseFileURL + row.photoId + '.jpg'
    result = row
  })

  query.on('end', function () {
    done()
    if (result) {
      console.log('  Success')
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
