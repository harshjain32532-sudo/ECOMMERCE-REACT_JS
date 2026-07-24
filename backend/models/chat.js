import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    conversationId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, default: "" },
    senderRole: { type: String, enum: ["user", "admin"], default: "user" },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientName: { type: String, default: "" },
    recipientRole: { type: String, enum: ["user", "admin"], default: "admin" },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    readAt: { type: Date, default: null },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
