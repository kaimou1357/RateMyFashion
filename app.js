var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(__dirname + '/images'));
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'jade');

//route middleware
app.use('/api', require('./routes/api'));

//404 errors
// app.use(function (req, res, next) {
// 	var err = new Error('Not Found');
//   	err.status = 404;
//   	next(err);
// });

//error handlers
app.use(function(err, req, res, next) {
	console.log('  Error: ' + err.status + ': ' + err.message);
	return res.json({
		error: err.status,
		message: err.message
	});
});

app.listen(app.get('port'), function() {
	console.log('App listening on port ' + app.get('port'));
});
