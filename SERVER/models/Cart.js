const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cartContent:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }]

})
module.exports = mongoose.model("Cart", cartSchema);