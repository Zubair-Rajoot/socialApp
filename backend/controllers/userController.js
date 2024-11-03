const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../Models/userModel");

const JWT_SECRET = "zubi@123!raj";




// Register User API
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

       
        const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
        const verificationExpires = Date.now() + 3600000; 

        user = new User({
            name,
            email,
            password,
            role,
            verificationToken,
            verificationExpires
        });

        await user.save();

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: "zubairraj30@gmail.com",
                pass: "nkrt asqn gcvy kfip"
            }
        });

        const verificationLink = `http://localhost:3000/user/verify?token=${verificationToken}`;
        
        const mailOptions = {
            from: "zubairfarooq688@gmail.com",
            to: email,
            subject: "Verify your email",
            html: `<p>Please verify your email by clicking the following link:</p><a href="${verificationLink}">${verificationLink}</a>`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "User registered successfully. Check your email to verify your account." });
    } catch (err) {
        console.error("Error during user registration:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



const verifyUser = async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "Verification token is missing." });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email, verificationToken: token });

        if (!user) return res.status(400).json({ message: "Invalid or expired verification token." });

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;

        await user.save();

        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (err) {
        res.status(400).json({ message: "Verification failed.", error: err.message });
    }
};


// Login User API
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid user email" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



// Get All Users -- Admin Only
const getAllUsers = async function(req, res) {
    try {
       
        let users = await User.find();
        res.status(200).json({ users });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


const logout = async function(rq, res){
    try {
        
    } catch (error) {
        
    }
}





module.exports = {registerUser, loginUser, getAllUsers,verifyUser }



