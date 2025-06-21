import { useUserContext } from "@/context/userContext";
import { IUser } from "@/types/type";
import { addFriend, pending, userCheck } from "@/utils/icons";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

function SearchResults() {
    const { searchResults, sendFriendRequest } = useUserContext();
    const userId = useUserContext().user?._id;

    const [requests, setRequests] = useState({});

    const handleFriendRequest = async (recipientId: string) => {
        await sendFriendRequest(recipientId);

        //update the local state to show the request sent
        setRequests((prev) => ({ ...prev, [recipientId]: true }));
    };

    return (
        <div>
            {searchResults?.data?.map((user: IUser) => {
                const { friends, friendRequests } = user;
                const isFriend = friends?.find((friend) => friend === userId);
                const requestSent =
                    friendRequests.find((friend) => friend === userId) ||
                    // @ts-ignore
                    requests[user._id];

                return (
                    <div
                        key={user?._id}
                        className="w-full flex justify-between items-center p-4 border-b-2 border-white 
                                    dark:border-[#3C3C3C]/60 hover:bg-blue-50 dark:hover:bg-white/5 
                                    transition-all duration-300 ease-in-out cursor-pointer"
                    >
                        <div className="flex gap-3">
                            <Image
                                src={user?.photo}
                                alt="profile"
                                width={42}
                                height={42}
                                className="rounded-full aspect-square object-cover cursor-pointer
                                            hover:scale-105 transition-transform duration-300 ease-in-out"
                            />

                            <div>
                                <h3 className="font-medium">
                                    {user?.username}
                                </h3>
                                <p className="text-[#aaa] text-sm">
                                    {friends.length === 1
                                        ? `${friends.length} friend`
                                        : `${friends.length} friends`}
                                </p>
                            </div>
                        </div>
                        <div>
                            {isFriend ? (
                                <button
                                    className="flex justify-center items-center bg-[#454e56] 
                                        text-white px-4 py-2 h-[2.5rem] w-[2.5rem] rounded-full"
                                    onClick={() => {
                                        toast.success("Already a friend!");
                                    }}
                                >
                                    {userCheck}
                                </button>
                            ) : (
                                <button
                                    className="flex justify-center items-center bg-[#7263f3] text-white 
                                        px-4 py-2 h-[2.4rem] w-[2.4rem] rounded-full hover:scale-105 transition-transform 
                                        duration-300 ease-in-out"
                                    onClick={() =>
                                        handleFriendRequest(user._id)
                                    }
                                >
                                    {requestSent ? pending : addFriend}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SearchResults;
