if (process.env.NODE_ENV !== "production") { //we are in developpment mode and not production
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');


const usersRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig));
app.use(flash());



//configuration passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //how we store a user in a session
passport.deserializeUser(User.deserializeUser());//how to get user out of a session 



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', usersRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})














//before restructing



// const express = require('express');
// const path = require('path');
// const mongoose = require('mongoose');
// const ejsMate = require('ejs-mate');
// const { campgroundSchema, reviewSchema } = require('./schemas');
// const catchAsync = require('./utilities/catchAsync');
// const ExpressError = require('./utilities/ExpressError');
// const methodOverride = require('method-override');
// const Campground = require('./models/campground');
// const Review = require('./models/review');


// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: true
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

// const app = express();

// app.engine('ejs', ejsMate)

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'))

// app.use(express.urlencoded({ extended: true }))
// app.use(methodOverride('_method'))


// const validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body)
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body)
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }


// app.get('/', (req, res) => {
//     res.render('home')
// })

// app.get('/campgrounds', catchAsync(async (req, res) => {
//     const campgrounds = await Campground.find({});
//     res.render('campgrounds/index', { campgrounds })
// }))
// app.get('/campgrounds/new', (req, res) => {
//     res.render('campgrounds/new');

// })

// app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
//     // if (!req.body.Campground) throw new ExpressError('400', 'Invalid Campground data')
//     const campground = new Campground(req.body.campground)
//     await campground.save();
//     res.redirect(`campgrounds/${campground._id}`)
// }))

// app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
//     const campground = await Campground.findById(req.params.id);
//     campground.populate('reviews');
//     res.render('campgrounds/show', { campground });
// }));


// // app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
// //     const { id } = req.params;
// //     const campground = await Campground.findById(id).populate('reviews');
// //     console.log(campground)
// //     res.render('campgrounds/show', { campground });
// // }));

// app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id)
//     res.render('campgrounds/edit', { campground });
// }))

// app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
//     // res.send('IT WORKED!!')
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
//     res.redirect(`/campgrounds/${campground._id}`)
// }))

// app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }))

// app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
//     // const { id } = req.params;
//     // const { review, rating } = req.body;
//     // kifech declarina lname mtaa chq element fi west tableau heya li khaletni najem naamel faza kima haka  
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.reviews)
//     campground.reviews.push(review)
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// app.all('*', (req, res, next) => {
//     next(new ExpressError('404', 'page not found'))
// })

// app.use((err, req, res, next) => {
//     const { status = 500 } = err;
//     if (!err.message) err.message = 'Oh No, Something Went Wrong!';
//     res.status(status).render('error', { err })
//     // res.send('OH NO !, Something went wrong :(')
// })

// app.listen(3000, () => {
//     console.log('Serving on port 3000')
// })