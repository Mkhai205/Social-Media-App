"use client";

import { useChatContext } from "@/context/chatContext";
import { useGlobalContext } from "@/context/globalContext";
import { IUser } from "@/types/type";
import { formatDateLastSeen } from "@/utils/date";
import { dots, searchIcon } from "@/utils/icons";
import Image from "next/image";
import React from "react";

function Header() {
    const { activeChatData, onlineUsers } = useChatContext();
    const { handleFriendProfile, showFriendProfile } = useGlobalContext();

    const { photo, lastSeen } = activeChatData || {};

    const isOnline = onlineUsers.find(
        (user: IUser) => user._id === activeChatData?._id
    );

    return (
        <div className="px-4 py-2 flex justify-between border-b-2 border-white dark:border-[#3C3C3C]/60">
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleFriendProfile(!showFriendProfile)}
            >
                <Image
                    src={photo}
                    alt="Profile Picture"
                    width={42}
                    height={42}
                    className="rounded-full aspect-square object-cover border-2 border-[white] dark:border-[#3C3C3C]/65 cursor-pointer
                    hover:scale-105 transition-transform duration-300 ease-in-out"
                />

                <div className="flex flex-col">
                    <h2 className="font-bold text-xl text-[#454e56] dark:text-white">
                        {activeChatData?.username}
                    </h2>
                    <p className="text-xs text-[#aaa]">
                        {isOnline ? "Online" : formatDateLastSeen(lastSeen)}
                    </p>
                </div>
            </div>
            <div></div>
            <div className="flex items-center gap-6 text-[#454e56] text-lg">
                <button className="p-1">{searchIcon}</button>
                <button className="p-1">{dots}</button>
            </div>
        </div>
    );
}

export default Header;
