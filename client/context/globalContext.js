import React from "react";

const GlobalContext = React.createContext();

export const GlobalContextProvider = ({ children }) => {
    const [currentView, setCurrentView] = React.useState("all-chats");
    const [showFriendProfile, setShowFriendProfile] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);

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
                currentView,
                showFriendProfile,
                showProfile,
                handleProfileToggle,
                handleViewChange,
                handleFriendProfile,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return React.useContext(GlobalContext);
};
