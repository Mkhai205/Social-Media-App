"use client";

import { useChatContext } from "@/context/chatContext";
import { useUserContext } from "@/context/userContext";
import { IMessage, IUser } from "@/types/type";
import { formatDateBasedOnTime } from "@/utils/date";
import { readReceipts } from "@/utils/icons";
import Image from "next/image";
import React from "react";

interface ChatItemProps {
    user: IUser;
    active: boolean;
    onClick: () => void;
    chatId: string;
}

function ChatItem({ user, active, onClick, chatId }: ChatItemProps) {
    const { getAllMessages, onlineUsers } = useChatContext();
    const { photo } = user;
    const userId = useUserContext().user?._id;

    // local state
    const [lastMessage, setLastMessage] = React.useState<IMessage | null>(null);

    // fetch messages for the chat
    const allMessages = React.useCallback(async () => {
        const fetchedMessages = await getAllMessages(chatId, 1, 0, "desc");

        setLastMessage(fetchedMessages[0] || null);
    }, [getAllMessages, chatId, setLastMessage]);

    React.useEffect(() => {
        allMessages();
    }, [allMessages, chatId]);

    const isUserOnline = React.useMemo(() => {
        return onlineUsers.some(
            (onlineUser: IUser) => onlineUser._id === user._id
        );
    }, [onlineUsers, user._id]);

    return (
        <div
            className={`px-4 py-3 flex gap-2 items-center border-b-2 border-white dark:border-[#3C3C3C]/65 cursor-pointer ${
                active ? "bg-blue-100 dark:bg-white/5" : ""
            }`}
            onClick={onClick}
        >
            <div className="relative inline-block">
                {photo && (
                    <Image
                        src={photo}
                        alt="Profile Picture"
                        width={42}
                        height={42}
                        className="rounded-full aspect-square object-cover border-2 border-[white] dark:border-[#3C3C3C]/65 cursor-pointer
            hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                )}

                <div
                    className={`absolute bottom-0 right-0 w-[13px] h-[13px] rounded-full border-white border-2
            ${isUserOnline ? "bg-green-500" : "bg-red-500"}
        `}
                ></div>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium">{user.username}</h4>
                    <p className="text-[#aaa] text-sm">
                        {lastMessage?.createdAt
                            ? formatDateBasedOnTime(lastMessage.createdAt)
                            : ""}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <p className=" text-sm text-[#aaa]">
                        {lastMessage?.senderId === userId
                            ? "You: " +
                              (lastMessage && lastMessage?.content?.length > 20
                                  ? lastMessage?.content.substring(0, 20) +
                                    "..."
                                  : lastMessage?.content)
                            : lastMessage && lastMessage?.content?.length > 25
                            ? lastMessage?.content.substring(0, 25) + "..."
                            : lastMessage?.content || "No Messages"}
                    </p>

                    {lastMessage?.senderId === userId ? (
                        <div className="text-[#7263f3]">{readReceipts}</div>
                    ) : (
                        <div className="flex items-center justify-center w-[8px] h-[8px] bg-red-500 rounded-full"></div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatItem;
