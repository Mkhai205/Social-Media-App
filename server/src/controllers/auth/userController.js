import expressAsyncHandler from "express-async-handler";
import UserModel from "../../models/auth/UserModel.js";
import TokenModel from "../../models/auth/TokenModel.js";
import { generateToken, verifyToken } from "../../helpers/generateToken.js";
import { hashToken, verificationToken } from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";
import "dotenv/config";

/**
 * @desc   Register a new user
 * @route  POST /api/v1/register
 * @access Public
 */
const registerUser = expressAsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    // check password length
    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Create new user - password will be hashed automatically by pre middleware
    const user = await UserModel.create({
        username,
        email,
        password, // Raw password - will be hashed by pre middleware
    });

    if (!user) {
        return res.status(500).json({ message: "User registration failed" });
    }

    // Generate token with user ID
    const token = generateToken({ id: user._id });

    // Set token in cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
        secure: true, // Set to true if using HTTPS
    });

    res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        photo: user.photo,
        bio: user.bio,
        isVerified: user.isVerified,
        theme: user.theme,
        friends: user.friends,
        friendRequests: user.friendRequests,
        lastSeen: user.lastSeen,
        token: token,
    });
});

/**
 * @desc   Login user
 * @route  POST /api/v1/login
 * @access Public
 */
const loginUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    // Compare password using the model method
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid password" });
    }

    // Generate token with user ID
    const token = generateToken({ id: user._id });

    // Set token in cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
        secure: true, // Set to true if using HTTPS
    });

    res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        photo: user.photo,
        bio: user.bio,
        isVerified: user.isVerified,
        theme: user.theme,
        friends: user.friends,
        friendRequests: user.friendRequests,
        lastSeen: user.lastSeen,
        token: token,
    });
});

/**
 * @desc   Logout user
 * @route  POST /api/v1/logout
 * @access Private
 */
const logoutUser = expressAsyncHandler(async (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({ message: "User logged out successfully" });
});

/**
 * @desc   Get user information
 * @route  GET /api/v1/user
 * @access Private(Creator, Admin)
 */
const getUser = expressAsyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        photo: user.photo,
        bio: user.bio,
        isVerified: user.isVerified,
        theme: user.theme,
        friends: user.friends,
        friendRequests: user.friendRequests,
        lastSeen: user.lastSeen,
    });
});

/**
 * @desc   Update user information
 * @route  PATCH /api/v1/user
 * @access Private
 */
const updateUser = expressAsyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.username = req.body.username || user.username;
    user.photo = req.body.photo || user.photo;
    user.bio = req.body.bio || user.bio;
    user.role = req.body.role || user.role;
    user.theme = req.body.theme || user.theme;
    user.friends = req.body.friends || user.friends;
    user.friendRequests = req.body.friendRequests || user.friendRequests;
    user.lastSeen = req.body.lastSeen || user.lastSeen;
    user.isVerified =
        req.body.isVerified !== undefined
            ? req.body.isVerified
            : user.isVerified;

    const updatedUser = await user.save();

    if (!updatedUser) {
        return res.status(500).json({ message: "User update failed" });
    }

    res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        photo: updatedUser.photo,
        bio: updatedUser.bio,
        isVerified: updatedUser.isVerified,
        theme: updatedUser.theme,
        friends: updatedUser.friends,
        friendRequests: updatedUser.friendRequests,
        lastSeen: updatedUser.lastSeen,
    });
});

/**
 * @desc   Check user login status
 * @route  GET /api/v1/login-status
 * @access Public
 */
const userLoginStatus = expressAsyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ isLoggedIn: false });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ isLoggedIn: false });
    } else {
        return res.status(200).json({ isLoggedIn: true });
    }
});

/**
 * @desc   Verify user email
 * @route  POST /api/v1/verify-email
 * @access Private
 */
const verifyEmail = expressAsyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already verified
    if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
    }

    // Update user verification status
    const token = await TokenModel.findOne({ userId: user._id });

    // If token exits --> delete the token
    if (token) {
        await TokenModel.deleteOne({ userId: user._id });
    }

    // Create a new verification token using the user ID --> crypto
    const verificationTokenString = verificationToken(user._id.toString());

    // Hash the verification token
    const hashedToken = hashToken(verificationTokenString); // Create a new token document

    await TokenModel.create({
        userId: user._id,
        verificationToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Verification link
    const CLIENT_URL = process.env.CLIENT_URL;
    const verificationLink = `${CLIENT_URL}/verify-email/${verificationTokenString}`;

    // Send verification email
    const subject = "Email Verification - Authentication App";
    const send_to = user.email;
    const sent_from = process.env.USER_EMAIL;
    const reply_to = process.env.USER_EMAIL;
    const template = "verifyEmailTemplate";
    const name = user.username;
    const link = verificationLink;

    try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link
        );
        return res
            .status(200)
            .json({ message: "Verification email sent successfully" });
    } catch (error) {
        console.error("Error sending verification email:", error);
        return res
            .status(500)
            .json({ message: "Failed to send verification email" });
    }
});

/**
 * @desc   Verify user email using token
 * @route  GET /api/v1/verify-user/:verificationToken
 * @access Public
 */
const verifyUser = expressAsyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        return res
            .status(400)
            .json({ message: "Invalid verification request" });
    }

    // Verify the token
    const hashedToken = hashToken(verificationToken);
    const token = await TokenModel.findOne({
        verificationToken: hashedToken,
        expiresAt: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!token) {
        return res
            .status(400)
            .json({ message: "Invalid or expired verification token" });
    }

    // Find the user associated with the token
    const user = await UserModel.findById(token.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already verified
    if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    // Delete the token after successful verification
    await TokenModel.deleteOne({ userId: user._id });

    res.status(200).json({ message: "User verified successfully" });
});

