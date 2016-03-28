var router = require('express').Router();
var apiEP = require('./apiEP');
var path = require("path");
var bodyParser = require('body-parser');
var multer = require('multer');
var storage = multer.diskStorage({
	destination: './static/photos/',
  	filename:function(req, file, cb){
    	console.log(req.body.owner_id);
    	cb(null, file.originalname);
  	}
});
var upload = multer({storage: storage});

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/load_photos', apiEP.load_photos);
router.post('/upload_photo', upload.single('photo'), apiEP.upload_photo);
router.delete('/delete_photo/:photo_id', apiEP.delete_photo);
router.put('/like_photo/:photo_id', apiEP.like_photo);
router.put('/dislike_photo/:photo_id', apiEP.dislike_photo);
router.get('/load_own', apiEP.load_own);

module.exports = router;