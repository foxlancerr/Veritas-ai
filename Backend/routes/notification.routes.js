import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  clearAllNotification,
  deleteNotification,
  getNotifications,
} from "../controllers/notification.controllers.js";
const notificationRouter = express.Router();

notificationRouter.get("/get-notifications", isAuth, getNotifications);
notificationRouter.delete("/delete-single/:id", isAuth, deleteNotification);
notificationRouter.delete("/delete-all", isAuth, clearAllNotification);

export default notificationRouter;
