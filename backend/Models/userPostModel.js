const mongoose = require('mongoose');

const userPostSchema = new mongoose.Schema({
    name: {
        type: String,
       
    },

    email: {
        type: String,
     
    },
    postPicture: {
        type: String,
        required: false
    },


    postContent: {
        type: String,
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },

    
    comments: [
        {
            userName: String,
            commentText: String,
            commentDate: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserPost', userPostSchema);
