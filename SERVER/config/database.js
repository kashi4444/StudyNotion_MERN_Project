const mongoose = require("mongoose");
require("dotenv").config();
const dbConnect = ()=>{
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=>{
        console.log("DB Connection Successfull");
    })
    .catch((err)=>{
        console.log("Issue in DB Connection");
        console.error(err);
        process.exit(1);
    })
}

module.exports = dbConnect;