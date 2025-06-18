"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/context/chatContext";
import { useUserContext } from "@/context/userContext";
import { send } from "@/utils/icons";
import EmojiPicker from "emoji-picker-react";
import useDetectOutsideClick from "@/hooks/useDetectOutsideClick";

function TextArea() {
    const { selectedChat, sendMessage, activeChatData } = useChatContext();
    const user = useUserContext().user;

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const emojieElemRef = useRef<HTMLDivElement>(null);

    const [message, setMessage] = useState("");
    const [toggleEmoji, setToggleEmoji] = useState(false);

    useDetectOutsideClick(emojieElemRef, setToggleEmoji);

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    const handleToggleEmoji = () => {
        setToggleEmoji(true);
    };

    // auto resize the textarea
    const autoResize = () => {
        const textarea = textAreaRef.current;

        if (textarea) {
            textarea.style.height = "auto"; //reset the height
            textarea.style.height = `${textarea.scrollHeight}px`; //set the height to the scrollHeight

            if (textarea.scrollHeight > 120) {
                textarea.style.overflowY = "auto";
                textarea.style.height = "120px";
            } else {
                textarea.style.overflowY = "hidden";
            }
        }
    };

    useEffect(() => {
        setToggleEmoji(false);
        setMessage("");
    }, [selectedChat]);

    useEffect(() => {
        autoResize();
    }, [message]);

    return (
        <form
            className="relative flex items-center"
            onSubmit={(e) => {
                e.preventDefault();
                sendMessage({
                    senderId: user?._id,
                    receiverId: activeChatData?._id,
                    content: message,
                    chatId: selectedChat?._id,
                });
                setMessage("");
            }}
        >
            <div className="relative flex-1">
                <textarea
                    className="textarea w-full pl-4 pr-10 py-3 border-2 rounded-[30px] border-white bg-[#F6F5F9] 
                            dark:bg-[#262626] dark:text-gray-100 text-[#12181b] dark:border-[#3C3C3C]/65 
                            shadow-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#ccc] 
                            focus:ring-opacity-50 transition duration-300 ease-in-out"
                    rows={1}
                    value={message}
                    ref={textAreaRef}
                    onChange={handleOnChange}
                ></textarea>
                <button
                    type="button"
                    className="absolute top-5 right-3 text-[#aaa] translate-y-[-50%] text-2xl"
                    onClick={handleToggleEmoji}
                >
                    🥹
                </button>
                {!message && (
                    <span className="absolute text-sm top-[46%] left-4 text-[#aaa] translate-y-[-50%] pointer-events-none">
                        Type a message...
                    </span>
                )}
            </div>
            <button
                type="submit"
                disabled={!message || !message.trim()}
                className="px-3 self-start py-2 w-12 h-12 bg-[#7263f3] text-white rounded-full ml-2 
                          hover:scale-105 transition-transform duration-300 ease-in-out shadow-sm"
            >
                {send}
            </button>
            {toggleEmoji && (
                <div ref={emojieElemRef} className="absolute right-0 bottom-[72px] z-10">
                    <EmojiPicker
                        width={360}
                        height={400}
                        onEmojiClick={(emojiObject) => {
                            setMessage((prev: string) => prev + emojiObject.emoji);
                        }}
                    />
                </div>
            )}
        </form>
    );
}

export default TextArea;
