import type { Metadata } from "next";
const inter = Inter({ subsets: ["latin"] });
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import UserProvider from "@/providers/UserProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Messages App",
    description: "A simple chat application built with Next.js, React, and TypeScript",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
                    integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </head>
            <body className={inter.className}>
                <Toaster position="top-center" />
                <UserProvider>{children}</UserProvider>
            </body>
        </html>
    );
}
