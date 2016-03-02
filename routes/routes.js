var fs = require('fs');
module.exports = function(app){
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

  app.post('/upload', function(req, res){
    console.log(req.files.image.originalFilename);
    console.log(req.files.image.path);
      fs.readFile(req.files.image.originalFilename);
      var newPath = './images/' + req.files.image.originalFilename;
      fs.writeFile(newPath, data, function(err){
        if(err){
          res.json({'Response' : 'Error'});
        }
        else{
          res.json({'Response' : 'Saved'});
        }
      });
  });

  app.get('/images/:file', function(req, res){
    file = req.params.file;
    var img = fs.readFileSync(__dirname + '/images/' + file);
    res.writeHead(200, {'Content-Type' : 'image/jpg'});
    res.end(img, 'binary');
  });


}
