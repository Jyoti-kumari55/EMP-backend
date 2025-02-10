require("./db/dbConnect");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const userRoutes = require('./routes/user');
const startSocketServer = require('./routes/socket');

const app = express();
const PORT = 5000;

dotenv.config();
const corsOptions = {
  origin: "http://localhost:3000",
  // methods: ['GET', 'POST', 'DELETE', 'PUT'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionSuccessStatus: 200,
};



app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// // DB connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/user', userRoutes);

app.get("/", (req, res) => {
    res.send("Hello, Event App");
  });
// Start Socket Server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
startSocketServer(server);


// app.listen(PORT, () => {
//   console.log(`Server is running on ${PORT}.`);
// });
