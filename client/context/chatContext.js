import React from "react";
import axios from "axios";
import { useUserContext } from "./userContext";

const ChatContext = React.createContext();

const serverUrl = "http://localhost:8282/";

export const ChatContextProvider = ({ children }) => {
    // state
    const [chats, setChats] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [allChatsData, setAllChatsData] = React.useState([]);
    const [selectedChat, setSelectedChat] = React.useState(null);
    const [activeChatData, setActiveChatData] = React.useState({});

    const { user } = useUserContext();

    const userId = user?._id;

    const getUserById = async (userId) => {
        try {
            if (!userId) {
                console.error("User ID is required to fetch user data.");
                return null;
            }

            const response = await axios.get(`${serverUrl}api/v1/users/${userId}`);

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

            const response = await axios.get(`${serverUrl}api/v1/chats/${userId}`);

            setChats(response.data.chats);
        } catch (error) {
            console.error("Error fetching user chats:", error);
        }
    };

    // fetch messages for a specific chat
    const getChatMessages = async (chatId, limit = 15, offset = 0, sort = "asc") => {
        try {
            if (!chatId) {
                console.error("Chat ID is required to fetch messages.");
                return [];
            }

            const response = await axios.get(`${serverUrl}api/v1/messages/${chatId}`, {
                params: { limit, offset, sort },
            });

            setMessages(response?.data?.messages || []);
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const getAllMessages = async (chatId, limit = 15, offset = 0, sort = "asc") => {
        try {
            if (!chatId) {
                console.error("Chat ID is required to fetch all messages.");
                return [];
            }

            const response = await axios.get(`${serverUrl}api/v1/messages/${chatId}`, {
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
            const response = await axios.post(`${serverUrl}api/v1/messages`, data);

            // Update the messages state with the new message
            setMessages((prevMessages) => [...prevMessages, response?.data?.message]);

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

    React.useEffect(() => {
        if (userId) {
            getUserChats(userId);
        }
    }, [userId]);

    React.useEffect(() => {
        if (chats && user) {
            getAllChatsData();
        }
    }, [chats, user]);

    React.useEffect(() => {
        if (selectedChat) {
            getChatMessages(selectedChat._id);
        }
    }, [selectedChat]);

    console.log("ChatContextProvider rendered with chats:", chats);

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
    return React.useContext(ChatContext);
};
