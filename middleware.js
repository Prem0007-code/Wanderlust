const Listing =require("./models/listing");
const  ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) =>{
    if( !req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error"," you must be logged into create listing");
         return res.redirect("/login");
}
next();
}
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
module.exports.isOwnwer = async (req,res,next)=>{
    let { id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission ");
        return res.redirect(`/listings/${id}`); 
    }
     next();
};
