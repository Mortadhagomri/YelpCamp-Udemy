const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const campgrounds = require('../contollers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index')
const upload = multer({ storage }); //maadch fel uplouds (cad localement)
// const upload = multer({ dest: 'uploads/' }); //bich yaamel dossier esmou uploads yhot fih uploaded images

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCamground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCamground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamground));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;