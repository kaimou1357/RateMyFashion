var router = require('express').Router()
var apiEP = require('./new-api-ep')
var path = require('path')
var bodyParser = require('body-parser')
var multer = require('multer')
var storage = multer.diskStorage({
  destination: './static/photos/',
  filename: function (req, file, cb) {
    console.log(req.body.owner_id)
    cb(null, file.originalname)
  }
})

var upload = multer({storage: storage})

router.use(bodyParser.urlencoded({ extended: true }))

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../views/index.html'))
})

router.get('/photos', apiEP.loadPhotos)
router.post('/photos', upload.single('photo'), apiEP.uploadPhoto)
router.delete('/photos/:id', apiEP.deletePhoto)
router.put('/photos/:id', apiEP.updatePhoto)
router.get('/users/:id/photos', apiEP.loadOwn)
router.get('/users/:id', apiEP.checkUser)

module.exports = router