/**
 * @desc   Forgot password
 * @route  POST /api/v1/forgot-password
 * @access Public
 */
const forgotPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
        return res
            .status(400)
            .json({ message: "Please provide an email address" });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if token exists
    const existingToken = await TokenModel.findOne({ userId: user._id });
    if (existingToken) {
        await existingToken.deleteOne(); // Delete existing token if it exists
    }

    // Create a password reset token
    const resetToken = verificationToken(user._id.toString());
    const hashedToken = hashToken(resetToken);

    // Create a token document
    await TokenModel.create({
        userId: user._id,
        verificationToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Password reset link
    const CLIENT_URL = process.env.CLIENT_URL;
    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    const subject = "Password Reset - Authentication App";
    const send_to = user.email;
    const sent_from = process.env.USER_EMAIL;
    const reply_to = process.env.USER_EMAIL;
    const template = "forgotPasswordTemplate";
    const name = user.username;
    const link = resetLink;

    try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link
        );
        return res
            .status(200)
            .json({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return res
            .status(500)
            .json({ message: "Failed to send password reset email" });
    }
});

/**
 * @desc   Reset password
 * @route  POST /api/v1/reset-password/:resetPasswordToken
 * @access Public
 */
const resetPassword = expressAsyncHandler(async (req, res) => {
    const { resetPasswordToken } = req.params;
    const { password } = req.body;

    if (!resetPasswordToken || !password) {
        return res.status(400).json({ message: "Invalid request" });
    }

    // hash the reset token
    const hashedToken = hashToken(resetPasswordToken);

    // Find the token in the database
    const tokenUser = await TokenModel.findOne({
        verificationToken: hashedToken,
        expiresAt: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!tokenUser) {
        return res
            .status(400)
            .json({ message: "Invalid or expired password reset token" });
    }

    // Find the user associated with the token
    const user = await UserModel.findById(tokenUser.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if password is valid
    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters long" });
    }

    // Update user password
    user.password = password; // This will trigger the pre-save middleware to hash the password
    const updatedUser = await user.save();

    if (!updatedUser) {
        return res.status(500).json({ message: "Password reset failed" });
    }

    // Delete the token after successful password reset
    await TokenModel.deleteOne({ userId: user._id });

    res.status(200).json({ message: "Password reset successfully" });
});

/**
 *  @desc   Change user password
 *  @route  PATCH /api/v1/change-password
 *   @access Private
 */
const changePassword = expressAsyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        return res
            .status(400)
            .json({ message: "Please provide current and new passwords" });
    }

    // Check if new password is valid
    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password must be at least 6 characters long",
        });
    }

    // Find the user
    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Compare current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res
            .status(400)
            .json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword; // This will trigger the pre-save middleware to hash the password
    const updatedUser = await user.save();

    if (!updatedUser) {
        return res.status(500).json({ message: "Password change failed" });
    }

    res.status(200).json({ message: "Password changed successfully" });
});

/**
 *  @desc   Search users by username or email
 *  @route  GET /api/v1/search-users
 *   @access Private
 */
const searchUsers = expressAsyncHandler(async (req, res) => {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    try {
        if (!query) {
            return res
                .status(400)
                .json({ message: "Search query is required" });
        }

        // Use regex for case-insensitive search
        const regex = new RegExp(query, "i");

        // Search users by username or email
        const users = await UserModel.find({
            $or: [{ username: regex }, { email: regex }],
            _id: { $ne: req.user._id }, // Exclude current user
        })
            .select("-password") // Exclude password from results
            .skip(skip)
            .limit(limit);

        // Get total count of matching users
        const totalCount = await UserModel.countDocuments({
            $or: [{ username: regex }, { email: regex }],
            _id: { $ne: req.user._id }, // Exclude current user
        });

        res.status(200).json({
            data: users,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalResults: totalCount,
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 *  @desc   Send a friend request
 *  @route  POST /api/v1/friend-request
 *    @access Private
 */
const friendRequest = expressAsyncHandler(async (req, res) => {
    const { friendId } = req.body;

    // Validate input
    if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
    }

    // Find the user and the friend
    const user = await UserModel.findById(req.user._id);
    const friend = await UserModel.findById(friendId);

    if (!user || !friend) {
        return res.status(404).json({ message: "User or friend not found" });
    }

    // Check if already friends or friend request exists
    if (user.friends.includes(friendId)) {
        return res.status(400).json({ message: "You are already friends" });
    }
    if (user.friendRequests.includes(friendId)) {
        return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add user to friend's friend requests
    friend.friendRequests.push(user._id);
    await friend.save();

    res.status(200).json({ message: "Friend request sent successfully" });
});

const acceptFriendRequest = expressAsyncHandler(async (req, res) => {
    const { friendId } = req.body;

    // Validate input
    if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
    }

    // Find the user and the friend
    const user = await UserModel.findById(req.user._id);
    const friend = await UserModel.findById(friendId);

    if (!user || !friend) {
        return res.status(404).json({ message: "User or friend not found" });
    }

    // Check if friend request exists
    if (!user.friendRequests.includes(friend._id)) {
        return res.status(400).json({ message: "No friend request found" });
    }

    // Accept friend request
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    // Remove friend request
    user.friendRequests.pull(friend._id);
    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend request accepted successfully" });
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    userLoginStatus,
    verifyEmail,
    verifyUser,
    forgotPassword,
    resetPassword,
    changePassword,
    searchUsers,
    friendRequest,
    acceptFriendRequest,
};
