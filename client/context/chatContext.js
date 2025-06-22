import axios from "../axios/config";
import { useEffect, useState, createContext, useContext, use } from "react";

import { useUserContext } from "./userContext";
import io from "socket.io-client";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
    // state
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [allChatsData, setAllChatsData] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [activeChatData, setActiveChatData] = useState({});
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [arrivedMessage, setArrivedMessage] = useState(null);

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

    // create a new chat
    const createChat = async (senderId, receiverId) => {
        try {
            const res = await axios.post("/chats", {
                senderId,
                receiverId,
            });

            // update the chats state
            setChats((prev) => [...prev, res.data.chat]);

            return res.data;
        } catch (error) {
            console.log("Error in createChat", error.message);
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

            // Emit the message to the socket server
            if (socket) {
                socket.emit("send message", {
                    senderId: data.senderId,
                    receiverId: activeChatData._id,
                    content: data.content,
                    chatId: data.chatId,
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // useEffect
    useEffect(() => {
        // prevent emitting the socket connection if user is not logged in
        if (!user || !user._id || Object.keys(user).length === 0) {
            // If user is not logged in, disconnect any existing socket
            if (socket) {
                console.log("User logged out or invalid, disconnecting socket");
                socket.disconnect();
                setSocket(null);
                setOnlineUsers([]);
            }
            return;
        }

        console.log("Creating socket connection for user:", user._id);
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
            transports: ["websocket"],
            withCredentials: true,
        });

        newSocket.on("connection", () => {
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected:", newSocket.id);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        // prevent emitting the socket connection if user is not logged in or socket is null
        if (!user || !socket || !user._id) return;

        console.log("Emitting add user with userId:", user._id);
        socket.emit("add user", user._id);

        // Listen for changes in connected users
        socket.on("get users", (connectedUsers) => {
            // fetch all online users
            const getOnlineUsers = async () => {
                try {
                    const usersOnline = await Promise.all(
                        connectedUsers.map(async (user) => {
                            const userData = await getUserById(user.userId);
                            return userData.user;
                        })
                    );

                    const filteredUsersOnline = usersOnline.filter(
                        (friend) =>
                            friend?._id !== userId &&
                            user?.friends?.includes(friend?._id)
                    );

                    setOnlineUsers(filteredUsersOnline);
                } catch (error) {
                    console.error("Error fetching online users:", error);
                }
            };

            getOnlineUsers();
        });

        // Listen for new messages
        socket.on("get message", (message) => {
            setArrivedMessage({
                senderId: message.senderId,
                content: message.content,
                createdAt: Date.now(),
            });
        });

        // Cleanup function to remove event listeners
        return () => {
            if (socket) {
                socket.off("get users");
                socket.off("get message");
            }
        };
    }, [user, socket]);

    useEffect(() => {
        if (arrivedMessage && selectedChat) {
            // Check if the arrived message is from the current chat
            if (
                selectedChat.participants.includes(arrivedMessage.senderId) &&
                arrivedMessage.senderId !== userId
            ) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    arrivedMessage,
                ]);
            }
        }
    }, [arrivedMessage, selectedChat, userId]);

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
                socket,
                onlineUsers,
                selectedChat,
                allChatsData,
                activeChatData,
                arrivedMessage,
                createChat,
                sendMessage,
                setMessages,
                getUserById,
                getUserChats,
                getAllMessages,
                getChatMessages,
                handleSelectedChat,
                setOnlineUsers,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    return useContext(ChatContext);
};
