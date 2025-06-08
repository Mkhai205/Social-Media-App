import axios from 'axios';

const baseUrl = "http://localhost:8282";

const api = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            console.error("Unauthorized access - redirecting to login");
            window.location.href = "/login";
        } else {
            console.error("API error:", error);
        }
        return Promise.reject(error);
    }
);

export default api;



