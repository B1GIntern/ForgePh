const bcrypt = require('bcrypt');
const { User, validateUser } = require('../models/Users');
const { sendVerificationEmail } = require('../routes/emailverification');

const register = async (req, res) => {
    try {
        // Validate user input
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user with default values
        const user = new User({
            ...req.body,
            password: hashedPassword,
            verified: false,
            userStatus: 'Not Verified',
            points: 50,
            rewardsclaimed: [],
            rank: 'Bronze',
            registrationDate: new Date().toISOString()
        });

        // Save user to database
        const savedUser = await user.save();

        try {
            // Send verification email
            await sendVerificationEmail(savedUser.email, savedUser._id);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Continue with registration even if email fails
        }

        // Generate auth token
        const token = savedUser.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for verification.',
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phoneNumber: savedUser.phoneNumber || '',
                userType: savedUser.userType,
                userStatus: savedUser.userStatus,
                location: savedUser.location || { province: '', city: '' },
                points: savedUser.points,
                rewardsclaimed: savedUser.rewardsclaimed,
                birthdate: savedUser.birthdate,
                registrationDate: savedUser.registrationDate,
                rank: savedUser.rank,
                shopName: savedUser.shopName || ''
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
};

module.exports = {
    register
};