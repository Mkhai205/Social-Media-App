import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/controllers/auth/errorHandler.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import User from "./src/models/auth/UserModel.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
});

// middlewares
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the public directory
app.use("/public", express.static("./src/public"));

// Error handling middleware
app.use(errorHandler);

// Socket.io connection
let users = [];

const addUser = (userId, socketId) => {
    // Don't add user if userId is null, undefined, or empty
    if (!userId) {
        console.log("Attempted to add user with invalid userId:", userId);
        return false;
    }

    // Check if user already exists, if so update their socketId
    const existingUserIndex = users.findIndex((user) => user.userId === userId);
    if (existingUserIndex !== -1) {
        users[existingUserIndex].socketId = socketId;
        return true;
    }

    // Add new user
    users.push({ userId, socketId });
    return true;
};

const removeUser = async (socketId) => {
    const user = users.find((user) => user.socketId === socketId);

    if (user) {
        const updatedUser = await User.findByIdAndUpdate(user.userId, {
            lastSeen: new Date(),
        });
        users = users.filter((user) => user.socketId !== socketId);
    }
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // You can add more event listeners here for real-time features
    socket.on("add user", (userId) => {
        console.log(
            "Received add user request for userId:",
            userId,
            "socketId:",
            socket.id
        );

        const success = addUser(userId, socket.id);
        if (success) {
            console.log("---------------------------------------------");
            console.log(
                "User added successfully:",
                userId,
                "Socket:",
                socket.id
            );
            console.log("Current users:", users);
            console.log("---------------------------------------------");
            // emit to all connected clients
            io.emit("get users", users);
        } else {
            console.log("---------------------------------------------");
            console.log("Failed to add user - invalid userId:", userId);
            console.log("---------------------------------------------");
        }
    });

    // Handle send and get messages
    socket.on("send message", ({ senderId, receiverId, content }) => {
        console.log("Received message from:", senderId, "to:", receiverId);
        const receiver = getUser(receiverId);
        if (receiver) {
            console.log("Receiver found:", receiver);
            io.to(receiver.socketId).emit("get message", {
                senderId,
                content,
                createdAt: Date.now(),
            });
        } else {
            console.log("Receiver not found for userId:", receiverId);
        }
    });

    // Handle user disconnect
    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
        await removeUser(socket.id);
        console.log("Current users after disconnect:", users);
        // emit updated user list to all connected clients
        io.emit("get users", users);
    });
});

// routes
const routesFiles = fs.readdirSync("./src/routes");

routesFiles.forEach((file) => {
    if (file.endsWith(".js")) {
        // Dynamically import the route file
        import(`./src/routes/${file}`)
            .then((routeModule) => {
                const route = routeModule.default;
                app.use("/api/v1", route);
            })
            .catch((error) => {
                console.error(`Error loading route ${file}:`, error);
            });
    }
});

const server = async () => {
    try {
        // Connect to the database
        await connectDB();

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
};

server();
