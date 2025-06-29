import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
        lastModified: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const ChatModel = mongoose.model("Chat", ChatSchema);

export default ChatModel;
