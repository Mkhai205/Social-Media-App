import express from "express";
import {
    createChat,
    createMessage,
    getAllUserChats,
    getMessagesForChat,
    getUserById,
} from "../controllers/messages/messagesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/chats", protect, createChat);
router.get("/chats/:userId", protect, getAllUserChats);

// Messages routes
router.post("/messages", protect, createMessage);
router.get("/messages/:chatId", protect, getMessagesForChat);

// Get user by ID
router.get("/users/:userId", protect, getUserById);

export default router;
