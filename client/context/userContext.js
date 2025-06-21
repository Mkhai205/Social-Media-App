import axios from "../axios/config";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState, useContext, createContext } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    // State
    const [user, setUser] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [userState, setUserState] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [searchResults, setSearchResults] = useState({});
    const [loading, setLoading] = useState(false);

    // Router
    const router = useRouter();

    // register user
    const registerUser = async (e) => {
        e.preventDefault();
        if (
            !userState.email.includes("@") ||
            !userState.password ||
            userState.password.length < 6
        ) {
            toast.error(
                "Please enter a valid email and password (min 6 characters)"
            );
            return;
        }

        try {
            const res = await axios.post("/register", userState);
            console.log("User registered successfully", res.data);
            toast.success("User registered successfully");

            // clear the form
            setUserState({
                username: "",
                email: "",
                password: "",
            });

            // redirect to login page
            router.push("/login");
        } catch (error) {
            console.log("Error registering user", error);
            toast.error(error.response.data.message);
        }
    };

    // login the user
    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/login", {
                email: userState.email,
                password: userState.password,
            });

            toast.success("User logged in successfully");

            // clear the form
            setUserState({
                email: "",
                password: "",
            });

            // refresh the user details
            await getUser(); // fetch before redirecting

            // push user to the dashboard page
            router.push("/");
        } catch (error) {
            console.log("Error logging in user", error);
            toast.error(error.response.data.message);
        }
    };

    // get user Logged in Status
    const userLoginStatus = async () => {
        let loggedIn = false;
        setLoading(true);
        try {
            const res = await axios.get("/login-status");

            // check if user is logged in
            loggedIn = !!res.data.isLoggedIn;
        } catch (error) {
            console.log("Error getting user login status", error);
        } finally {
            setLoading(false);
        }

        return loggedIn;
    };

    // logout user
    const logoutUser = async () => {
        try {
            const res = await axios.post("/logout");

            toast.success("User logged out successfully");

            // clear the user state
            setUser({});
            setAllUsers([]);
            setSearchResults({});
            setUserState({
                username: "",
                email: "",
                password: "",
            });

            // redirect to login page
            router.push("/login");
        } catch (error) {
            console.log("Error logging out user", error);
            toast.error(
                "Error logging out user: ",
                error.response.data.message
            );
        }
    };

    // get user details
    const getUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get("user");

            setUser((prevState) => {
                return {
                    ...prevState,
                    ...res.data,
                };
            });

            setLoading(false);
        } catch (error) {
            console.log("Error getting user details", error);
            setLoading(false);
            toast.error(error.response.data.message);
        }
    };

    // update user details
    const updateUser = async (data) => {
        setLoading(true);

        try {
            const res = await axios.patch("user", data);

            console.log("🚀 -> userContext.js:149 -> updateUser -> res:", res);

            // update the user state
            setUser((prevState) => {
                return {
                    ...prevState,
                    ...res.data,
                };
            });

            toast.success("User updated successfully");
        } catch (error) {
            console.log("Error updating user details", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // email verification
    const emailVerification = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/verify-email");

            toast.success("Email verification sent successfully");
        } catch (error) {
            console.log("Error sending email verification", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // verify user/email
    const verifyUser = async (token) => {
        setLoading(true);
        try {
            const res = await axios.get(`verify-user/${token}`);

            toast.success("User verified successfully");

            // refresh the user details
            getUser();

            // redirect to home page
            router.push("/");
        } catch (error) {
            console.log("Error verifying user", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // forgot password email
    const forgotPasswordEmail = async (email) => {
        setLoading(true);

        try {
            const res = await axios.post("/forgot-password");

            toast.success("Forgot password email sent successfully");
        } catch (error) {
            console.log("Error sending forgot password email", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // reset password
    const resetPassword = async (token, password) => {
        setLoading(true);

        try {
            const res = await axios.post(`/reset-password/${token}`, {
                password,
            });

            toast.success("Password reset successfully");
            // redirect to login page
            router.push("/login");
        } catch (error) {
            console.log("Error resetting password", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // change password
    const changePassword = async (currentPassword, newPassword) => {
        setLoading(true);

        try {
            const res = await axios.patch("/change-password", {
                currentPassword,
                newPassword,
            });

            toast.success("Password changed successfully");
        } catch (error) {
            console.log("Error changing password", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // admin routes
    const getAllUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("users");

            setAllUsers(res.data);
        } catch (error) {
            console.log("Error getting all users", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // dynamic form handler
    const handlerUserInput = (name) => (e) => {
        const value = e.target.value;

        setUserState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // delete user
    const deleteUser = async (id) => {
        setLoading(true);
        try {
            const res = await axios.delete(`/admin/users/${id}`);

            toast.success("User deleted successfully");

            // refresh the users list
            getAllUsers();
        } catch (error) {
            console.log("Error deleting user", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // search users
    const searchUsers = async (query, page = 1, limit = 5) => {
        setLoading(true);
        try {
            const res = await axios.get("/search-users", {
                params: {
                    q: query,
                    page,
                    limit,
                },
            });

            setSearchResults(res.data);
        } catch (error) {
            console.log("Error searching users", error);
            toast.error(error.response);
        } finally {
            setLoading(false);
        }
    };

    // send friend request
    const sendFriendRequest = async (friendId) => {
        setLoading(true);
        try {
            const res = await axios.post("/friend-request", { friendId });

            toast.success("Friend request sent successfully");
        } catch (error) {
            console.log("Error sending friend request", error.response);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // accept friend request
    const acceptFriendRequest = async (friendId) => {
        setLoading(true);
        try {
            const res = await axios.patch("/friend/accept", {
                friendId,
            });

            toast.success("Friend request accepted successfully");

            // refresh the user details
            await getUser();
        } catch (error) {
            console.log("Error accepting friend request", error.response);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loginStatusGetUser = async () => {
            const isLoggedIn = await userLoginStatus();

            if (isLoggedIn) {
                await getUser();
            }
        };

        loginStatusGetUser();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                allUsers,
                userState,
                searchResults,
                loginUser,
                logoutUser,
                updateUser,
                verifyUser,
                deleteUser,
                searchUsers,
                registerUser,
                resetPassword,
                changePassword,
                userLoginStatus,
                handlerUserInput,
                setSearchResults,
                emailVerification,
                sendFriendRequest,
                acceptFriendRequest,
                forgotPasswordEmail,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};
