"use client";
import React from "react";
import { UserContextProvider } from "../context/userContext";
import { GlobalContextProvider } from "../context/globalContext";

interface Props {
    children: React.ReactNode;
}

function UserProvider({ children }: Props) {
    return (
        <UserContextProvider>
            <GlobalContextProvider>{children}</GlobalContextProvider>
        </UserContextProvider>
    );
}

export default UserProvider;
