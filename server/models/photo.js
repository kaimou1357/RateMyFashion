/** Photo.js **/
var pg = require('pg')
var config = require('../config.js')

var connectionString = config.postgresURI[process.env.NODE_ENV]

var Photo = function(data){
	this.data = data
}

Photo.prototype.data = {}

Photo.prototype.likePhoto  = function(){
	this.data.likes = this.data.likes + 1
}

Photo.prototype.save = function(callback){
	var self = this
	var query = client.query('UPDATE photos SET likes = ' + 
		this.data.likes + ', dislikes = ' + 
		this.data.dislikes + ',"userId" =' + 
		this.data.userId + 'WHERE "photoId" = ' + 
		this.data.photoId + ';')

	query.on('end', function(){
		callback(null, self)
	})

}

/** Retrieves a photo object given an a photo ID.**/
Photo.findById = function(id,callback){
	pg.connect(connectionString, function (err, client, done) {
	    if (err) {
	      done()
	      var error = new Error('Database Connection Failed:\n  check database server')
	      error.status = 500
	      next(error)
	    }
		client.query('SELECT * FROM photos WHERE "photoId" = ($1);', id, function(err, result){
			done()
			if(err) {
      			return callback(err)
    		}
    		console.log('result from findbyID' + result)
			callback(null, new Photo(result))
		})
	    

    })
}
module.exports = Photo