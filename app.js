if(process.env.NODE_ENV != "production"){
require("dotenv").config();
}
console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

// Connect to MongoDB
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("Connected to database");
};

main()
    .then(() => {
        console.log("Connected to DB successfully!");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

// View Engine and Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session config
const sessionOptions = {
    secret: "radheradhe",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 🔥 Flash messages + current user available in all views
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    console.log(res.locals.success);
    res.locals.error = req.flash("error");

    next();
});

// DEMO route to register a fake user (optional)
app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });
    const newUser = await User.register(fakeUser, "password@");
    res.send(newUser);
});

// Test route to create a listing (optional)
const Listing = require("./models/listing.js");
app.get("/testListing", async (req, res) => {
    try {
        let sampleListing = new Listing({
            title: "My New Villa",
            description: "By the beach",
            price: 1200,
            location: "Goa",
            country: "India",
        });

        await sampleListing.save();
        console.log("Sample was saved");
        res.send("Successful testing");
    } catch (err) {
        console.log("Error saving test listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Routes
app.use("/", user);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Root route


// 404 handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
