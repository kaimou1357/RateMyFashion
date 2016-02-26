var express = require('express');
app = express();
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.redirect("/index.html");
})

app.get('/load_next_picture', function(req, res){
  var picture_url = "static/images/cat.jpg";
  var base_url = "localhost:3000/"
  res.json({"picture_url": base_url + picture_url});

});

app.listen(3000);
