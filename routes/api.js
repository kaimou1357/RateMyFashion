var router = require('express').Router();
var apiEP = require('./apiEP');

router.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

router.get('/load_photos', apiEP.load_photos);
router.post('/upload_photo/:photo_id', apiEP.upload_photo);
router.delete('/delete_photo/:photo_id', apiEP.delete_photo);
router.put('/like_photo/:photo_id', apiEP.like_photo);
router.put('/dislike_photo/:photo_id', apiEP.dislike_photo);
router.get('/load_own', apiEP.load_own);

module.exports = router;