export const VITE_BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const VITE_BACKEND_WEB_SOCKET_URI = VITE_BACKEND_API_URL.replace(
  "/api",
  "",
);
