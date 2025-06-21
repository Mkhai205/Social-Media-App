"use client";

import { useGlobalContext } from "@/context/globalContext";
import { useUserContext } from "@/context/userContext";
import {
    archive,
    chat,
    database,
    group,
    inbox,
    moon,
    sun,
} from "@/utils/icons";
import Image from "next/image";
import React, { useEffect } from "react";
import SearchInput from "../SearchInput/SearchInput";
import ChatItem from "../ChatItem/ChatItem";
import { useChatContext } from "@/context/chatContext";
import { IChat, IUser } from "@/types/type";
import SearchResults from "../SearchResults/SearchResults";
import FriendRequests from "../FriendRequests/FriendRequests";

const navButtons = [
    {
        id: 0,
        name: "All Chats",
        icon: inbox,
        slug: "all-chats",
    },
    {
        id: 1,
        name: "Archived",
        icon: archive,
        slug: "archived",
    },
    {
        id: 2,
        name: "Requests",
        icon: group,
        slug: "requests",
        notification: true,
    },
];

function Sidebar() {
    const [activeNav, setActiveNav] = React.useState(navButtons[0].id);

    const { user, updateUser, searchResults } = useUserContext();
    const {
        currentView,
        showProfile,
        handleViewChange,
        handleProfileToggle,
        handleFriendProfile,
    } = useGlobalContext();
    const { allChatsData, handleSelectedChat, selectedChat } = useChatContext();

    const { theme, photo, friendRequests } = user;

    const lightTheme = () => {
        updateUser({ theme: "light" });
    };

    const darkTheme = () => {
        updateUser({ theme: "dark" });
    };

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    return (
        <div className="w-[24rem] flex border-r-2 border-white dark:border-[#3C3C3C]/65">
            <div className="p-4 flex flex-col justify-between items-center border-r-2 border-white dark:border-[#3C3C3C]/65">
                <div className="profile flex -flex-col items-center">
                    {photo && (
                        <Image
                            src={photo}
                            alt="Profile Picture"
                            width={50}
                            height={50}
                            onClick={() => handleProfileToggle(true)}
                            className="aspect-square rounded-full object-cover border-2 border-white dark:border-[#3C3C3C]/65 
                                cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out shadow-sm select-text"
                        />
                    )}
                </div>
                <div className="relative py-4 px-3 flex flex-col items-center gap-8 border-2 rounded-3xl border-white dark:border-[#3C3C3C]/65 shadow-sm">
                    {navButtons.map((btn, index: number) => {
                        return (
                            <button
                                key={btn.id}
                                className={`${
                                    activeNav === index ? "active-nav" : ""
                                } relative p-1 flex items-center text-slate-800 dark:text-slate-200`}
                                onClick={() => {
                                    setActiveNav(btn.id);
                                    handleViewChange(btn.slug);
                                    handleProfileToggle(false);
                                }}
                            >
                                {btn.icon}
                                {btn?.notification && (
                                    <span
                                        className="absolute -top-2 right-0 w-4 h-4 bg-[#f00] text-white text-xs 
                                                    flex rounded-full items-center justify-center"
                                    >
                                        {friendRequests?.length > 0
                                            ? friendRequests.length
                                            : 0}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div
                    className="px-3 py-4 text-slate-800 dark:text-slate-200 flex flex-col items-center gap-2 
                                text-left rounded-3xl border-2 border-white dark:border-[#3C3C3C]/65"
                >
                    <button
                        className={`${
                            theme === "light" ? "gradient-text" : ""
                        }`}
                        onClick={lightTheme}
                    >
                        {sun}
                    </button>
                    <span className="w-full h-[2px] bg-white dark:bg-[#3C3C3C]/65"></span>
                    <button
                        className={`${theme === "dark" ? "gradient-text" : ""}`}
                        onClick={darkTheme}
                    >
                        {moon}
                    </button>
                </div>
            </div>
            <div className="py-4 flex-1">
                <h2
                    className={`px-4 font-bold text-2xl text-center ${
                        theme === "dark" ? "text-white" : "gradient-text"
                    }`}
                >
                    Messages
                </h2>
                <div className="px-4 mt-2">
                    <SearchInput />
                </div>

                {searchResults?.data?.length > 0 && (
                    <div className="mt-4 rounded-lg overflow-hidden animate-fadeIn">
                        <h4
                            className={`px-4 py-2 grid grid-cols-[22px_1fr] items-center font-bold ${
                                theme === "dark"
                                    ? "text-white bg-[#292929]/50"
                                    : "gradient-text bg-blue-50"
                            }`}
                        >
                            <span className="text-lg">{database}</span>
                            <span>Search Results</span>
                        </h4>
                        <div className="max-h-[240px] overflow-y-auto">
                            <SearchResults />
                        </div>
                    </div>
                )}

                {currentView === "all-chats" && (
                    <div className="mt-6">
                        <h4
                            className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold ${
                                theme === "dark"
                                    ? "text-white"
                                    : "gradient-text"
                            }`}
                        >
                            {chat}
                            <span>All Chats</span>
                        </h4>

                        <div className="mt-2">
                            {allChatsData.map((chat: IChat) => {
                                return (
                                    <React.Fragment key={chat._id}>
                                        {chat?.participantsData?.map(
                                            (participant: IUser) => {
                                                return (
                                                    <ChatItem
                                                        key={participant._id}
                                                        user={participant}
                                                        active={
                                                            !showProfile &&
                                                            selectedChat?._id ===
                                                                chat._id
                                                        }
                                                        chatId={chat._id}
                                                        onClick={() => {
                                                            handleProfileToggle(
                                                                false
                                                            );
                                                            handleSelectedChat(
                                                                chat
                                                            );
                                                        }}
                                                    />
                                                );
                                            }
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentView === "archived" && (
                    <div className="mt-8">
                        <h4
                            className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold gradient-text dark:text-slate-200`}
                        >
                            <span>{archive}</span> <span>Archived</span>
                        </h4>
                        <div className="mt-2">
                            <p className="px-4 py-2 text-[#454e56] dark:text-white/65">
                                No archived chats
                            </p>
                        </div>
                    </div>
                )}

                {currentView === "requests" && (
                    <div className="mt-8">
                        <h4
                            className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold gradient-text dark:text-slate-200`}
                        >
                            <span className="w-[20px]">{group}</span>
                            <span>Friend Requests</span>
                        </h4>

                        <div className="mt-2">
                            {friendRequests?.length > 0 ? (
                                <FriendRequests />
                            ) : (
                                <p className="px-4 py-2 text-[#454e56] dark:text-white/65">
                                    There are no friend requests
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
