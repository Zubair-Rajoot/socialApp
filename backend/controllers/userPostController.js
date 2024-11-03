const UserPost = require('../Models/userPostModel');
// Create Post

const createPost = async function(req, res) {
    try {
        console.log("Request Body:", req.body);
        console.log("Uploaded File:", req.file);
        console.log("User Info:", req.user);

        const { postContent } = req.body;
        const postPicture = req.file ? req.file.filename : null; 

        if (!postContent) {
            return res.status(400).json({ message: 'Content is required' });
        }
        if (!req.user || !req.user.email) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        const newPost = new UserPost({
            name: req.user?.name || "unknown user", 
            email: req.user.email,
            postContent,
            postPicture 
        });
        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error post issue", error: err.message });
    }
};




// Get all posts
const getAllPosts = async function(req, res) {
    try {
        let posts = await UserPost.find();
        res.status(200).json({ posts });
        console.log("Request Body:", req.body);
console.log("Uploaded File:", req.file);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Get all posts of the logged-in user
const getUserPosts = async function(req, res) {
    try {
        
        const userName = req.user.name; 
        const userEmail = req.user.email; 
        const userPosts = await UserPost.find({ email: userEmail, name: userName }); 

        if (!userPosts.length) {
            return res.status(404).json({ message: "No posts found for this user" });
        }

        res.status(200).json({ posts: userPosts });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Update Post
const updatePost = async function(req, res) {
    try {
        const { id } = req.params;
        const { postContent } = req.body;
        const postPicture = req.file ? req.file.filename : null;

        const updateData = {
            ...(postContent && { postContent }),
            ...(postPicture && { postPicture })
        };

        const updatedPost = await UserPost.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post nahi mili' });
        }

        res.status(200).json({
            message: "post updated successfully",
            updatedPost
        });
    } catch (error) {
        console.error("Error in accessing post:", error);
        res.status(500).json({ message: "Error in accessing post", error: error.message });
    }
};


// Delete Post
const deletePost = async function(req, res) {
    try {
        const { id } = req.params;

        const deletedPost = await UserPost.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).send('Post not found');
        }

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
};



// Like a Post
const likePost = async function(req, res) {
    try {
        const postId = req.params.id;
        let post = await UserPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.likes += 1;
        await post.save();
        res.status(200).json({ message: "Post liked", post });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};







// Dislike a Post
const dislikePost = async function(req, res) {
    try {
        const postId = req.params.id;
        let post = await UserPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.dislikes += 1;
        await post.save();
        res.status(200).json({ message: "Post disliked", post });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};




// Comment on a Post
const commentOnPost = async function(req, res) {
    try {
        const postId = req.params.id;
        const { comment } = req.body; // Front-end ka data match karne ke liye 'comment' ka istemal karein

        let post = await UserPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post nahi mili" });
        }

        post.comments.push({
            userName: req.user.name,
            commentText: comment 
        });

        await post.save();
        res.status(200).json({ message: "Comment add ho gaya", post });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



module.exports = {createPost,getAllPosts, getUserPosts, updatePost, deletePost, likePost, dislikePost,  commentOnPost}
