const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("Connected to database");
}

// Call `main()`, ensuring it's defined first
main()
    .then(() => {
        console.log("Connected to DB successfully!");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });
    const initDB = async()=>{
         await Listing.deleteMany({});
          initData.data = initData.data.map((obj) => ({...obj, owner: "67fdc333230ffd3ef48f0310"}) );
         await Listing.insertMany(initData.data);
         console.log(" data was initalised");
    };
    initDB();