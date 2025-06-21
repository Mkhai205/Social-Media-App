import { createContext, useState, useContext } from "react";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    const [currentView, setCurrentView] = useState("all-chats");
    const [showFriendProfile, setShowFriendProfile] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const handleProfileToggle = (show) => {
        setShowProfile(show);
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleFriendProfile = (show) => {
        setShowFriendProfile(show);
    };

    return (
        <GlobalContext.Provider
            value={{
                showProfile,
                currentView,
                showFriendProfile,
                handleViewChange,
                handleFriendProfile,
                handleProfileToggle,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
