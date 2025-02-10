const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    eventDate: {
         type: Date, 
         require: true 
        },
    eventTime: String,
    owner: {
        type: Object,
        required: true
    },  
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    members: [String],
    eventImage: {
        type: String,
    }
})

module.exports = new mongoose.model('EventInfo', eventSchema);