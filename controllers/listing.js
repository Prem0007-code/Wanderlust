const Listing = require("../models/listing");
module.exports.index =
    async (req, res) => {
        try {
            const allListings = await Listing.find({});
            res.render("listings/index.ejs", { allListings });
        } catch (err) {
            console.log("Error fetching listings:", err);
            res.status(500).send("Internal Server Error");
        }
};