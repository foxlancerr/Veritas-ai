import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  acceptConnection,
  rejectConnection,
  sendConnection,
  getConnectionStatus,
  removeConnection,
  getConnectionRequest,
  getUserConnections,
} from "../controllers/connection.controller.js";
const connectionRouter = express.Router();
connectionRouter.post("/send/:id", isAuth, sendConnection);
connectionRouter.put("/accept/:connectionId", isAuth, acceptConnection);
connectionRouter.put("/reject/:connectionId", isAuth, rejectConnection);
connectionRouter.get("/get-status/:userId", isAuth, getConnectionStatus);
connectionRouter.delete("/remove/:userId", isAuth, removeConnection);
connectionRouter.get("/requests", isAuth, getConnectionRequest);
connectionRouter.get("/", isAuth, getUserConnections);

export default connectionRouter;
