const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const  ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");

const Listing = require("../models/listing.js");
const {isLoggedIn,isOwnwer} = require("../middleware.js");
const listingcontroller = require("../controllers/listing.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


const validateListing = (req,res,next) => {
    let { error} = listingSchema.validate(req.body);
    if (error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
};
router.get("/",async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.log("Error fetching listings:", err);
        res.status(500).send("Internal Server Error");
    }
}
);
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});


// Route to display a single listing by its ID
router.get("/:id", async (req, res) => {
    let { id } = req.params;

    // ⬇️ This is the correct line to populate reviews
    const listing = await Listing.findById(id).populate( {path:"reviews",populate:{path:"author"}}).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.status(404).send("Listing not found");
    }
    console.log(listing);

    res.render("listings/show.ejs", { listing });  // Make sure you have a show.ejs (or other) file
});
router.post(
    "/",
    isLoggedIn,
    
    upload.single("listing[image]"),
    validateListing,
    async (req, res) => {
      try {
        console.log("------ New Listing Submission ------");
        console.log("REQ.BODY:", JSON.stringify(req.body, null, 2));
        console.log("REQ.FILE:", req.file);
        console.log("USER:", req.user);
  
        if (!req.body.listing) {
          console.log(" Error: Missing listing in request body.");
          return res.status(400).json({ error: "Missing listing object." });
        }
  
        const { title, description, price, location, country } = req.body.listing;
  
        if (!title || !description || !price || !location || !country) {
          console.log("Error: Required field missing");
          return res.status(400).json({ error: "All fields are required!" });
        }
  
        let url = "";
        let filename = "";
        if (req.file) {
          url = req.file.path;
          filename = req.file.filename;
        } else {
          console.log(" No image uploaded.");
        }
  
        const newListing = new Listing({
          title,
          description,
          price,
          location,
          country,
          owner: req.user._id,
          image: { url, filename }
        });
  
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
      } catch (err) {
        console.error(" ERROR creating listing:", err);
        req.flash("error", "Something went wrong.");
        res.status(500).send("Internal Server Error");
      }
    }
  );
  



  
router.get("/:id/edit", async(req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});
router.put("/:id", isLoggedIn,isOwnwer, upload.single("listing[image]"),async (req, res) => {
  
    let { id } = req.params;
      let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

      let url = "";
        let filename = "";
        if (req.file) {
          url = req.file.path;
          filename = req.file.filename;
        } else {
          console.log(" No image uploaded.");
        }
        listing.image ={url,filename};
        await listing.save();
     res.redirect(`/listings/${id}`);
});


router.delete("/:id",isLoggedIn,isOwnwer, async(req,res) => {

    let { id } = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success", "Listing deleted");
   res.redirect("/listings");
});
// post route reveiew

module.exports = router;

