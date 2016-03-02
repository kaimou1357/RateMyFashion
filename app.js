var express = require('express');
var fs = require('fs');
var multer = require('multer');
var Photo = require('./photo.js');
app = express();
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + ".jpg");
  }
})
var upload = multer({storage:storage});



//require('./routes/routes.js')(app);
var base_url = "localhost:3000/images/";
var photoArray = [];

/*
 * To Do:
 *     Authentication
 *     User Object
 *     Database
 *     Option to upload your own pictures
 *
*/

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/load_next_picture', function(req, res){
  var picture_url = "/images/cat.jpg";
  var base_url = "localhost:3000";
  console.log("Completed!");
  res.json({
    "file_url": base_url + picture_url,
    "positive_ratings" : "30%",
    "negative_ratings": "50%"
  });

});

app.get('/load_ten_pictures', function(req, res){
  //./ looks into current working directory.
  var tmp = [];
  for(var i = 0; i < 10; i++){
    tmp[i] = photoArray[i];
  }
  res.json(tmp);
});

app.get('/initialize_all_pictures', function(req, res){
  var path = './images/';
  fs.readdir(path, function(err, items){
    if (err){
      console.log("there was an error");
      return;
    }
    console.log(items.length);
    for(var i = 0; i<items.length; i++){
      var photo = new Photo(base_url + items[i], 0, 0,Math.floor(Math.random()*1000));
      photoArray.push(photo);
    }

  });
  res.json({"Success" : "Done"});
});

app.post('/upload',upload.single('image'), function(req, res){
  res.json({"Success": "True"});
});

app.get('/images/:file', function(req, res){
  file = req.params.file;
  var img = fs.readFileSync(__dirname + '/images/' + file);
  res.writeHead(200, {'Content-Type' : 'image/jpg'});
  res.end(img, 'binary');
});



app.listen(3000);
