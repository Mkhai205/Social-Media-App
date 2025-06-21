import axios from "../axios/config";
import { useEffect, useState, createContext, useContext } from "react";

import { useUserContext } from "./userContext";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
    // state
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [allChatsData, setAllChatsData] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [activeChatData, setActiveChatData] = useState({});

    const { user } = useUserContext();

    const userId = user?._id;

    const getUserById = async (userId) => {
        try {
            if (!userId) {
                console.error("User ID is required to fetch user data.");
                return null;
            }

            const response = await axios.get(`/users/${userId}`);

            return response.data;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
        }
    };

    // fetch user chats
    const getUserChats = async (userId) => {
        try {
            if (!userId) {
                console.error("User ID is required to fetch user chats.");
                return [];
            }

            const response = await axios.get(`/chats/${userId}`);

            setChats(response.data.chats);
        } catch (error) {
            console.error("Error fetching user chats:", error);
        }
    };

    // fetch messages for a specific chat
    const getChatMessages = async (
        chatId,
        limit = 15,
        offset = 0,
        sort = "asc"
    ) => {
        try {
            if (!chatId) {
                console.error("Chat ID is required to fetch messages.");
                return [];
            }

            const response = await axios.get(`/messages/${chatId}`, {
                params: {
                    limit,
                    offset,
                    sort,
                },
            });

            setMessages(response?.data?.messages || []);
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const getAllMessages = async (
        chatId,
        limit = 15,
        offset = 0,
        sort = "asc"
    ) => {
        try {
            if (!chatId) {
                console.error("Chat ID is required to fetch all messages.");
                return [];
            }

            const response = await axios.get(`/messages/${chatId}`, {
                params: { limit, offset, sort },
            });

            return response?.data?.messages;
        } catch (error) {
            console.error("Error fetching all chat messages:", error);
        }
    };

    // fetch all chats data
    const getAllChatsData = async () => {
        try {
            const updatedChats = await Promise.all(
                chats.map(async (chat) => {
                    const participantsData = await Promise.all(
                        chat.participants
                            .filter((participant) => participant !== userId)
                            .map(async (participant) => {
                                const userData = await getUserById(participant);
                                return userData.user;
                            })
                    );

                    return {
                        ...chat,
                        participantsData: participantsData,
                    };
                })
            );

            setAllChatsData(updatedChats);
        } catch (error) {
            console.error("Error fetching all chats:", error);
        }
    };

    const handleSelectedChat = async (chat) => {
        setSelectedChat(chat);

        setActiveChatData(chat.participantsData[0] || {});
    };

    const sendMessage = async (data) => {
        try {
            const response = await axios.post(`/messages`, data);

            // Update the messages state with the new message
            setMessages((prevMessages) => [
                ...prevMessages,
                response?.data?.message,
            ]);

            // update the chats state
            setChats((prevChats) => {
                const updatedChats = prevChats.map((chat) => {
                    if (chat._id === data.chatId) {
                        return {
                            ...chat,
                            lastMessage: response?.data?.message,
                            updatedAt: new Date().toISOString(),
                        };
                    }

                    return chat;
                });

                //move the chat to the top of the list
                updatedChats.sort((a, b) => {
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });

                return updatedChats;
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            getUserChats(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (chats && user) {
            getAllChatsData();
        }
    }, [chats, user]);

    useEffect(() => {
        if (selectedChat) {
            getChatMessages(selectedChat._id);
        }
    }, [selectedChat]);

    return (
        <ChatContext.Provider
            value={{
                chats,
                messages,
                selectedChat,
                allChatsData,
                activeChatData,
                sendMessage,
                setMessages,
                getUserById,
                getUserChats,
                getAllMessages,
                getChatMessages,
                handleSelectedChat,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    return useContext(ChatContext);
};
