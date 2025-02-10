const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6,       
    }, 
    bio: {
        type: String,
    }
});
const User = mongoose.model('EventUser', userSchema);
module.exports = User;