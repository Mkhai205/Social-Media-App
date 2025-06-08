"use client";
import React from "react";
import { UserContextProvider } from "../context/userContext";
import { GlobalContextProvider } from "../context/globalContext";
import { ChatContextProvider } from "../context/chatContext";

interface Props {
    children: React.ReactNode;
}

function UserProvider({ children }: Props) {
    return (
        <UserContextProvider>
            <GlobalContextProvider>
                <ChatContextProvider>{children}</ChatContextProvider>
            </GlobalContextProvider>
        </UserContextProvider>
    );
}

export default UserProvider;
