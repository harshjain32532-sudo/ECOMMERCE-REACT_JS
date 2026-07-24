export async function resolveChatTargetUserId(payload, ChatMessage, parseOrderIdentifier, findOrderByIdentifier) {
    if (!payload) return null;

    if (payload.senderRole !== "admin") {
        return payload.recipientId && payload.recipientId !== payload.senderId ? payload.recipientId : null;
    }

    const explicitRecipientId = payload.recipientId && payload.recipientId !== payload.senderId
        ? payload.recipientId
        : null;
    if (explicitRecipientId) {
        return explicitRecipientId;
    }

    const targetUserId = payload.targetUserId && payload.targetUserId !== payload.senderId
        ? payload.targetUserId
        : null;
    if (targetUserId) {
        return targetUserId;
    }

    const conversationId = payload.conversationId;
    if (conversationId && typeof conversationId === "string") {
        const match = conversationId.match(/^seller:(.+)$/);
        if (match?.[1] && match[1] !== payload.senderId) {
            return match[1];
        }
    }

    const orderIdentifier = parseOrderIdentifier?.(payload.text || "");
    if (orderIdentifier) {
        const matchedOrder = await findOrderByIdentifier?.(orderIdentifier);
        if (matchedOrder?.userId) {
            return matchedOrder.userId;
        }
    }

    if (ChatMessage?.findOne) {
        const fallbackConversation = await ChatMessage.findOne({
            senderRole: "user",
            conversationId: { $regex: "^seller:" },
        }).sort({ createdAt: -1 }).lean();

        if (fallbackConversation?.conversationId) {
            const match = fallbackConversation.conversationId.match(/^seller:(.+)$/);
            if (match?.[1] && match[1] !== payload.senderId) {
                return match[1];
            }
        }
    }

    return null;
}

export async function persistChatMessage(ChatMessage, messageData) {
    const message = await ChatMessage.create(messageData);
    return message.toObject();
}


