const express = require('express');
const Event = require('../models/eventModel');
const isAuthenticated = require('../config/verify');
const User = require('../models/userModel');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Create Event
// router.post('/create', isAuthenticated, async (req, res) => {
//     const { eventName, eventDate, eventTime, location, description, eventImage } = req.body;
//     const ownerName = req.user.name;
//     const event = new Event({
//         eventName,
//         eventDate,
//         eventTime,
//         location,
//         description,
//         owner: ownerName,
//         eventImage,
//         members: [req.user]  // Assuming the creator joins automatically
//     });

//     try {
//         await event.save();
//         res.status(200).json({ message: 'Event created successfully', event });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Error creating event' });
//     }
// });


// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure uploads folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Avoid filename conflicts
    },
});

const upload = multer({ storage: storage });

// Endpoint to handle event creation
router.post('/create', isAuthenticated, upload.single('eventImage'), async (req, res) => {
    const { eventName, eventDate, eventTime, location, description } = req.body;

    if (!eventName || !location || !description) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findById(req.user);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const owner = {
            name: user.name, 
            userId: user._id
        };

        const event = new Event({
            eventName,
            eventDate,
            eventTime,
            location,
            description,
            owner,
            eventImage: req.file ? req.file.path : '', // File path of the uploaded image
            members: [req.user]
        });

        const savedEvent = await event.save();
        console.log("Event: ", savedEvent);
        res.status(200).json({ message: 'Event created successfully', event: savedEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating event' });
    }
});


// router.post('/create', isAuthenticated, async (req, res) => {
//     const { eventName, eventDate, eventTime, location, description, eventImage } = req.body;
    
//     try {
//         // Fetch the user by userId (req.user is just the userId after authentication)
//         const user = await User.findById(req.user);
        
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         const owner = {
//             name: user.name,   // Store user's name
//             userId: user._id
//         }  

//         const event = new Event({
//             eventName,
//             eventDate,
//             eventTime,
//             location,
//             description,
//             owner, // Store the owner's name here
//             eventImage,
//             members: [req.user]  // Store the user's ID in members array
//         });

//       const savedEvent =   await event.save();
//       console.log(savedEvent);
//         res.status(200).json({ message: 'Event created successfully', event: savedEvent });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error creating event' });
//     }
// });


// Get All Events
router.get('/events', async (req, res) => {
    const { category, date } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (date) filters.eventDate = { $gte: new Date(date) };

    try {
        const events = await Event.find(filters);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Get Event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching event' });
    }
});

// Update Event
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event.owner.userId.toString() !== req.user.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { eventName, eventDate, eventTime, location, description, eventImage } = req.body;
        event.eventName = eventName || event.eventName;
        event.eventDate = eventDate || event.eventDate;
        event.eventTime = eventTime || event.eventTime;
        event.location = location || event.location;
        event.description = description || event.description;
        event.eventImage = eventImage || event.eventImage;

        await event.save();
        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (err) {
        res.status(500).json({ message: 'Error updating event' });
    }
});

// Delete Event
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event.owner.userId.toString() !== req.user.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await event.deleteOne();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// Join Event
router.post('/:id/join', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.members.includes(req.user)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        event.members.push(req.user);
        await event.save();
        res.status(200).json({ message: 'Joined the event successfully', event });
    } catch (err) {
        res.status(500).json({ message: 'Error joining event' });
    }
});

// Get Attendees List
router.get('/:id/attendees', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json(event.members);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching attendees' });
    }
});

module.exports = router;
