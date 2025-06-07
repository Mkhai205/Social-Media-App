"use client";
import useRedirect from "@/hooks/useUserRedirect";
import Sidebar from "./Components/Sidebar/Sidebar";
import { useGlobalContext } from "@/context/globalContext";
import Header from "./Components/Messages/Header/Header";
import Body from "./Components/Messages/Body/Body";
import TextArea from "./Components/Messages/TextArea/TextArea";
import Profile from "./Components/Profile/Profile";

export default function Home() {
    useRedirect("/login");

    const { currentView, showFriendProfile, showProfile } = useGlobalContext();

    return (
        <div className="relative px-40 py-10 h-full">
            <main
                className="h-full flex backdrop-blur-sm rounded-3xl border-white/65 dark:bg-[#262626]/90 border-2 
                        border-white dark:border-[#3C3C3C]/65 shadow-sm overflow-hidden"
            >
                <Sidebar />
                <div className="flex-1 flex">
                    <div className="relative flex-1 border-r-2 border-white dark:border-[#3C3C3C]/65">
                        {!showProfile && <Header />}
                        {!showProfile && <Body />}
                        <div className="absolute flex flex-col w-full px-4 pb-4 left-0 bottom-0">
                            {!showProfile && <TextArea />}
                        </div>

                        {showProfile && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Profile />
                            </div>
                        )}
                    </div>
                    <div className="w-[30%]"></div>
                </div>
            </main>
        </div>
    );
}
