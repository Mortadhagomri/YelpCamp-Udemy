const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN; //sna3na jeton mteena 
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // hedhi feha les 2 methodes li bich nestaamlouhom "forword" w "reverse" (men text trodou coordonnées netaamlouh fel map mteena  Map box) 
const { cloudinary } = require('../cloudinary')


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCamground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "Successfully made a new campground !!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    console.log(campground)
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    // console.log(campground)
    res.render("campgrounds/edit", { campground });
};

module.exports.updateCamground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        }); //bich tpulli (extraire) à partir les "images" eli filname mteehom mawjouf fel req.body
        // console.log(campground)
    }
    req.flash("success", "Successfully updated");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCamground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted successfully !!");
    res.redirect("/campgrounds");
};
