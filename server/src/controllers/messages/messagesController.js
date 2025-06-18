import expressAsyncHandler from "express-async-handler";
import UserModel from "../../models/auth/UserModel.js";
import ChatModel from "../../models/messages/ChatModel.js";
import MessagesModel from "../../models/messages/MessagesModel.js";

/**
 * @desc Create a new chat between two users
 * @route POST /api/chats
 * @access Private
 */
const createChat = expressAsyncHandler(async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Sender ID and Receiver ID are required" });
        }

        const newChat = await ChatModel.create({
            participants: [senderId, receiverId],
        });

        if (!newChat) {
            return res.status(500).json({ message: "Failed to create chat" });
        }

        res.status(201).json({
            message: "Chat created successfully",
            chat: newChat,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * @desc Get all chats for a specific user
 * @route GET /api/chats/:userId
 * @access Private
 */
const getAllUserChats = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Find all chats where the user is a participant in the chat
        // and sort them by lastModified date
        const chats = await ChatModel.find({
            participants: { $in: [userId] },
        }).sort({ lastModified: -1 });

        if (!chats) {
            return res.status(404).json({ message: "No chats found for this user" });
        }

        res.status(200).json({
            message: "Chats retrieved successfully",
            chats,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * @desc Create a new message in a chat
 * @route POST /api/messages
 * @access Private
 */
const createMessage = expressAsyncHandler(async (req, res) => {
    try {
        const { chatId, senderId, receiverId, content } = req.body;

        if (!chatId || !senderId || !receiverId || !content) {
            return res
                .status(400)
                .json({ message: "Chat ID, Sender ID, Receiver ID, and Content are required" });
        }

        const newMessage = await MessagesModel.create({
            chatId,
            senderId,
            receiverId,
            content,
        });

        if (!newMessage) {
            return res.status(500).json({ message: "Failed to create message" });
        }

        // Optionally update the lastModified field in the chat
        await ChatModel.findByIdAndUpdate(chatId, { lastModified: new Date() });

        res.status(201).json({
            message: "Message created successfully",
            message: newMessage,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * @desc Get messages for a specific chat
 * @route GET /api/messages/:chatId
 * @access Private
 */
const getMessagesForChat = expressAsyncHandler(async (req, res) => {
    try {
        const { limit, offset, sort } = req.query;
        const chatId = req.params.chatId;

        const limitNumber = parseInt(limit, 10) || 10; // Default limit to 10 if not provided
        const offsetNumber = parseInt(offset, 10) || 0; // Default offset to 0 if not provided
        const sortOrder = sort || "asc"; // Default sort order to ascending if not provided

        const messages = await MessagesModel.find({ chatId })
            .limit(limitNumber)
            .skip(offsetNumber)
            .sort({ createdAt: sortOrder === "asc" ? 1 : -1 });

        res.status(200).json({
            message: "Messages retrieved successfully",
            messages,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * @desc Get user details by user ID
 * @route GET /api/users/:userId
 * @access Private
 */
const getUserById = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export { createChat, getAllUserChats, createMessage, getMessagesForChat, getUserById };
