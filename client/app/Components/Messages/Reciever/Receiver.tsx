"use client";
import { useChatContext } from "@/context/chatContext";
import { formatDateBasedOnTime } from "@/utils/date";
import Image from "next/image";
import React from "react";

interface IReceiver {
    messageId: string;
    content: string;
    createdAt: string;
}

function Receiver({ messageId, content, createdAt }: IReceiver) {
    const { activeChatData } = useChatContext();
    const { photo, username } = activeChatData || {};
    return (
        <div className="mb-2">
            <div className="flex gap-3">
                <Image
                    src={photo}
                    alt="Profile Picture"
                    width={40}
                    height={40}
                    className="rounded-full aspect-square object-cover self-start border-2 border-[white] 
                                cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out shadow-sm"
                />

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                        <h4 className="font-bold text-[#454e56] dark:text-gray-200">
                            {username}
                        </h4>
                        <p className="pt-[2px] text-[#aaa] text-xs">
                            {formatDateBasedOnTime(createdAt)}
                        </p>
                    </div>
                    <p
                        className="py-[0.25rem] max-w-[360px] w-full self-start px-4 border-2 rounded-tr-[30px] 
                        rounded-br-[30px] rounded-bl-[30px] border-white bg-[#F6F5F9] dark:bg-[#f56693] 
                        dark:border-[#f56693] text-[#12181b] dark:text-white shadow-sm break-words whitespace-pre-wrap"
                    >
                        {content}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Receiver;
