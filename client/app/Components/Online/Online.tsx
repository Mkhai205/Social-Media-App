"use client";
import { useChatContext } from "@/context/chatContext";
import { IChat, IUser } from "@/types/type";
import Image from "next/image";
import React from "react";

function Online() {
    const { onlineUsers, handleSelectedChat, allChatsData } = useChatContext();

    console.log("🚀 -> Online.tsx:10 -> Online -> onlineUsers:", onlineUsers);

    const getChat = (id: string) => {
        const chat = allChatsData.find((chat: IChat) =>
            chat.participants.includes(id)
        );

        if (chat) {
            handleSelectedChat(chat);
        }
    };
    return (
        <div
            className="h-full relative flex flex-col overflow-hidden bg-gradient-to-br from-white via-blue-50/30 
            to-purple-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-purple-900/10"
        >
            {/* Header Section */}
            <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <h2
                    className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text 
                    text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-300"
                >
                    Online Friends
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {onlineUsers?.length}{" "}
                        {onlineUsers?.length === 1 ? "Friend" : "Friends"}{" "}
                        Online
                    </p>
                </div>
            </div>

            {/* Friends List */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 
                dark:scrollbar-thumb-gray-600"
            >
                {onlineUsers?.map((user: IUser) => {
                    return (
                        <div
                            key={user?._id}
                            className="group px-4 py-4 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-gray-800/60 
                            border border-gray-200/50 dark:border-gray-700/50 cursor-pointer
                            hover:bg-white/90 dark:hover:bg-gray-800/80 hover:shadow-lg hover:scale-[1.02]
                            transition-all duration-300 ease-out hover:border-blue-300/50 dark:hover:border-blue-500/50"
                            onClick={() => getChat(user._id)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Profile Image with Status */}
                                <div className="relative">
                                    <div
                                        className="relative overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-700 
                                        group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all duration-300"
                                    >
                                        <Image
                                            src={user?.photo}
                                            width={56}
                                            height={56}
                                            className="rounded-full aspect-square object-cover 
                                            transition-transform duration-300 ease-out"
                                            alt="profile"
                                        />
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-3 
                                        border-white dark:border-gray-800 shadow-lg animate-pulse"
                                    ></div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className="font-semibold text-gray-900 dark:text-white truncate 
                                            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors 
                                            duration-200"
                                        >
                                            {user?.username}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs font-medium">
                                            <span className="text-green-600 dark:text-green-400">
                                                Online
                                            </span>
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Active now
                                    </p>
                                </div>

                                {/* Chat Arrow Indicator */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg
                                        className="w-5 h-5 text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fade Gradient for Long Lists */}
            {onlineUsers?.length > 6 && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent pointer-events-none"></div>
            )}

            {/* Empty State */}
            {onlineUsers?.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No friends online
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Your friends will appear here when they come online
                    </p>
                </div>
            )}
        </div>
    );
}

export default Online;
