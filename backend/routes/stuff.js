const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');
const { upload, resizeImage } = require('../middleware/multer-config.js');
const auth = require('../middleware/auth.js');

router.get('/', stuffCtrl.getAllBooks);
router.get('/bestrating', stuffCtrl.getBestRatedBooks);
router.post('/', auth, upload.single('image'), resizeImage, stuffCtrl.createBook);
router.get('/:id', stuffCtrl.getOneBook);
router.put('/:id', auth, upload.single('image'), resizeImage, stuffCtrl.modifyBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.post('/:id/rating', auth, stuffCtrl.rateBook);

module.exports = router;
