import axios from "axios";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

const api = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Include credentials for cross-origin requests
    timeout: 10000, // Set a timeout for requests
    paramsSerializer: (params) => {
        return new URLSearchParams(params).toString(); // Serialize query parameters
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // No need to add token manually as cookies are automatically sent with requests
        // when 'withCredentials: true' is set
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => {
        // You can handle successful responses here
        // For example, if your API returns refreshed tokens in response headers
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only redirect to login if not already on an auth-related page
            const currentPath =
                typeof window !== "undefined" ? window.location.pathname : "";
            const authPaths = [
                "/login",
                "/register",
                "/forgot-password",
                "/reset-password",
            ];

            // Check if current path is already an auth-related path
            const isAuthPath = authPaths.some((path) =>
                currentPath.startsWith(path)
            );

            if (!isAuthPath) {
                console.error("Unauthorized access - redirecting to login");
                window.location.href = "/login";
            } else {
                console.log(
                    "Unauthorized but already on auth page, not redirecting"
                );
            }
        } else if (error.response && error.response.status === 403) {
            // Handle forbidden access
            console.error("Access forbidden");
        } else {
            console.error("API error:", error);
        }
        return Promise.reject(error);
    }
);

// Define utility functions for cookie handling
const cookies = {
    // These functions won't be used directly since our server handles cookies
    // but might be useful for client-side operations related to cookies
    getCookie: (name) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    },
    isAuthenticated: () => {
        if (typeof document === "undefined") return false;
        return !!cookies.getCookie("token");
    },
};

export { cookies };
export default api;
