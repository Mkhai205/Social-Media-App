interface IUser {
    _id: string;
    username: string;
    email: string;
    bio: string;
    role: string;
    photo: string;
    theme: string;
    isVerified: boolean;
    friends: string[];
    friendRequests: string[];
    lastSeen: string;
    createdAt: string;
    updatedAt: string;
}

interface IMessage {
    _id: string;
    chatId: string;
    senderId: string;
    receiverId: string;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface IChat {
    _id: string;
    messages?: IMessage[];
    participants: string[];
    participantsData?: IUser[];
    createdAt: string;
    updatedAt: string;
}

export type { IUser, IMessage, IChat };