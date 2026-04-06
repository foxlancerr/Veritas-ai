// src/utils/api.ts
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_BACKEND_API_URL } from "./url_helper";

// Create axios instance
const apiHelpers = axios.create({
  baseURL: VITE_BACKEND_API_URL, // your API base URL
  timeout: 10000, // optional
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiHelpers.interceptors.request.use(
  (config) => {
    // Inject auth token if available
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  },
);

// Response interceptor
apiHelpers.interceptors.response.use(
  (response) => {
    // You can transform the response here if needed
    return response.data; // directly return data
  },
  (error) => {
    
    // Global error handling
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        console.log("Unauthorized, redirecting to login...");
      } else if (status === 403) {
        console.log("Forbidden request");
      } else if (status >= 500) {
        console.log("Server error");
      }
      toast.error(data.message || "An error occurred");

      return Promise.reject(data);
    } else if (error.request) {
      console.log("No response received from server");
      return Promise.reject({ message: "No response from server" });
    } else {
      console.log("Axios error", error.message);
      return Promise.reject({ message: error.message });
    }
  },
);

export default apiHelpers;
