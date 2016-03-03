var express = require('express');
var fs = require('fs');
var multer = require('multer');
var Photo = require('./photo.js');
app = express();
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));
var base_url = "localhost:3000/images/";
var photoArray = [];
var numOfPhotos = 0;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/');
  },
  filename: function (req, file, cb) {
      var newPhoto = new Photo(base_url + numOfPhotos + ".jpg", 0 ,0, Math.floor(Math.random()*1000));
      photoArray.push(newPhoto);
      cb(null, numOfPhotos++ + ".jpg");
  }
})
var upload = multer({storage:storage});



//require('./routes/routes.js')(app);


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
  var photo = photoArray[Math.floor((Math.random() * numOfPhotos))];
  console.log(numOfPhotos);
  res.json({
    "file_url": photo.file_url,
    "positive_ratings" : photo.positive_ratings,
    "negative_ratings": photo.negative_ratings
  });

});

app.get('/load_ten_pictures', function(req, res){
  // looks into current working directory.
  var tmp = [];
  for(var i = 0; i < 10; i++){
    tmp[i] = photoArray[i];
  }
  res.send(tmp);
});

app.post('/update_picture_rating', function(req, res){
  //Post request takes two parameters.
  //-Picture ID
  //-1(positive) to add one to positive rating, -1 to add to negative rating.
  if(req == 'POST'){
      var photoID = req.body.picture_id;
      var ratingChange = req.body.rating_change;
      if(ratingChange == 1){
        photoArray[photoID].positive_ratings++;
      }
      else{
        photoArray[photoID].negative_ratings++;
      }
      res.json(photoArray[photoID]);
  }
  else{
    res.json({
      "file_url": photoArray[photoID].file_url,
      "positive_ratings" : photoArray[photoID].positive_ratings,
      "negative_ratings": photoArray[photoID].negative_ratings
    });
  }
});

app.post('/upload',upload.single('image'), function(req, res){
  res.json({"Success": "True"});
});
app.listen(3000);
