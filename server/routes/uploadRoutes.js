const express = require('express');
const router = express.Router();
const { uploadMedia, deleteMedia } = require('../controllers/uploadController');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.post('/', upload.single('media'), uploadMedia);
router.delete('/:id', deleteMedia);

module.exports = router;
