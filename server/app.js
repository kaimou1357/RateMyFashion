var path = require('path')
var express = require('express')
var bodyParser = require('body-parser')
var logger = require('morgan')

var config = require('./config')
var app = express()

app.set('port', process.env.PORT || 3000)
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'jade')

// route middleware
app.use('/api', require('./routes/new-api'))

// 404 errors
// app.use(function (req, res, next) {
// 	var err = new Error('Not Found')
//   	err.status = 404
//   	next(err)
// })

// error handlers
app.use(function (err, req, res, next) {
  console.log('  Error: ' + err.status + ': ' + err.message)
  return res.json({
    error: err.status,
    message: err.message
  })
})

app.listen(app.get('port'), function () {
  console.log('App listening on port ' + app.get('port'))
  console.log('Using Database: ' + config.postgresURI[app.settings.env])
})

module.exports = app
