"use client";
import { useChatContext } from "@/context/chatContext";
import { useGlobalContext } from "@/context/globalContext";
import { block, trash, xMark } from "@/utils/icons";
import Image from "next/image";
import React from "react";

function FriendProfile() {
    const { activeChatData } = useChatContext();
    const { handleFriendProfile, showFriendProfile } = useGlobalContext();

    const { photo } = activeChatData || {};
    return (
        <div className="py-6 h-full flex flex-col justify-between bg-gradient-to-b from-white/5 to-transparent dark:from-slate-800/10 dark:to-transparent backdrop-blur-sm rounded-xl shadow-lg">
            <div className="flex flex-col items-center">
                <button
                    className="px-4 self-start p-2 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800/40 rounded-lg transition-all duration-200"
                    onClick={() => handleFriendProfile(!showFriendProfile)}
                >
                    <span className="text-gray-600 dark:text-white/80 hover:text-gray-800 dark:hover:text-white">
                        {xMark}
                    </span>
                    <span className="text-[16px] font-medium">
                        Contact Info
                    </span>
                </button>
                <div className="relative mt-6 mb-2">
                    <Image
                        src={photo}
                        alt="Profile Picture"
                        width={120}
                        height={120}
                        className="rounded-full aspect-square object-cover border-4 border-white dark:border-gray-700 cursor-pointer
                hover:scale-105 transition-all duration-300 ease-out shadow-md hover:shadow-xl"
                    />
                </div>

                <h2 className="mt-3 px-4 font-bold self-center text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {activeChatData?.username}
                </h2>
                <p className="self-center text-gray-600 dark:text-gray-300 text-sm">
                    {activeChatData?.email}
                </p>

                <div className="mt-8 py-4 w-full border-t border-gray-200 dark:border-gray-700/50 self-start flex flex-col">
                    <span className="px-6 font-semibold text-[16px] text-gray-800 dark:text-slate-200">
                        About
                    </span>
                    <span className="px-6 py-2 text-gray-600 dark:text-white/70 text-sm">
                        {activeChatData?.bio || "No bio available"}
                    </span>
                </div>
            </div>
            <div className="px-4 pt-4 flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700/50 mt-auto">
                <button className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-medium self-start p-2 text-xl grid grid-cols-[24px_1fr] items-center gap-4 rounded-lg transition-colors duration-200 w-full">
                    <span className="flex items-center justify-center">
                        {block}
                    </span>
                    <span className="text-[15px]">Unfriend User</span>
                </button>
                <button className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-medium self-start p-2 text-xl grid grid-cols-[24px_1fr] items-center gap-4 rounded-lg transition-colors duration-200 w-full mb-2">
                    <span className="flex items-center justify-center">
                        {trash}
                    </span>
                    <span className="text-[15px]">Delete Chat</span>
                </button>
            </div>
        </div>
    );
}

export default FriendProfile;
