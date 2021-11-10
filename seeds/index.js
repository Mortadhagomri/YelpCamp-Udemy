const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6086d65341806c16f84db9ed',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto,deserunt!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [

                {
                    url: 'https://res.cloudinary.com/mortadha/image/upload/v1619632112/YelpCamp/tsgcy0fcomz1kzgrb6vu.jpg',
                    filename: 'YelpCamp/tsgcy0fcomz1kzgrb6vu'
                },
                {
                    url: 'https://res.cloudinary.com/mortadha/image/upload/v1619632114/YelpCamp/vcaakpswmg3gxdjk0zrg.jpg',
                    filename: 'YelpCamp/vcaakpswmg3gxdjk0zrg'
                }

            ]

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})