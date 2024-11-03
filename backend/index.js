const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Import Controllers
const userController = require("./controllers/userController");
const postController = require("./controllers/userPostController");
const chatController = require("./controllers/chatController");

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure CORS
app.use(cors({
    origin: 'http://127.0.0.1:5501',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
    cors: {
        origin: "http://127.0.0.1:5501",
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization"],
    }
});

// Middleware
app.use(express.json());

// Multer setup for picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage }).single('postPicture');

// JWT Secret
const JWT_SECRET = "zubi@123!raj";

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Admin Authorization middleware
const adminAuthorization = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
};

// Routes
app.post('/user/register', userController.registerUser);
app.post('/user/login', userController.loginUser);
// app.post('/user/logout', userController.logoutUser);

app.get('/user/verify', userController.verifyUser);

app.get('/users', verifyToken, adminAuthorization, userController.getAllUsers);
app.post('/post', verifyToken, upload, postController.createPost);
app.get('/getposts', verifyToken, postController.getAllPosts);
app.get('/singleuserposts', verifyToken, postController.getUserPosts);
app.put('/post/update/:id', verifyToken, upload, postController.updatePost);
app.delete('/post/delete/:id', verifyToken, postController.deletePost);
app.post('/post/:id/like', verifyToken, postController.likePost);
app.post('/post/:id/dislike', verifyToken, postController.dislikePost);
app.post('/post/:id/comment', verifyToken, postController.commentOnPost);

// Chat routes
app.post('/chat/send', verifyToken, chatController.sendMessage);
app.get('/chat/getMessages', verifyToken, chatController.getMessages);

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/socialApp")
    .then(() => {
        console.log("MongoDB connected successfully");
        server.listen(3000, () => {
            console.log(`Server is running on port 3000`);
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Socket.IO connection for real-time chat
const users = {}; // Store mapping of user IDs to socket IDs

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId; // Assuming userId is passed in query params
    socket.join(userId); // Join a room with the userId

    socket.on('chatMessage', ({ message, recipientId }) => {
        io.to(recipientId).emit('receiveMessage', { senderId: userId, message }); // Send message to the recipient
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
