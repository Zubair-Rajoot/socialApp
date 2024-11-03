// chatController.js
const Chat = require("../models/Chat"); // Import your Chat model

// Send Message
exports.sendMessage = async (req, res) => {
    try {
        const { message, recipientId } = req.body;
        const senderId = req.user._id; // Use the ID from the token to get the sender ID

        const newMessage = await Chat.create({ senderId, recipientId, message });
        
        // Emit the message event to the recipient
        req.io.to(recipientId).emit("receiveMessage", { senderId, message });

        res.status(201).json({ message: "Message sent successfully", newMessage });
    } catch (err) {
        res.status(500).json({ message: "Failed to send message", error: err.message });
    }
};

// Get Messages for a User
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user._id;

        const messages = await Chat.find({
            $or: [{ senderId: userId }, { recipientId: userId }]
        }).sort({ createdAt: 1 });

        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve messages", error: err.message });
    }
};
