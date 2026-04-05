import cors from "cors";

export const allowCors = (app) => {
  app.use(
    cors({
      origin: "http://localhost:5173", // Your React/Vite dev server URL
      credentials: true, // Allow cookies/auth headers if needed
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
};
