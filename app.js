var express = require('express');
var fs = require('fs');
var Photo = require('./photo.js');
app = express();
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));
var base_url = "localhost:3000/images/";
var photoArray = [];

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
  //./ looks into current workign directory.
  var tmp = [];
  for(var i = 0; i<10; i++){
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

app.listen(3000);
